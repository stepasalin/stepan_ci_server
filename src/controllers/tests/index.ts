import {Response, Request} from 'express';
import {ITest} from './../../types/test';
import Test from '../../models/test';

const getTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos: ITest[] = await Test.find();
    res.status(200).json({todos});
  } catch (error) {
    throw error;
  }
};
