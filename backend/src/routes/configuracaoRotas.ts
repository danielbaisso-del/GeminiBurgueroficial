import { Router } from 'express';
import { ConfiguracaoController } from '../controllers/ConfiguracaoController';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { uploadSingle } from '../middlewares/uploadMiddleware';

const router = Router();
const controller = new ConfiguracaoController();

// Aplicar middleware de autenticação e tenant
router.use(autenticacaoMiddleware);
router.use(tenantMiddleware);

// Rotas de configuração
router.get('/', controller.getConfig);
router.put('/', controller.updateConfig);
router.post('/upload-image', uploadSingle, controller.uploadImage);

export default router;
