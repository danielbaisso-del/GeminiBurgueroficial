import { Request, Response } from 'express';
import { createPixPayment, getPayment } from '../services/mercadoPagoService';
import { prisma } from '../lib/prisma';

type MPResponse = {
  point_of_interaction?: { transaction_data?: { qr_code?: string } };
  qr_code?: string;
  external_reference?: string;
  status?: string;
  payment_status?: string;
  [key: string]: unknown;
};

export async function criarPix(req: Request, res: Response) {
  try {
    const { amount, description, orderId } = req.body;

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'amount is required and must be a number' });
    }

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

    if (!mpToken) {
      const pixPayload = `MOCKPIX|AMOUNT:${Number(amount).toFixed(2)}|DESC:${description || ''}|ORDER:${orderId || ''}`;
      const qrCodeData = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23eee'/><text x='8' y='20' font-size='12'>MOCK PIX</text><text x='8' y='40' font-size='10'>${encodeURIComponent(pixPayload)}</text></svg>`;
      return res.json({ provider: 'mock', pixPayload, qrCodeData });
    }

    const mpResp = await createPixPayment({ amount: Number(amount), description, external_reference: orderId }) as MPResponse;

    const qrCode = mpResp.point_of_interaction?.transaction_data?.qr_code || mpResp.qr_code || null;

    if (orderId) {
      try {
        await prisma.order.update({ where: { id: orderId }, data: { paymentMethod: 'PIX' } });
      } catch (e) {
        // ignore
      }
    }

    return res.json({ provider: 'mercadopago', payment: mpResp, qrCode });
  } catch (error: unknown) {
    process.stderr.write(`Erro criarPix: ${String(error)}\n`);
    const errStr = error instanceof Error ? error.message : String(error);
    if (String(errStr).includes('mercadopago_token_missing')) {
      return res.status(500).json({ error: 'mercadopago_token_missing' });
    }
    return res.status(500).json({ error: 'internal_error', detail: String(errStr) });
  }
}

export async function mercadopagoWebhook(req: Request, res: Response) {
  try {
    const id = req.body?.data?.id || req.query?.id || req.body?.id;
    if (!id) return res.status(400).send('missing id');

    const payment = await getPayment(String(id)) as MPResponse;
    const external = payment.external_reference;
    const status = payment.status || (payment.payment_status as string) || null;

    if (external) {
      if (status === 'approved' || status === 'paid') {
        await prisma.order.update({ where: { id: external }, data: { paymentStatus: 'PAID', status: 'CONFIRMED' } });
      } else if (status === 'pending') {
        await prisma.order.update({ where: { id: external }, data: { paymentStatus: 'PENDING' } });
      } else if (status === 'cancelled' || status === 'rejected' || status === 'refunded') {
        await prisma.order.update({ where: { id: external }, data: { paymentStatus: 'FAILED', status: 'CANCELLED' } });
      }
    }

    return res.status(200).send('ok');
  } catch (error) {
    process.stderr.write(`mp webhook error: ${String(error)}\n`);
    return res.status(500).send('error');
  }
}
