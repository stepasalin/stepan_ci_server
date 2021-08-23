import {app} from '../app';
const request = require('supertest');

describe('GET / - a simple api endpoint', () => {
  it('Hello API Request', async () => {
    const result = await request(app).get('/all-runs');
    expect(result.text).toEqual('hello');
    expect(result.statusCode).toEqual(200);
  });
});


