import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
  disconnectDB: jest.fn().mockResolvedValue(undefined),
}));

describe('Found Items API', () => {
  describe('GET /api/found-items', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/found-items');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/found-items', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/found-items')
        .send({ title: 'Found Wallet', description: 'Brown wallet', category: 'ACCESSORIES', dateFound: '2024-01-01' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/found-items/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/found-items/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/found-items/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).delete('/api/found-items/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/found-items/check-duplicates', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/found-items/check-duplicates')
        .send({ title: 'Wallet', category: 'ACCESSORIES' });
      expect(res.status).toBe(401);
    });
  });
});
