import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';

const pedidoRotas = Router();
const pedidoController = new PedidoController();

// Public - criar pedido (do frontend do cliente)
pedidoRotas.post('/:tenantSlug/create', tenantMiddleware, pedidoController.create);

// Public - buscar pedidos por telefone (do cliente)
pedidoRotas.get('/customers/orders/:phone', tenantMiddleware, (req, res) => {
  pedidoController.getByCustomerPhone(req, res);
});

// Protected - gerenciar pedidos (painel admin)
pedidoRotas.use(autenticacaoMiddleware);
pedidoRotas.use(tenantMiddleware);
pedidoRotas.get('/', pedidoController.list);
pedidoRotas.get('/:id', pedidoController.getById);
pedidoRotas.patch('/:id/status', pedidoController.updateStatus);
pedidoRotas.delete('/:id', pedidoController.cancel);

export { pedidoRotas };

