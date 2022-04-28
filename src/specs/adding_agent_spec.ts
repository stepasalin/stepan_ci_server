import { app } from '../app';
import db from '../database/connection';
import { Agent } from '../models/agent';
import { IAgent } from '../types/agent';
import AgentGroup from '../models/agent_group';
import { IAgentGroup } from '../types/agent_group';
import request from 'supertest';
import { millisecondsSince } from '../util/milliseconds_since'
import { Schema } from 'mongoose';

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
  const acceptableTimeInterval = 1000;
  let newAgent: IAgent | null;
  let agentAlreadyInDb: IAgent;
  let agentGroupInDb: IAgentGroup;
  let agentGroupNotInDb: IAgentGroup;
  let nonExistentId: Schema.Types.ObjectId;

  beforeAll(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    agentGroupInDb = new AgentGroup({name: 'some agent group'})
    await agentGroupInDb.save()
    agentGroupNotInDb = new AgentGroup({name: 'this one will be deleted'})
    await agentGroupNotInDb.save()
    nonExistentId = agentGroupNotInDb._id
    await agentGroupNotInDb.remove()
    agentAlreadyInDb = new Agent({name: agentAlreadyInDbName, agentGroup: agentGroupInDb._id});
    await agentAlreadyInDb.save();
  });

  afterAll(async () => {
    await db.dropDatabase();
    return db.close();
  });

  it('can register new agent', async () => {
    const agentCountBefore = await Agent.countDocuments();
    const response = await postToAddAgent(
      {
        name: agentCreatViaApiName,
        agentGroup: agentGroupInDb._id
      }
    )

    expect(response.status).toEqual(201);
    expect(response.body.message).toEqual('Agent added');
    expect(response.body.agent.status).toEqual('free');
    expect(response.body.agent.name).toEqual(agentCreatViaApiName);
    const lastActiveAt = new Date(response.body.agent.lastActiveAt);
    expect(millisecondsSince(lastActiveAt)).toBeLessThan(acceptableTimeInterval);
    const newAgentId = response.body.agent._id
    newAgent = await Agent.findById(newAgentId);
    if (newAgent == null){
      throw new Error(`Agent with id ${newAgentId} was not found in DB`);
    }
    const agentCountAfter = await Agent.countDocuments();
    expect(agentCountAfter).toEqual(agentCountBefore + 1);
  });

  it('cannot register another agent with the same name', async () =>{
    const agentCountBefore = await Agent.countDocuments();
    const response = await postToAddAgent(
      {
        name: agentCreatViaApiName,
        agentGroup: agentGroupInDb._id
      }
    )
    const agentCountAfter = await Agent.countDocuments();
    expect(response.status).toEqual(422);
    expect(response.body.message).toEqual('Agent already registered')
    expect(agentCountAfter).toEqual(agentCountBefore)
  });

  it('cannot register agent without valid agentGroup id', async () =>{
    const agentCountBefore = await Agent.countDocuments();
    const response = await postToAddAgent(
      {
        name: agentCreatViaApiName,
        agentGroup: nonExistentId
      }
    )
    const agentCountAfter = await Agent.countDocuments();
    expect(response.status).toEqual(422);
    expect(response.body.message).toEqual(`agent group ${nonExistentId} not found`)
    expect(agentCountAfter).toEqual(agentCountBefore)
  });
})

