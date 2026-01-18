import { Router } from 'express';
import { AnaliticasController } from '../controllers/AnaliticasController';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const analiticasRotas = Router();
const analiticasController = new AnaliticasController();

// Protected - todas as rotas de analytics requerem autenticação
analiticasRotas.use(autenticacaoMiddleware);
analiticasRotas.use(tenantMiddleware);
analiticasRotas.get('/dashboard', analiticasController.getDashboard);
analiticasRotas.get('/period', analiticasController.getByPeriod);
analiticasRotas.get('/top-products', analiticasController.getTopProducts);
analiticasRotas.get('/detailed-report', analiticasController.getDetailedReport);

export { analiticasRotas };
