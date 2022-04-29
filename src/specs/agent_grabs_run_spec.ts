import { app } from '../app';
import db from '../database/connection';
import { Agent } from '../models/agent';
import AgentGroup from '../models/agent_group'
import { IAgentGroup } from '../types/agent_group'
import { IAgent } from '../types/agent';
import request from 'supertest';
import { millisecondsSince } from '../util/milliseconds_since'
import { IAutoTest } from '../types/auto_test';
import AutoTest from '../models/auto_test'
import { IRun, RunAvailability } from '../types/run';
import Run from '../models/run';
import { refreshRun, refreshAgent } from '../util/refresh_document';
import { fileExists } from '../util/fsStuff';
import { readFileSync } from 'fs-extra';

async function postToGetRun(agentParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/get-run')
    .send(agentParams)
    .set('Content-Type', 'application/json');
  return response;
}

async function postToAppendLog(appendLogParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/append-log')
    .send(appendLogParams)
    .set('Content-Type', 'application/json');
  return response;
}

async function postToUpdateRunStatus(runUpdateParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/upate-run-status')
    .send(runUpdateParams)
    .set('Content-Type', 'application/json');
  return response;
}

async function postToUpdateAgentStatus(agentUpdateParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/update-agent-status')
    .send(agentUpdateParams)
    .set('Content-Type', 'application/json');
  return response;
}



async function getRunCmd(runInfo: Record<string, unknown>) {
  const agentId = runInfo.agentId;
  const runId = runInfo.runId;
  const response = await request(app)
    .get(`/run-command?agentId=${agentId}&runId=${runId}`)
    .set('Content-Type', 'application/json');
  return response;
}

async function getRunLog(runId: string) {
  const response = await request(app)
    .get(`/run-log?runId=${runId}`);
  return response;
}

async function setAgentLastActive(agent: IAgent, dateString: string) {
  agent.lastActiveAt = new Date(dateString);
  await agent.save();
}

describe('Agent grabs Run', () => {
  const acceptableTimeInterval = 1000;
  let agentGroup: IAgentGroup;
  let agent: IAgent;
  let autoTest: IAutoTest;
  let run1: IRun;
  let run2: IRun;
  const logstring1 = "logString1 yatta-yarra \n";
  const logstring2 = "logString2 whatever \n";

  beforeEach(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    agentGroup = new AgentGroup({name: 'something'})
    await agentGroup.save()
    agent = new Agent({name: 'AGENT_100500', agentGroup: agentGroup._id});
    await agent.save();
    // I want to emulate a situation where Agent was active a long time ago
    // --------------------------------------------------   in a galaxy far far away
    await setAgentLastActive(agent, '2001-01-01');

    autoTest = new AutoTest({
      name: 'blah blah whatevs',
      description: 'for auto test, normally you should not see this id DB',
      runCmd: 'rspec run_the_goddamn_spec.rb',
      agentGroup: agentGroup._id
    });
    await autoTest.save();

    run1 = new Run({test: autoTest._id});
    await run1.save();
    run2 = new Run({test: autoTest._id});
    // run2 should not be saved just yet, we want to emulate the situation
    // where run2 was created some time after run1 started
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  afterAll(async () => {
    run2;
    return db.close();
  });

  it ('can grab Run and update it as success', async () => {
    await postToGetRun({agentId: agent._id})
    expect(run1.takenAt).toEqual(undefined)
    expect(run1.finishedAt).toEqual(undefined)
    await postToUpdateRunStatus(
      {agentId: agent._id, runId: run1._id, newExecutionStatus: 'inProgress'}
    );
    run1 = await refreshRun(run1);
    expect(run1.finishedAt).toEqual(undefined)
    expect(millisecondsSince(run1.takenAt)).toBeLessThan(acceptableTimeInterval);
    const takenAt = run1.takenAt
    await postToUpdateRunStatus(
      {agentId: agent._id, runId: run1._id, newExecutionStatus: 'success'}
    );
    run1 = await refreshRun(run1);
    expect(run1.takenAt).toEqual(takenAt)
    expect(millisecondsSince(run1.finishedAt)).toBeLessThan(acceptableTimeInterval);
  });

  it ('can grab Run and update it as failure', async () => {
    await postToGetRun({agentId: agent._id})
    expect(run1.takenAt).toEqual(undefined)
    expect(run1.finishedAt).toEqual(undefined)
    await postToUpdateRunStatus(
      {agentId: agent._id, runId: run1._id, newExecutionStatus: 'inProgress'}
    );
    run1 = await refreshRun(run1);
    expect(run1.finishedAt).toEqual(undefined)
    expect(millisecondsSince(run1.takenAt)).toBeLessThan(acceptableTimeInterval);
    const takenAt = run1.takenAt
    await postToUpdateRunStatus(
      {agentId: agent._id, runId: run1._id, newExecutionStatus: 'fail'}
    );
    run1 = await refreshRun(run1);
    expect(run1.takenAt).toEqual(takenAt)
    expect(millisecondsSince(run1.finishedAt)).toBeLessThan(acceptableTimeInterval);
  });

  it('can grab Run and append Log', async () => {
    expect(agent.status).toEqual('free');
    const responseToGetRun = await postToGetRun({agentId: agent._id})

    run1 = await refreshRun(run1);
    agent = await refreshAgent(agent);

    expect(responseToGetRun.status).toEqual(200);
    expect(millisecondsSince(agent.lastActiveAt)).toBeLessThan(acceptableTimeInterval);
    expect(responseToGetRun.body.runId == run1._id).toBe(true);
    expect(run1.executionStatus).toEqual('pending');
    expect(run1.availability).toEqual('taken');
    expect(run1.agent).toEqual(agent._id);
    expect(run1.logPath).toEqual(`./runLogs/${run1._id}.log`)
    expect(await fileExists(run1.logPath)).toBe(true);


    // again, let's send agent to the past 
    // to ensure updating agent status also updated lastActiveAt
    await setAgentLastActive(agent, '2001-01-01');
    const responseToUpdateAgentStatus = await postToUpdateAgentStatus({agentId: agent._id, newStatus: 'busy'})
    expect(responseToUpdateAgentStatus.status).toEqual(200);
    agent = await refreshAgent(agent);
    expect(agent.status).toEqual('busy');
    expect(millisecondsSince(agent.lastActiveAt)).toBeLessThan(acceptableTimeInterval);

    // again, let's send agent to the past 
    // to ensure appending logs also updated lastActiveAt
    await setAgentLastActive(agent, '2001-01-01');
    const responseToAppendLog1 = await postToAppendLog(
      {agentId: agent._id, runId: run1._id, newLogContent: logstring1}
    )
    expect(responseToAppendLog1.status).toEqual(200);
    expect(readFileSync(run1.logPath,'utf-8')).toEqual(logstring1);
    const responseToGetRunLog1 = await getRunLog(run1.id)
    expect(responseToGetRunLog1.text).toEqual(logstring1)

    const responseToAppendLog2 = await postToAppendLog(
      {agentId: agent._id, runId: run1._id, newLogContent: logstring2}
    )
    expect(responseToAppendLog2.status).toEqual(200);
    expect(readFileSync(run1.logPath,'utf-8')).toEqual(logstring1 + logstring2);
    const responseToGetRunLog2 = await getRunLog(run1.id)
    expect(responseToGetRunLog2.text).toEqual(logstring1 + logstring2)

    // again, let's send agent to the past 
    // to ensure changing status also updated lastActiveAt
    await setAgentLastActive(agent, '2001-01-01');
    const responseToRunStatusUpdate1 = await postToUpdateRunStatus(
      {agentId: agent._id, runId: run1._id, newExecutionStatus: 'inProgress'}
    );
    expect(responseToRunStatusUpdate1.status).toEqual(200);
    run1 = await refreshRun(run1);
    agent = await refreshAgent(agent);
    expect(run1.executionStatus).toEqual('inProgress');
    expect(millisecondsSince(agent.lastActiveAt)).toBeLessThan(acceptableTimeInterval);

     // again, let's send agent to the past 
    // to ensure getting runCmd also updated lastActiveAt
    await setAgentLastActive(agent, '2001-01-01');
    const responseToGetRunCmd = await getRunCmd({agentId: agent._id, runId: run1._id});
    expect(responseToGetRunCmd.status).toEqual(200);
    expect(responseToGetRunCmd.body).toEqual({runCmd: autoTest.runCmd});
    agent =  await refreshAgent(agent);
    expect(millisecondsSince(agent.lastActiveAt)).toBeLessThan(acceptableTimeInterval);
  });

  it('returns nothing if there are no Runs to grab and provides a Run as soon as it is available', async () => {
    run1.availability = RunAvailability.taken;
    await run1.save();
    
    const response1 = await postToGetRun({agentId: agent._id});
    agent = await refreshAgent(agent);

    expect(response1.status).toEqual(200);
    expect(response1.body).toEqual({});
    expect(millisecondsSince(agent.lastActiveAt)).toBeLessThan(acceptableTimeInterval);

    await run2.save();
    const response2 = await postToGetRun({agentId: agent._id});
    expect(response1.status).toEqual(200);
    // this should suffice because 
    // provided above is a
    // rigorous test for every response parameter
    expect(response2.body == {}).toBe(false);
  });
})

