import { Document } from 'mongoose';


export interface IAutoTest extends Document {
  name: string;
  description: string;
  runCmd: string;
}
