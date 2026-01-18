import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const tenantRotas = Router();
const tenantController = new TenantController();

// Public
tenantRotas.get('/:slug/config', tenantController.getPublicConfig);

// Protected
tenantRotas.use(autenticacaoMiddleware);
tenantRotas.use(tenantMiddleware);
tenantRotas.get('/me', tenantController.getMe);
tenantRotas.put('/me', tenantController.update);
tenantRotas.put('/me/schedule', tenantController.updateSchedule);

export { tenantRotas };
