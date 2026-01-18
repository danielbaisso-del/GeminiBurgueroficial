import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const categoriaRotas = Router();
const categoriaController = new CategoriaController();

// Public
categoriaRotas.get('/public', categoriaController.listAllPublic); // Nova rota pública
categoriaRotas.get('/:tenantSlug/public', tenantMiddleware, categoriaController.listPublic);

// Protected
categoriaRotas.use(autenticacaoMiddleware);
categoriaRotas.use(tenantMiddleware);
categoriaRotas.get('/', categoriaController.list);
categoriaRotas.post('/', categoriaController.create);
categoriaRotas.put('/:id', categoriaController.update);
categoriaRotas.delete('/:id', categoriaController.delete);

export { categoriaRotas };
