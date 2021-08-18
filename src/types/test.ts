import {Document, Types} from 'mongoose';
import {IRun} from './run';

export interface ITest extends Document {
  name: string
  description: string
  status: string
  runCmd: string
  runs: Types.Array<IRun>
}
