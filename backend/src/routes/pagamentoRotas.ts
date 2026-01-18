import { Router } from 'express';
import path from 'path';
import { criarPix, mercadopagoWebhook, renderPix } from '../controllers/PagamentoController';
import { getQueryString } from '../lib/query';
import { prisma } from '../lib/prisma';
import { ErroApp } from '../middlewares/tratadorErros';

const router = Router();

// POST /api/payments/pix
router.post('/pix', criarPix);

// Webhook endpoint for MercadoPago
router.post('/webhook', mercadopagoWebhook);

// Render PIX payload to PNG
router.post('/pix/render', renderPix);

// Dev helper: serve saved sample pix.png from repo root
router.get('/dev/sample-pix', (_req, res) => {
	try {
		// pix.png is saved at repository root by dev tools; resolve relative to this file
		const file = path.resolve(__dirname, '..', '..', '..', 'pix.png');
		return res.sendFile(file);
	} catch (e) {
		return res.status(500).send('error');
	}
});

// Development helper: confirm an order payment (only enabled when not in production)
router.post('/dev/confirm/:orderId', async (req, res) => {
	if (process.env.NODE_ENV === 'production') {
		return res.status(404).send('Not found');
	}

	const orderId = getQueryString((req.params as any).orderId);
	if (!orderId) return res.status(400).json({ error: 'orderId required' });

	try {
		// Try to find by primary id first
		let order = await prisma.order.findUnique({ where: { id: orderId } });

		// If not found, try by orderNumber (allow with or without leading #)
		if (!order) {
			const possibleNumbers = [orderId, `#${orderId}`];
			order = await prisma.order.findFirst({ where: { orderNumber: { in: possibleNumbers } } });
		}

		if (!order) {
			return res.status(404).json({ error: 'Order not found' });
		}

		const updated = await prisma.order.update({
			where: { id: order.id },
			data: { paymentStatus: 'PAID', status: 'CONFIRMED', confirmedAt: new Date() },
		});

		return res.json({ ok: true, order: updated });
	} catch (error) {
		return res.status(500).json({ error: String(error) });
	}
});

export { router as pagamentoRotas };
