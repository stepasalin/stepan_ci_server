import { app } from '../app';
import db from '../database/connection';
import { Agent } from '../models/agent';
import { IAgent } from '../types/agent';
import request from 'supertest';
import { millisecondsSince } from '../util/milliseconds_since'
import { IAutoTest } from '../types/auto_test';
import AutoTest from '../models/auto_test'
import { IRun } from '../types/run';
import Run from '../models/run';

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
    console.log(run2);
    return db.close();
  });

  it('can grab Run', async () => {
    const run1Id = run1._id;
    const agentId = agent._id;
    const response = await postToGetRun({agentId: agent._id})

    const run1After = await Run.findById(run1Id);
    if(run1After == null){
      throw new Error(`There should have been a Run with id ${run1Id}`);
    }
    const agentAfter = await Agent.findById(agentId);
    if(agentAfter == null){
      throw new Error(`There should have been an Agent with id ${agentId}`);
    }

    expect(response.status).toEqual(200);
    expect(response.body.runId == run1Id).toBe(true);
    expect(run1After.executionStatus).toEqual('pending');
    expect(run1After.availability).toEqual('taken');
    expect(run1After.agent == `${agent._id}`).toBe(true);
    expect(millisecondsSince(agentAfter.lastActiveAt)).toBeLessThan(acceptableTimeInterval);
  });

  // it('returns nothing if there are no Runs to grab', async () => {
  //   run1.availability = RunAvailability.taken;
  //   await run1.save();
    
  //   const response = await postToGetRun({agentId: agent._id});
  //   expect(response.status).toEqual(200);
  //   console.log(response.body);
  // });
})

