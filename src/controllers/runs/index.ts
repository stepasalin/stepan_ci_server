import { Response, Request } from 'express';
import Run from '../../models/run';
import AutoTest from '../../models/auto_test';
import { IRun, RunAvailability } from '../../types/run';
import { IAgent } from '../../types/agent';
import { Agent } from '../../models/agent'
import { performViaAgent } from '../../controllers/agents/index'
import { FilterQuery, Schema } from 'mongoose';

const getRuns = async (req: Request, res: Response): Promise<void> => {
  try {
    const runs: IRun[] = await Run.find();
    res.status(200).json({ runs });
  } catch (error) {
    throw error;
  }
};

const assignAgent = async(run: IRun, agent: IAgent): Promise<void> => {
  await performViaAgent(
    agent,
    async () => {
      run.availability = RunAvailability.taken;
      run.agent = agent.id;
      await run.save();
    }
  )
};

const findForAgent = async(req: Request, res: Response): Promise<void> => {
  const agentId = req.body.agentId;
  const agent = await Agent.findById(agentId);
  if (agent == null) {
    res.status(404).json({ message: `Agent with id ${req.body.agentId} not found` });
    return;
  }

  const run = await Run.findOne({availability: 'available', executionStatus: 'pending'}  as FilterQuery<Schema>)
  if (run == null) {
    res.status(200).json({});
    return;
  }

  assignAgent(run, agent);
  res.status(200).json({runId: run.id});
}

const assignToAgent = async(req: Request, res: Response): Promise<void> => {
  const agentId = req.body.agentId;
  const runId = req.body.runId;

  const agent = await Agent.findById(agentId);
  if (agent == null) {
    res.status(404).json({ message: `Agent with id ${agentId} not found` });
    return;
  }

  const run =  await Run.findById(runId);
  if (run == null) {
    res.status(404).json({ message: `Run with id ${runId} not found` });
    return;
  }

  await performViaAgent(
  agent,
  async () => {
    run.availability = RunAvailability.taken;
    run.agent = agentId;
    await run.save();
  }
  );
  res.status(200).json({ message: 'OK' });
}

const addRun = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IRun, 'agent' | 'executionStatus' | 'availability' | 'test'>;

    const test = await AutoTest.findById(body.test);

    if (test == null) {
      res.status(404).json({ message: `AutoTest with id ${body.test} not found` });
    } else {
      const run: IRun = new Run({
        test: body.test,
      });

      const newRun: IRun = await run.save();
      const allRuns: IRun[] = await Run.find();

      res
        .status(201)
        .json({ message: 'Run added', run: newRun, runs: allRuns });
    }
  } catch (error) {
    throw error;
  }
};
export { getRuns, addRun, assignToAgent, findForAgent };
