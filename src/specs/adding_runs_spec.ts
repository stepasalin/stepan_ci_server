import { app } from '../app';
import db from '../database/connection';
import { IAutoTest } from '../types/auto_test';
import AutoTest from '../models/auto_test';
import { Schema } from 'mongoose';
import Run from '../models/run';
import request from 'supertest';
import { IRun } from '../types/run';

async function postToAddRun(runParams: Record<string, unknown>) {
  const response = await request(app)
    .post('/add-run')
    .send(runParams)
    .set('Content-Type', 'application/json');
  return response;
}

describe('Adding Runs', () => {
  let nonExistentId: Schema.Types.ObjectId;
  let someTest: IAutoTest;
  let newRun :IRun | null;

  beforeAll(async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    const sharedTestParams = {
      description: 'Whatever',
      runCmd: 'ls -la',
    };
    const deletedTest: IAutoTest = new AutoTest({
      ...sharedTestParams,
      ...{ name: 'This test will be deleted after I fetch id' },
    });
    await deletedTest.save();
    nonExistentId = deletedTest.id;
    await deletedTest.remove();

    someTest = new AutoTest({
      ...sharedTestParams,
      ...{ name: 'This test will be used to append runs to it' },
    });
    await someTest.save();
  });

  afterAll(async () => {
    await db.dropDatabase();
    return db.close();
  });

  it('cannot add Run to non-existent Test', async () => {
    const runParams = {
      test: `${nonExistentId}`,
    };
    const countBefore = await Run.countDocuments();
    const response = await postToAddRun(runParams);
    expect(JSON.parse(response.text).message).toEqual(
      `AutoTest with id ${nonExistentId} not found`
    );
    expect(response.status).toEqual(404);
    const countAfter = await Run.countDocuments();
    expect(countBefore).toEqual(countAfter);
  });

  it('can add Run to existing Test', async () => {
    const runParams = {
      test : `${someTest.id}`
    }
    const countBefore = await Run.countDocuments();

    const response = await postToAddRun(runParams);
    expect(response.status).toEqual(201);
    expect(response.body.message).toEqual('Run added');
    expect(response.body.run.executionStatus).toEqual('pending');
    expect(response.body.run.availability).toEqual('available');
    expect(response.body.run.test).toEqual(`${someTest.id}`);

    const countAfter = await Run.countDocuments();
    expect(countBefore + 1).toEqual(countAfter);

    const newRunId = response.body.run._id;
    newRun = await Run.findById(newRunId);
    if(newRun == null) {
      throw new Error(`No Run with id ${newRunId} found in DB`);
    }
    expect(newRun.executionStatus).toEqual('pending');
    expect(newRun.availability).toEqual('available');
    expect(newRun.test == someTest.id).toBe(true)
  }
  );
});
