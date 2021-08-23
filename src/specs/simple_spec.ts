import {app} from '../app';
import db from '../database/connection';
const request = require('supertest');

describe('GET / - a simple api endpoint', () => {
  beforeAll(() => {
    db.on('open', () => {
      console.log('Database starts successfully');
    });
  });


  afterAll(() => {
    return db.close();
  });

  it('Hello API Request', async () => {
    const result = await request(app).get('/all-runs');
    expect(result.text).toEqual('hello');
    expect(result.statusCode).toEqual(200);
  });
});


