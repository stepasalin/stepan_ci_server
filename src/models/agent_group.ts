import { IAgentGroup } from '../types/agent_group';
import { model, Schema } from 'mongoose';

const agentGroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IAgentGroup>('AgentGroup', agentGroupSchema);
