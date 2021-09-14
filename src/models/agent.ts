import { AgentStatus, IAgent } from './../types/agent';
import { model, Schema } from 'mongoose';

const agentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(AgentStatus),
      default: AgentStatus.free,
      required: true,
    },

    lastActiveAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export default model<IAgent>('Agent', agentSchema);
