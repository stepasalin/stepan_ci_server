// import { app } from '../app';
import db from '../database/connection';
import { Agent } from '../models/agent';
import { IAgent } from '../types/agent';
// import request from 'supertest';
// import { millisecondsSince } from '../util/milliseconds_since'
import { IAutoTest } from '../types/auto_test';
import AutoTest from '../models/auto_test'
import { IRun } from '../types/run';
import Run from '../models/run';

// async function postToAddAgent(agentParams: Record<string, unknown>) {
//   const response = await request(app)
//     .post('/add-agent')
//     .send(agentParams)
//     .set('Content-Type', 'application/json');
//   return response;
// }

describe('Agent grabs Run', () => {

  // const acceptableTimeInterval = 1000;
  let agent: IAgent;
  let autoTest: IAutoTest;
  let run1: IRun;
  let run2: IRun;

  beforeAll(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    agent = new Agent({name: 'AGENT_100500'});
    await agent.save();

    autoTest = new AutoTest({
      name: '',
      description: 'for auto test, ideally you should not see this id DB',
      runCmd: 'ls -la'
    });
    await autoTest.save();

    run1 = new Run({test: autoTest._id});
    run2 = new Run({test: autoTest._id});
  });

  afterAll(async () => {
    await agent.remove();
    await autoTest.remove();
    await run1.remove();
    await run2.remove();
    return db.close();
  });

  // it('can grab Run', async () => {
  //   const agentCountBefore = await Agent.countDocuments();
  //   const response = await postToAddAgent({name: agentCreatViaApiName})

  //   expect(response.status).toEqual(201);
  //   expect(response.body.message).toEqual('Agent added');
  //   expect(response.body.agent.status).toEqual('free');
  //   expect(response.body.agent.name).toEqual(agentCreatViaApiName);
  //   const lastActiveAt = new Date(response.body.agent.lastActiveAt);
  //   expect(millisecondsSince(lastActiveAt)).toBeLessThan(acceptableTimeInterval);
  //   const newAgentId = response.body.agent._id
  //   newAgent = await Agent.findById(newAgentId);
  //   if (newAgent == null){
  //     throw new Error(`Agent with id ${newAgentId} was not found in DB`);
  //   }
  //   const agentCountAfter = await Agent.countDocuments();
  //   expect(agentCountAfter).toEqual(agentCountBefore + 1);
  // });

  // it('cannot register another agent with the same name', async () =>{
  //   const agentCountBefore = await Agent.countDocuments();
  //   const response = await postToAddAgent({name: agentAlreadyInDbName})
  //   const agentCountAfter = await Agent.countDocuments();
  //   expect(response.status).toEqual(422);
  //   expect(response.body.message).toEqual('Agent already registered')
  //   expect(agentCountAfter).toEqual(agentCountBefore)
  // });
})

