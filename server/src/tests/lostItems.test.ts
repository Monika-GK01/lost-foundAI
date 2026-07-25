import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
  disconnectDB: jest.fn().mockResolvedValue(undefined),
}));

describe('Lost Items API', () => {
  describe('GET /api/lost-items', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/lost-items');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/lost-items', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/lost-items')
        .send({ title: 'Test Item', description: 'A test', category: 'ELECTRONICS', dateLost: '2024-01-01' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/lost-items/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/lost-items/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/lost-items/:id/matches', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/lost-items/507f1f77bcf86cd799439011/matches');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/lost-items/check-duplicates', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/lost-items/check-duplicates')
        .send({ title: 'iPhone', category: 'ELECTRONICS' });
      expect(res.status).toBe(401);
    });
  });
});
