import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const produtoRotas = Router();
const produtoController = new ProdutoController();

// Public routes (FIRST - antes de aplicar autenticação)
produtoRotas.get('/public/all', produtoController.listAllPublic);
produtoRotas.get('/public', produtoController.listAllPublic); // Adicionar também sem /all
produtoRotas.get('/:tenantSlug/public', tenantMiddleware, produtoController.listPublic);
produtoRotas.get('/:tenantSlug/public/:slug', tenantMiddleware, produtoController.getBySlug);

// Protected routes (DEPOIS de aplicar autenticação)
produtoRotas.use(autenticacaoMiddleware);
produtoRotas.use(tenantMiddleware);
produtoRotas.get('/', produtoController.list);
produtoRotas.post('/', produtoController.create);
produtoRotas.get('/:id', produtoController.getById);
produtoRotas.put('/:id', produtoController.update);
produtoRotas.delete('/:id', produtoController.delete);

export { produtoRotas };
