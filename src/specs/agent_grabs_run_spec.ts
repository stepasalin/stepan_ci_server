import { app } from '../app';
import db from '../database/connection';
import { Agent } from '../models/agent';
import { IAgent } from '../types/agent';
import request from 'supertest';
import { millisecondsSince } from '../util/milliseconds_since'
import { IAutoTest } from '../types/auto_test';
import AutoTest from '../models/auto_test'
import { IRun, RunAvailability } from '../types/run';
import Run from '../models/run';
import { refreshRun, refreshAgent } from '../util/refresh_document';
import { fileExists } from '../util/fileExists';
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

async function setAgentLastActive(agent: IAgent, dateString: string) {
  agent.lastActiveAt = new Date(dateString);
  await agent.save();
}

describe('Agent grabs Run', () => {
  const acceptableTimeInterval = 1000;
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

    agent = new Agent({name: 'AGENT_100500'});
    // I want to emulate a situation where Agent was active a long time ago
    // --------------------------------------------------   in a galaxy far far away
    await setAgentLastActive(agent, '2001-01-01');

    autoTest = new AutoTest({
      name: 'blah blah whatevs',
      description: 'for auto test, normally you should not see this id DB',
      runCmd: 'ls -la'
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

  it('can grab Run and append Log', async () => {
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
    // to ensure appending logs also updated lastActiveAt
    await setAgentLastActive(agent, '2001-01-01');
    const responseToAppendLog1 = await postToAppendLog(
      {agentId: agent._id, runId: run1._id, newLogContent: logstring1}
    )
    expect(responseToAppendLog1.status).toEqual(200);
    expect(readFileSync(run1.logPath,'utf-8')).toEqual(logstring1);

    const responseToAppendLog2 = await postToAppendLog(
      {agentId: agent._id, runId: run1._id, newLogContent: logstring2}
    )
    expect(responseToAppendLog2.status).toEqual(200);
    expect(readFileSync(run1.logPath,'utf-8')).toEqual(logstring1 + logstring2);
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

