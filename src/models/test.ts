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
        type: String,
        required: true,
      },

      runCmd: {
        type: String,
        required: true,
      },

      runs: [{
        type: Schema.Types.ObjectId,
        ref: 'Run',
      }],
    },
    {timestamps: true},
);

export default model<ITest>('Test', testSchema);
