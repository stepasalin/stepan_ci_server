import { Response, Request } from 'express';
import {Agent} from '../../models/agent';
import AgentGroup from '../../models/agent_group';
import { IAgent } from '../../types/agent';

type Action = () => Promise<void>;

const performViaAgent = async (agent: IAgent, action: Action): Promise<void> => {
  await action();
  agent.lastActiveAt =  new Date();
  await agent.save();
}

const getAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const runs: IAgent[] = await Agent.find();
    res.status(200).json({ runs });
  } catch (error) {
    throw error;
  }
};

const addAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IAgent, 'name' | 'status' | 'agentGroup'>;

    const agentGroupQuery = await AgentGroup.findById(body.agentGroup);
    if (agentGroupQuery == null) {
      res
      .status(422)
      .json( { message: `agent group ${body.agentGroup} not found`})
      return(Promise.resolve());
    }

    const agentQuery = await Agent.findOne({ name: body.name });
    if (agentQuery == null) {
      const agent: IAgent = new Agent({
        name: body.name,
        status: body.status,
        agentGroup: body.agentGroup,
        lastActiveAt: Date.now(),
      });

      const newAgent: IAgent = await agent.save();

      res
        .status(201)
        .json({ message: 'Agent added', agent: newAgent});
    } else {
      res.status(422).json({ message: 'Agent already registered' });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

const updateAgentStatus = async (req: Request, res: Response): Promise<void> => {
  const { agentId, newStatus } = req.body;
  const agent = await Agent.findById(agentId);

  if (agent == null) {
    res.status(404).json({ message: `Agent ${agentId} not found`})
  }
  else{
    performViaAgent(
    agent,
    async () => {
      agent.status = newStatus;
      await agent.save();
      res.status(200).json({});
      return;
    }
  );
  };
};

export { getAgents, addAgent, performViaAgent, updateAgentStatus };
