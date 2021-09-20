import { app } from '../app';
import db from '../database/connection';
import { Agent } from '../models/agent';
import { IAgent } from '../types/agent';
import request from 'supertest';

async function postToAddAgent(agentParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/add-agent')
    .send(agentParams)
    .set('Content-Type', 'application/json');
  return response;
}

describe('Adding Agents', () => {

  const agentAlreadyInDbName = 'AGENT_ALREADY_IN_DB';
  const agentCreatViaApiName = 'AGENT_CREATED_VIA_API';
  let newAgent: IAgent | null;

  beforeAll(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    const agentAlreadyInDb = new Agent({name: agentAlreadyInDbName});
    await agentAlreadyInDb.save();
  });

  afterAll(async () => {
    if(newAgent != null) {
      await newAgent.remove();
    }
    return db.close();
  });

  it('can register new agent', async () => {
    const agentCountBefore = await Agent.countDocuments();
    const response = await postToAddAgent({name: agentCreatViaApiName})
    const newAgentId = response.body.agent._id
    newAgent = await Agent.findById(newAgentId);
    if (newAgent == null){
      throw new Error(`Agent with id ${newAgentId} was not found in DB`);
    }
    const agentCountAfter = await Agent.countDocuments();
    expect(agentCountAfter).toEqual(agentCountBefore + 1);
  });
})

