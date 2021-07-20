import {ITest} from './../types/test';
import {model, Schema} from 'mongoose';

const testSchema: Schema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },

      status: {
        type: Boolean,
        required: true,
      },

      runCmd: {
        type: String,
        required: true,
      },
    },
    {timestamps: true},
);

export default model<Test>('Test', testSchema);
