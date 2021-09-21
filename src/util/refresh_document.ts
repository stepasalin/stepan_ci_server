import { mustExist } from './assertions';
import Run from '../models/run'
import { IRun } from '../types/run';

export async function refreshRun(instance: IRun): Promise<IRun>{
  return mustExist(await Run.findById(instance._id));
}

import { Agent } from '../models/agent'
import { IAgent } from '../types/agent';

export async function refreshAgent(instance: IAgent): Promise<IAgent>{
  return mustExist(await Agent.findById(instance._id));
}

import AutoTest from '../models/auto_test'
import { IAutoTest } from '../types/auto_test';

export async function refreshAutoTest(instance: IAutoTest): Promise<IAutoTest>{
  return mustExist(await AutoTest.findById(instance._id));
}