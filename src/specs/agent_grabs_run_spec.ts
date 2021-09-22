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

async function postToGetRun(agentParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/get-run')
    .send(agentParams)
    .set('Content-Type', 'application/json');
  return response;
}


describe('Agent grabs Run', () => {
  const acceptableTimeInterval = 1000;
  let agent: IAgent;
  let autoTest: IAutoTest;
  let run1: IRun;
  let run2: IRun;

  beforeEach(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    agent = new Agent({name: 'AGENT_100500'});
    // I want to emulate a situation where Agent was active a long time ago
    // --------------------------------------------------   in a galaxy far far away
    agent.lastActiveAt = new Date('2001-01-01');
    await agent.save();

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
    // "some time" could vary, bringing about
    // a number of cases I'll cover in this spec
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  afterAll(async () => {
    run2;
    return db.close();
  });

  it('can grab Run', async () => {
    const response = await postToGetRun({agentId: agent._id})

    run1 = await refreshRun(run1);
    agent = await refreshAgent(agent);

    expect(response.status).toEqual(200);
    expect(response.body.runId == run1._id).toBe(true);
    expect(run1.executionStatus).toEqual('pending');
    expect(run1.availability).toEqual('taken');
    expect(run1.agent).toEqual(agent._id);
    expect(millisecondsSince(agent.lastActiveAt)).toBeLessThan(acceptableTimeInterval);
  });

  it('returns nothing if there are no Runs to grab', async () => {
    run1.availability = RunAvailability.taken;
    await run1.save();
    
    const response = await postToGetRun({agentId: agent._id});
    agent = await refreshAgent(agent);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({});
    expect(millisecondsSince(agent.lastActiveAt)).toBeLessThan(acceptableTimeInterval);
  });
})

