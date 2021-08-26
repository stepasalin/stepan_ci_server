import {app} from '../app';
import db from '../database/connection';
import {ITest} from './../types/test';
import Test from './../models/test';
import {Schema} from 'mongoose';
const request = require('supertest');

describe('Blah blah', () => {
  let nonExistentId: Schema.Types.ObjectId;

  beforeAll( async () => {
    db.on('open', async () => {
      console.log('Database starts successfully');
    });
    const deletedTest: ITest = new Test({
      name: 'This test will be deleted after I fetch id',
      description: 'Whatever',
      status: 'who cares',
      runCmd: 'ls -la',
    });
    await deletedTest.save();
    nonExistentId = deletedTest.id;
    await deletedTest.remove();
  });


  afterAll(() => {
    return db.close();
  });

  it('asdasd', async () =>{
    const response = await request(app)
        .post('/add-run')
        .send(
            {agent: '2323', status: '3423', runCmd: 'ls -la', test: `${nonExistentId}`},
        )
        .set('Content-Type', 'application/json');
    expect(response.text).toEqual('hello');
  });
});


