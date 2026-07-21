const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const request = require('supertest');
const express = require('express');
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
    });

    it('should return clubs filtered by category', async () => {
      const res = await request(app).get('/api/clubs?category=Arts');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(club => {
        expect(club.category).toBe('Arts');
      });
    });

    it('should return clubs matching a search term', async () => {
      const res = await request(app).get('/api/clubs?search=chess');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return empty array for non-matching search', async () => {
      const res = await request(app).get('/api/clubs?search=zzznomatch999');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('should return 47 total clubs', async () => {
      const res = await request(app).get('/api/clubs');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(51);
    });
  });

  describe('GET /api/clubs/:id', () => {
    it('should return 404 for a non-existent club id', async () => {
      const res = await request(app).get('/api/clubs/9999999');
      expect(res.statusCode).toBe(404);
    });
  });

});
