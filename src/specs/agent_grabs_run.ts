import { app } from '../app';
import db from '../database/connection';
import { Agent } from '../models/agent';
import { IAgent } from '../types/agent';
import request from 'supertest';
// import { millisecondsSince } from '../util/milliseconds_since'
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

  // const acceptableTimeInterval = 1000;
  let agent: IAgent;
  let autoTest: IAutoTest;
  let run1: IRun;
  let run2: IRun;

  beforeEach(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    agent = new Agent({name: 'AGENT_100500'});
    await agent.save();

    autoTest = new AutoTest({
      name: '',
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
    await agent.remove();
    await autoTest.remove();
    await run1.remove();
    await run2.remove();
    return db.close();
  });

  it('can grab Run', async () => {
    const response = await postToGetRun({agentId: agent._id})

    expect(response.status).toEqual(200);
    expect(response.body.runId).toEqual(run1._id);
  });
})

