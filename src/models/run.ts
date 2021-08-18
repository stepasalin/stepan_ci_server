import {IRun} from './../types/run';
import {model, Schema} from 'mongoose';

const runSchema: Schema = new Schema(
    {
      agent: {
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

      test: {
        type: Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
      },
    },
    {timestamps: true},
);

export default model<IRun>('Run', runSchema);
