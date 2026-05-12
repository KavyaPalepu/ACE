const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

let token;

beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ace_test';
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
  // Register a user to get token
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Event Tester',
      email: 'eventtest@example.com',
      password: 'password123',
      department: 'CSE',
      year: 3
    });
  token = res.body.token;
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.connection.close();
});

describe('Event Endpoints', () => {
  it('should get all events', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
