import { Document } from 'mongoose';
import { IAgentGroup } from './agent_group';


export interface IAutoTest extends Document {
  name: string;
  description: string;
  runCmd: string;
  agentGroup: IAgentGroup;
}
