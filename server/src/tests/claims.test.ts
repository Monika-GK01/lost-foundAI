import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
  disconnectDB: jest.fn().mockResolvedValue(undefined),
}));

describe('Claims API', () => {
  describe('POST /api/claims', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/claims')
        .send({
          lostItemId: '507f1f77bcf86cd799439011',
          foundItemId: '507f1f77bcf86cd799439012',
          verificationAnswers: [{ question: 'Brand?', answer: 'Apple' }],
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/claims/my', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/claims/my');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/claims/pending', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/claims/pending');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/claims/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/claims/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/claims/:id/cancel', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).patch('/api/claims/507f1f77bcf86cd799439011/cancel');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/claims/:id/review', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .patch('/api/claims/507f1f77bcf86cd799439011/review')
        .send({ status: 'APPROVED' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/claims/:id/recovery-receipt', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/claims/507f1f77bcf86cd799439011/recovery-receipt');
      expect(res.status).toBe(401);
    });
  });
});
