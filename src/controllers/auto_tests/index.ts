import { Response, Request } from 'express';
import { IAutoTest } from '../../types/auto_test';
import AutoTest from '../../models/auto_test';

const getTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const tests: IAutoTest[] = await AutoTest.find();
    res.status(200).json({ tests });
  } catch (error) {
    throw error;
  }
};

const addTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<
      IAutoTest,
      'name' | 'description' | 'runCmd'
    >;

    const autoTest: IAutoTest = new AutoTest({
      name: body.name,
      description: body.description,
      runCmd: body.runCmd,
    });

    const newTest: IAutoTest = await autoTest.save();
    const allTests: IAutoTest[] = await AutoTest.find();

    res
      .status(201)
      .json({ message: 'Auto Test added', auto_test: newTest, auto_tests: allTests });
  } catch (error) {
    throw error;
  }
};
export { getTests, addTest };
