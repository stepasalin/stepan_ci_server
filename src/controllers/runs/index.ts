import { Response, Request } from 'express';
import Run from '../../models/run';
import AutoTest from '../../models/auto_test';
import { IRun, RunAvailability } from '../../types/run';
import { IAgent } from '../../types/agent';
import { Agent } from '../../models/agent'
import { performViaAgent } from '../../controllers/agents/index'
import { FilterQuery, Schema } from 'mongoose';
import touch from 'touch';
import mkpath from 'mkpath';
import fs from 'fs';
import { readFile, fileExists } from '../../util/fsStuff'
import { mustExist } from '../../util/assertions';


const getRuns = async (req: Request, res: Response): Promise<void> => {
  try {
    const runs: IRun[] = await Run.find();
    res.status(200).json({ runs });
  } catch (error) {
    throw error;
  }
};

const getLog = async (req: Request, res: Response): Promise<void> => {
  const { runId } = req.query;
  const logPath = `./runLogs/${runId}.log`
  if(await fileExists(logPath)) {
    const currentLog = await readFile(logPath);
    res.set('Content-Type', 'text/plain').status(200).send(currentLog)
  }
  else {
    res.status(404).send(`No log found for run ${runId}`)
  }
};

const assignAgent = async(run: IRun, agent: IAgent): Promise<void> => {
  mkpath.sync('./runLogs')
  const logPath = `./runLogs/${run._id}.log`;
  touch.sync(logPath);
  run.availability = RunAvailability.taken;
  run.agent = agent;
  run.logPath = logPath;
  await run.save();
};

const findForAgent = async(req: Request, res: Response): Promise<void> => {
  const agentId = req.body.agentId;
  const agent = await Agent.findById(agentId);

  if (agent == null) {
    res.status(404).json({ message: `Agent with id ${agentId} not found` });
    return;
  }

  const runQueryResult = await Run.findOne({availability: 'available', executionStatus: 'pending'}  as FilterQuery<Schema>)

  performViaAgent(
    agent,
    async () => {
      if (runQueryResult == null) {
        res.status(200).json({});
        return;
      }
      
      await assignAgent(runQueryResult, agent);
      res.status(200).json({runId: runQueryResult.id})
    }
  );
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

const getRunCmd = async(req: Request, res: Response): Promise<void> => {
  const { runId, agentId } = req.query;

  const agent = await Agent.findById(agentId);
   if (agent == null) {
    res.status(404).json({ message: `Agent with id ${agentId} not found` });
    return;
  }

  performViaAgent(
    agent,
    async () => {
      const run = await Run.findById(runId)
      if (run == null) {
        res.status(404).json({ message: `Run with id ${runId} not found` }); 
        return;
      };
      if (!run.agent.equals(agent._id)) {
        res.status(422).json({ message: `Run with id ${runId} not assigned to Agent ${agentId}`})
        return;
      }

      const autoTest = mustExist(await AutoTest.findById(run.test));
      res.status(200).json({runCmd: autoTest.runCmd});
      return;
    }
  );
  return;
}

const appendLog = async(req: Request, res: Response): Promise<void> => {
  const { runId, agentId, newLogContent } = req.body;
  
  const agent = await Agent.findById(agentId);
   if (agent == null) {
    res.status(404).json({ message: `Agent with id ${agentId} not found` });
    return;
  }
  performViaAgent(
    agent,
    async () => {
      const run = await Run.findById(runId)
      if (run == null) {
        res.status(404).json({ message: `Run with id ${runId} not found` }); 
        return;
      };
      if (!run.agent.equals(agent._id)) {
        res.status(422).json({ message: `Run with id ${runId} not assigned to Agent ${agentId}`})
        return;
      }
      fs.appendFileSync(`${run.logPath}`, newLogContent);
      res.status(200).json({});
      return;
    }
  );

  return;
}

const updateRunStatus = async (req: Request, res: Response): Promise<void> => {
  const { runId, agentId, newExecutionStatus } = req.body;

  const agent = await Agent.findById(agentId);
   if (agent == null) {
    res.status(404).json({ message: `Agent with id ${agentId} not found` });
    return;
  }

  performViaAgent(
    agent,
    async () => {
      const run = await Run.findById(runId)
      if (run == null) {
        res.status(404).json({ message: `Run with id ${runId} not found` });
        return;
      };
      if (!run.agent.equals(agent._id)) {
        res.status(422).json({ message: `Run with id ${runId} not assigned to Agent ${agentId}`})
        return;
      }
      run.executionStatus = newExecutionStatus;

      await run.save();
      res.status(200).json({});
      return;
    }
  );

  return;
};

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

      res
        .status(201)
        .json({ message: 'Run added', run: newRun});
    }
  } catch (error) {
    throw error;
  }
};
export { getRuns, addRun, assignToAgent, findForAgent, appendLog, updateRunStatus, getRunCmd, getLog };
