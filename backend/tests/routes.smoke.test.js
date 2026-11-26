const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const mockSingle = jest.fn();
const mockOrder = jest.fn(async () => ({ data: [], error: null }));
const mockEq = jest.fn();
mockEq.mockImplementation(() => ({
  eq: mockEq,
  single: mockSingle,
  order: mockOrder,
}));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn((table) => {
  if (table === 'users') {
    return {
      select: jest.fn((cols, opts) => {
        if (opts && opts.head) {
          return Promise.resolve({ count: 5, error: null });
        }
        return {
          eq: jest.fn((col, val) => ({
            single: jest.fn(async () => ({
              data: {
                token_version: 0,
                role: val === 'admin-1' ? 'admin' : 'user',
              },
              error: null,
            })),
          })),
        };
      }),
    };
  }
  if (table === 'clubs' || table === 'events') {
    return {
      select: jest.fn(() => Promise.resolve({ count: 2, error: null })),
    };
  }
  if (table === 'orders') {
    return {
      select: jest.fn(() => ({
        eq: jest.fn(async () => ({ data: [], error: null })),
      })),
    };
  }
  return { select: mockSelect };
});

jest.mock('../supabase', () => ({
  from: mockFrom,
}));

const followsRoutes = require('../routes/follows');
const reviewsRoutes = require('../routes/reviews');
const adminRoutes = require('../routes/admin');
const { validateClubInput } = require('../middleware/validationMiddleware');

const app = express();
app.use(express.json());
app.use('/api/follows', followsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.post('/api/test-club-validation', validateClubInput, (req, res) => res.json({ ok: true }));

describe('Follows, Reviews & Validation Smoke Tests', () => {
  const token = jwt.sign(
    { id: 'user-1', email: 'u@example.com', role: 'user', tokenVersion: 0 },
    process.env.JWT_SECRET
  );

  it('GET /api/follows/check/:clubId should not crash on supabase import', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    const res = await request(app)
      .get('/api/follows/check/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ isFollowing: false });
  });

  it('GET /api/reviews/club/:clubId should not crash on supabase import', async () => {
    const res = await request(app).get('/api/reviews/club/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('validateClubInput rejects non-HTTPS imageUrl', async () => {
    const res = await request(app)
      .post('/api/test-club-validation')
      .send({ name: 'Test', category: 'Arts', imageUrl: 'javascript:alert(1)' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/HTTPS/i);
  });

  it('RBAC: /api/admin/stats rejects unauthenticated (401), general user (403), and allows superadmin (200)', async () => {
    const unauth = await request(app).get('/api/admin/stats');
    expect(unauth.statusCode).toBe(401);

    const userRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(userRes.statusCode).toBe(403);

    const adminToken = jwt.sign(
      { id: 'admin-1', email: 'admin@example.com', role: 'admin', tokenVersion: 0 },
      process.env.JWT_SECRET
    );
    const adminRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body).toHaveProperty('users');
  });
});
