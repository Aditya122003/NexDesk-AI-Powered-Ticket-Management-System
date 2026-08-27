const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

describe('Helpdesk API Unit & Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk_test_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  describe('GET /api/health', () => {
    it('should return server health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'online');
      expect(res.body).toHaveProperty('service');
    });
  });

  describe('Authentication Routes', () => {
    const testUser = {
      name: 'Jest Test User',
      email: `jest_${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer'
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toEqual(testUser.email.toLowerCase());
    });

    it('should login existing user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});
