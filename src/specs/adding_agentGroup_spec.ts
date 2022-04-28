import { app } from '../app';
import db from '../database/connection';
import AgentGroup from '../models/agent_group';
import { IAgentGroup } from '../types/agent_group';
import request from 'supertest';

async function postToAddAgentGroup(agentGroupParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/add-group')
    .send(agentGroupParams)
    .set('Content-Type', 'application/json');
  return response;
}

describe('Adding Agent Groups', () => {

  const agentGroupAlreadyInDbName = 'AGENT_GROUP_ALREADY_IN_DB';
  const agentGroupCreatViaApiName = 'AGENT_GROUP_CREATED_VIA_API';
  let newAgentGroup: IAgentGroup | null;
  let agentGroupAlreadyInDb: IAgentGroup;

  beforeAll(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    agentGroupAlreadyInDb = new AgentGroup({name: agentGroupAlreadyInDbName});
    await agentGroupAlreadyInDb.save();
  });

  afterAll(async () => {
    await db.dropDatabase();
    return db.close();
  });

  it('can register new agent', async () => {
    const agentGroupCountBefore = await AgentGroup.countDocuments();
    const response = await postToAddAgentGroup({name: agentGroupCreatViaApiName})

    expect(response.status).toEqual(201);
    expect(response.body.message).toEqual('Agent Group added');
    expect(response.body.agentGroup.name).toEqual(agentGroupCreatViaApiName);
  
    const newAgentGroupId = response.body.agentGroup._id
    newAgentGroup = await AgentGroup.findById(newAgentGroupId);
    if (newAgentGroup == null){
      throw new Error(`Agent with id ${newAgentGroupId} was not found in DB`);
    }
    const agentGroupCountAfter = await AgentGroup.countDocuments();
    expect(agentGroupCountAfter).toEqual(agentGroupCountBefore + 1);
  });

  it('cannot register another agent with the same name', async () =>{
    const agentGroupCountBefore = await AgentGroup.countDocuments();
    const response = await postToAddAgentGroup({name: agentGroupAlreadyInDbName})
    const agentCountAfter = await AgentGroup.countDocuments();
    expect(response.status).toEqual(422);
    expect(response.body.message).toEqual('Agent Group already registered')
    expect(agentCountAfter).toEqual(agentGroupCountBefore)
  });
})

