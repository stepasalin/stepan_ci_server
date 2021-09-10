import {Response, Request} from 'express';
import Agent from '../../models/agent';
import {IAgent} from '../../types/agent';

const getAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const runs: IAgent[] = await Agent.find();
    res.status(200).json({runs});
  } catch (error) {
    throw error;
  }
};

const addAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const body =
    req.body as Pick<IAgent, 'name' | 'status'>;

    const query = await Agent.find({name: body.name});
    console.log(query);

    // if (test == null) {
    //   res
    //       .status(404)
    //       .json({message: `Test with id ${body.test} not found`});
    // } else {
    //   const run: IRun = new Run({
    //     agent: body.agent,
    //     status: body.status,
    //     runCmd: body.runCmd,
    //     test: body.test,
    //   });

      const newAgent: IAgent = await run.save();
      const allRuns: IRun[] = await Run.find();

      res
          .status(201)
          .json({message: 'Run added', run: newRun, runs: allRuns});
    }
    ;
  } catch (error) {
    throw error;
  }
};
export {getRuns, addRun};
