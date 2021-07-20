import {Document} from 'mongoose';

export interface ITest extends Document {
  name: string
  description: string
  status: boolean
  runCmd: string
}
