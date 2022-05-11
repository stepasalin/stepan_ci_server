import { AgentStatus, IAgent } from './../types/agent';
import { model, Schema } from 'mongoose';


export const Agent =  model<IAgent>('Agent', new Schema(
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

    agentGroup: {
      type: Schema.Types.ObjectId,
      ref: 'agentGroup',
      required: true,
    }
  },
  { timestamps: true }
));


