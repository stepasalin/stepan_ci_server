import {Response, Request} from 'express';
import Run from '../../models/run';
import {IRun} from '../../types/run';

const getRuns = async (req: Request, res: Response): Promise<void> => {
  try {
    const runs: IRun[] = await Run.find();
    res.status(200).json({runs});
  } catch (error) {
    throw error;
  }
};

const addRun = async (req: Request, res: Response): Promise<void> => {
  try {
    const body =
    req.body as Pick<IRun, 'agent' | 'status' | 'runCmd' | 'test'>;

    const run: IRun = new Run({
      agent: body.agent,
      status: body.status,
      runCmd: body.runCmd,
      test: body.test,
    });

    const newRun: IRun = await run.save();
    const allRuns: IRun[] = await Run.find();

    res
        .status(201)
        .json({message: 'Run added', run: newRun, runs: allRuns});
  } catch (error) {
    throw error;
  }
};
export {getRuns, addRun};
