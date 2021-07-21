import {Response, Request} from 'express';
import {ITest} from './../../types/test';
import Test from '../../models/test';

const getTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const tests: ITest[] = await Test.find();
    res.status(200).json({tests});
  } catch (error) {
    throw error;
  }
};

// const updateTest = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       params: {id},
//       body,
//     } = req;
//     const updateTest: ITest | null = await Test.findByIdAndUpdate(
//         {_id: id},
//         body,
//     );
//     const allTodos: ITest[] = await Test.find();
//     res.status(200).json({
//       message: 'Todo updated',
//       test: updateTest,
//       tests: allTodos,
//     });
//   } catch (error) {
//     throw error;
//   }
// };

const addTest = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req);

    const body =
    req.body as Pick<ITest, 'name' | 'description' | 'status' | 'runCmd'>;

    console.log(body);

    const test: ITest = new Test({
      name: body.name,
      description: body.description,
      status: body.status,
      runCmd: body.runCmd,
    });

    const newTest: ITest = await test.save();
    const allTests: ITest[] = await Test.find();

    res
        .status(201)
        .json({message: 'Test added', test: newTest, tests: allTests});
  } catch (error) {
    throw error;
  }
};
export {getTests, addTest};
