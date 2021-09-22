import { Document } from 'mongoose';
import { IAutoTest } from './auto_test';
import { IAgent } from './agent';

export enum RunExecutionStatus {
  pending = 'pending',
  inProgress = 'inProgress',
  success = 'success',
  fail = 'fail',
  ciError = 'ciError'
}

export enum RunAvailability {
  taken = 'taken',
  available = 'available',
}

export interface IRun extends Document {
  agent: IAgent;
  executionStatus: RunExecutionStatus;
  availability: RunAvailability;
  test: IAutoTest;
  logPath: string;
}
