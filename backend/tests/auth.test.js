const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');

// Create a minimal express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {

  describe('POST /api/auth/login', () => {
    it('should return 401 for a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@nowhere.com', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 for correct email but wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'hemaxtth@gmail.com', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 200 and a token for valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'hemaxtth@gmail.com', password: 'Hemanth#@01511' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('admin');
    });

    it('should be case-insensitive for email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'HEMAXTTH@GMAIL.COM', password: 'Hemanth#@01511' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if email already registered', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'hemaxtth@gmail.com', password: 'SomePass1!', name: 'Hemanth' });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toMatch(/your account has been created/i);
    });
  });

  describe('POST /api/auth/request-otp', () => {
    it('should return 400 if no email provided', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

});
