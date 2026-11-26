const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const request = require('supertest');
const express = require('express');

const MOCK_CLUBS = [
  { id: 1, name: 'Chess Club', category: 'Cultural & Literary Clubs', description: 'Chess', location: 'Vijayawada', is_verified: true },
  { id: 2, name: 'Art Circle', category: 'Arts', description: 'Painting', location: 'Vijayawada', is_verified: false },
];

const mockFrom = jest.fn((table) => {
  if (table === 'clubs') {
    let filtered = [...MOCK_CLUBS];
    const chain = {
      select: jest.fn(() => chain),
      eq: jest.fn((col, val) => {
        if (col === 'id') {
          filtered = filtered.filter(c => String(c.id) === String(val));
        } else {
          filtered = filtered.filter(c => c[col] === val);
        }
        return chain;
      }),
      ilike: jest.fn((col, pattern) => {
        const term = pattern.replace(/%/g, '').toLowerCase();
        filtered = filtered.filter(c => c[col].toLowerCase().includes(term));
        return chain;
      }),
      order: jest.fn(async () => ({ data: filtered, error: null })),
      single: jest.fn(async () => ({
        data: filtered[0] || null,
        error: filtered[0] ? null : { message: 'Not found' },
      })),
    };
    return chain;
  }
  return {};
});

jest.mock('../supabase', () => ({
  from: mockFrom,
}));

const clubRoutes = require('../routes/clubs');

const app = express();
app.use(express.json());
app.use('/api/clubs', clubRoutes);

describe('Clubs Routes', () => {

  describe('GET /api/clubs', () => {
    it('should return an array of clubs', async () => {
      const res = await request(app).get('/api/clubs');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should return clubs filtered by category', async () => {
      const res = await request(app).get('/api/clubs?category=Arts');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      res.body.forEach(club => {
        expect(club.category).toBe('Arts');
      });
    });

    it('should return clubs matching a search term', async () => {
      const res = await request(app).get('/api/clubs?search=chess');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Chess Club');
    });

    it('should return empty array for non-matching search', async () => {
      const res = await request(app).get('/api/clubs?search=zzznomatch999');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /api/clubs/:id', () => {
    it('should return 404 for a non-existent club id', async () => {
      const res = await request(app).get('/api/clubs/9999999');
      expect(res.statusCode).toBe(404);
    });
  });

});
