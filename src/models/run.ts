import { IRun, RunExecutionStatus } from './../types/run';
import { model, Schema } from 'mongoose';

const runSchema: Schema = new Schema(
  {
    agent: {
      type: String,
      required: true,
    },

    executionStatus: {
      type: String,
      enum: Object.values(RunExecutionStatus),
      default: RunExecutionStatus.pending,
      required: false,
    },

    availability: {
      type: String,
      required: false,
    },

    test: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IRun>('Run', runSchema);
