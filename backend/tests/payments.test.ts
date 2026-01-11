import request from 'supertest';
import app from '../src/server';

describe('Payments API', () => {
  test('POST /api/payments/pix returns mock payload when no token', async () => {
    const res = await request(app)
      .post('/api/payments/pix')
      .send({ amount: 19.9, description: 'Teste PIX' })
      .expect(200);

    expect(res.body).toHaveProperty('provider', 'mock');
    expect(res.body).toHaveProperty('pixPayload');
    expect(res.body).toHaveProperty('qrCodeData');
  });
});
