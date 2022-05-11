import { IAutoTest } from '../types/auto_test';
import { model, Schema } from 'mongoose';

const autoTestSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    runCmd: {
      type: String,
      required: true,
    },

    agentGroup: {
      type: Schema.Types.ObjectId,
      ref: 'agentGroup',
      required: true,
    }
  },
  { timestamps: true }
);

export default model<IAutoTest>('AutoTest', autoTestSchema);
