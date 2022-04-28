import { Document } from 'mongoose';
import { IAgentGroup } from './agent_group';

export enum AgentStatus {
  free = 'free',
  busy = 'busy',
}

export interface IAgent extends Document {
  name: string;
  status: AgentStatus;
  lastActiveAt: Date;
  agentGroup: IAgentGroup;
}
