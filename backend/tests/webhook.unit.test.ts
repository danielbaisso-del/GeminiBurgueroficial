import { mercadopagoWebhook } from '../src/controllers/PagamentoController';
import * as mpService from '../src/services/mercadoPagoService';
import { prisma } from '../src/lib/prisma';

jest.mock('../src/services/mercadoPagoService');

describe('MercadoPago webhook handler', () => {
  beforeAll(() => {
    (mpService as any).getPayment = jest.fn().mockResolvedValue({ external_reference: 'fake-order-id', status: 'approved' });
    // spy on prisma.order.update
    if ((prisma as any).order && typeof (prisma as any).order.update === 'function') {
      jest.spyOn((prisma as any).order, 'update').mockResolvedValue(true as any);
    } else {
      (prisma as any).order = { update: jest.fn().mockResolvedValue(true) };
    }
  });

  test('updates order on approved payment', async () => {
    const req: any = { body: { data: { id: 'mp_123' } }, query: {} };
    const sendMock = jest.fn();
    const res: any = { status: jest.fn().mockReturnThis(), send: sendMock };

    await mercadopagoWebhook(req, res);

    expect((mpService as any).getPayment).toHaveBeenCalledWith('mp_123');
    expect((prisma as any).order.update).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
