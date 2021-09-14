import { Response, Request } from 'express';
import Agent from '../../models/agent';
import { IAgent } from '../../types/agent';

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
    const body = req.body as Pick<IAgent, 'name' | 'status'>;

    const query = await Agent.findOne({ name: body.name });
    if (query == null) {
      const agent: IAgent = new Agent({
        name: body.name,
        status: body.status,
        lastActiveAt: Date.now(),
      });

      const newAgent: IAgent = await agent.save();
      const allAgents: IAgent[] = await Agent.find();

      res
        .status(201)
        .json({ message: 'Agent added', run: newAgent, agents: allAgents });
    } else {
      res.status(422).json({ message: 'Agent already registered' });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
export { getAgents, addAgent };
