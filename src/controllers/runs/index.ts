import { Response, Request } from 'express';
import Run from '../../models/run';
import Test from '../../models/test';
import { IRun } from '../../types/run';

const getRuns = async (req: Request, res: Response): Promise<void> => {
  try {
    const runs: IRun[] = await Run.find();
    res.status(200).json({ runs });
  } catch (error) {
    throw error;
  }
};

const addRun = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IRun, 'agent' | 'executionStatus' | 'availability' | 'test'>;

    const test = await Test.findById(body.test);

    if (test == null) {
      res.status(404).json({ message: `Test with id ${body.test} not found` });
    } else {
      const run: IRun = new Run({
        agent: body.agent,
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
export { getRuns, addRun };
