import {Document} from 'mongoose';
import {ITest} from './test';

export interface IRun extends Document {
  agent: string
  status: string
  runCmd: string
  test: ITest
}
