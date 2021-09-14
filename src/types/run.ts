import { Document } from 'mongoose';
import { IAutoTest } from './auto_test';

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
  test: IAutoTest;
}
