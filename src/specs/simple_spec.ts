import {app} from '../app';
import db from '../database/connection';
import {ITest} from './../types/test';
import Test from './../models/test';
import {Schema} from 'mongoose';
import Run from './../models/run';
const request = require('supertest');

async function postToAddRun(runParams: object) {
  const response = await request(app)
      .post('/add-run')
      .send(runParams)
      .set('Content-Type', 'application/json');
  return response;
}

describe('API', () => {
  let nonExistentId: Schema.Types.ObjectId;
  let someTest: ITest;

  beforeAll( async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });

    const sharedTestParams = {
      description: 'Whatever',
      status: 'who cares',
      runCmd: 'ls -la',
    };
    const deletedTest: ITest = new Test({
      ...sharedTestParams,
      ...{name: 'This test will be deleted after I fetch id'},
    });
    await deletedTest.save();
    nonExistentId = deletedTest.id;
    await deletedTest.remove();

    someTest = new Test({
      ...sharedTestParams,
      ...{name: 'This test will be used to append runs to it'},
    });
    await someTest.save();
  });


  afterAll( async () => {
    await db.dropDatabase();
    return db.close();
  });

  it('cannot add Run to non-existent Test', async () =>{
    const runParams = {agent: '2323', status: '3423',
      runCmd: 'ls -la', test: `${nonExistentId}`};
    const response = await postToAddRun(runParams);
    expect(JSON.parse(response.text).message)
        .toEqual(`Test with id ${nonExistentId} not found`);
    expect(response.status).toEqual(404);
    const count = await Run.countDocuments();
    expect(count).toEqual(0);
  });
});


