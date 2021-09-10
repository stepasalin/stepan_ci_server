import {Document} from 'mongoose';

export enum agentStatus {
    free = 'free',
    busy = 'busy'
}

export interface IAgent extends Document {
  name: string
  status: agentStatus
}
