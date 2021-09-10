import {agentStatus, IAgent} from './../types/agent';
import {model, Schema} from 'mongoose';

const agentSchema: Schema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: Object.values(agentStatus),
        default: agentStatus.free, required: true,
      },

      lastActiveAt: {
        type: Date,
        required: false,
      },

    },
    {timestamps: true},
);

export default model<IAgent>('Agent', agentSchema);
