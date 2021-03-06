import { IRun, RunExecutionStatus, RunAvailability } from './../types/run';
import { model, Schema } from 'mongoose';

const runSchema: Schema = new Schema(
  {
    agent: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'Agent'
    },

    executionStatus: {
      type: String,
      enum: Object.values(RunExecutionStatus),
      default: RunExecutionStatus.pending,
      required: false,
    },

    availability: {
      type: String,
      enum: Object.values(RunAvailability),
      default: RunAvailability.available,
      required: false,
    },

    test: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },

    logPath: {
      type: String,
      required: false
    },

    takenAt: {
      type: Date,
      required: false,
    },

    finishedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export default model<IRun>('Run', runSchema);
