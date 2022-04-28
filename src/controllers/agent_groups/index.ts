import { Response, Request } from 'express';
import AgentGroup from '../../models/agent_group';
import { IAgentGroup } from '../../types/agent_group';

const getAgentGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const agentGroups: IAgentGroup[] = await AgentGroup.find();
    res.status(200).json({ agentGroups });
  } catch (error) {
    throw error;
  }
};

const addAgentGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IAgentGroup, 'name'>;

    const query = await AgentGroup.findOne({ name: body.name });
    if (query == null) {
      const agentGroup: IAgentGroup = new AgentGroup({
        name: body.name
      });

      const newAgentGroup: IAgentGroup = await agentGroup.save();

      res
        .status(201)
        .json({ message: 'Agent Group added', agent: newAgentGroup});
    } else {
      res.status(422).json({ message: 'Agent Group already registered' });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export { addAgentGroup, getAgentGroups };
