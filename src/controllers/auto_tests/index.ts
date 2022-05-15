import { Response, Request } from 'express';
import { IAutoTest } from '../../types/auto_test';
import { ITableauItem, ITableau  } from '../../types/tableau'
import AgentGroup from '../../models/agent_group';
import AutoTest from '../../models/auto_test';
import Run from '../../models/run'

const getTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const tests: IAutoTest[] = await AutoTest.find();
    res.status(200).json({ tests });
  } catch (error) {
    throw error;
  }
};

const getTableau = async (req: Request, res: Response): Promise<void> => {
  try {
    const tests: IAutoTest[] = await AutoTest.find();
    const tableauItemsPromises: Promise<ITableauItem>[] = tests.map(
      async(t) => { return(await tableauItem(t))}
    )
    const tableauItems: ITableauItem[] = await Promise.all(tableauItemsPromises)
    const tableau: ITableau = {tableauItems: tableauItems}
    res.status(200).json(tableau)
  } catch (error) {
    throw error;
  }
};

const tableauItem = async (autoTest: IAutoTest): Promise<ITableauItem> => {
  const runs = await Run.find(
    { test: autoTest}
    ).sort({ createdAt: -1 }).limit(10)
  return(
    {
      autoTestId: autoTest._id,
      runs: runs
    }
  )
}

const addTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<
      IAutoTest,
      'name' | 'description' | 'runCmd' | 'agentGroup'
    >;

    const agentGroupQuery = await AgentGroup.findById(body.agentGroup);
    if (agentGroupQuery == null) {
      res
      .status(422)
      .json( { message: `agent group ${body.agentGroup} not found`})
      return(Promise.resolve());
    }

    const autoTest: IAutoTest = new AutoTest({
      name: body.name,
      description: body.description,
      runCmd: body.runCmd,
      agentGroup: body.agentGroup
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
export { getTests, addTest, getTableau };
