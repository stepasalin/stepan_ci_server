import { Document } from 'mongoose';
import { ITest } from './test';

export enum RunExecutionStatus {
  pending = 'pending',
  inProgress = 'inProgress',
  success = 'success',
  fail = 'fail',
}

export enum RunAvailability {
  taken = 'taken',
  available = 'available',
}

export interface IRun extends Document {
  agent: string;
  executionStatus: RunExecutionStatus;
  availability: RunAvailability;
  test: ITest;
}
