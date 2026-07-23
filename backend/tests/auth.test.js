const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

// Mock Supabase
const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect, insert: () => ({ select: () => ({ single: () => ({ data: {}, error: null }) }) }) }));

jest.mock('../supabase', () => ({
  from: mockFrom
}));

const authRoutes = require('../routes/auth');

// Create a minimal express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const TEST_EMAIL = 'testadmin@example.com';
const TEST_PASSWORD = 'TestPassword1!';
let hashedTestPassword;

beforeAll(async () => {
  hashedTestPassword = await bcrypt.hash(TEST_PASSWORD, 10);
});

describe('Auth Routes', () => {

  describe('POST /api/auth/login', () => {
    it('should return 401 for a non-existent user', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@nowhere.com', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 for correct email but wrong password', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'mock-id', email: TEST_EMAIL, password: hashedTestPassword, role: 'admin', token_version: 0 },
        error: null
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 200 and a token for valid admin credentials', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'mock-id', email: TEST_EMAIL, password: hashedTestPassword, role: 'admin', token_version: 0 },
        error: null
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('admin');
    });

    it('should be case-insensitive for email', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'mock-id', email: TEST_EMAIL, password: hashedTestPassword, role: 'admin', token_version: 0 },
        error: null
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL.toUpperCase(), password: TEST_PASSWORD });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 with generic message if email already registered', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'mock-id' }, error: null });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: TEST_EMAIL, password: 'SomePass1!', name: 'Tester' });
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
