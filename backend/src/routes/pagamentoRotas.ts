import { Router } from 'express';
import { criarPix, mercadopagoWebhook } from '../controllers/PagamentoController';

const router = Router();

// POST /api/payments/pix
router.post('/pix', criarPix);

// Webhook endpoint for MercadoPago
router.post('/webhook', mercadopagoWebhook);

export { router as pagamentoRotas };
