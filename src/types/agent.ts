import { Document } from 'mongoose';

export enum AgentStatus {
  free = 'free',
  busy = 'busy',
}

export interface IAgent extends Document {
  name: string;
  status: AgentStatus;
  lastActiveAt: Date;
}
