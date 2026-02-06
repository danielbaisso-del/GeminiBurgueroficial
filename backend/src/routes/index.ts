import { Router } from 'express';
import { tenantRotas } from './tenantRotas';
import { autenticacaoRotas } from './autenticacaoRotas';
import { produtoRotas } from './produtoRotas';
import { pedidoRotas } from './pedidoRotas';
import { categoriaRotas } from './categoriaRotas';
import { clienteRotas } from './clienteRotas';
import { analiticasRotas } from './analiticasRotas';
import { pagamentoRotas } from './pagamentoRotas';
import configuracaoRotas from './configuracaoRotas';

const routes = Router();

routes.use('/auth', autenticacaoRotas);
routes.use('/tenants', tenantRotas);
routes.use('/products', produtoRotas);
routes.use('/categories', categoriaRotas);
routes.use('/orders', pedidoRotas);
routes.use('/customers', clienteRotas);
routes.use('/analytics', analiticasRotas);
routes.use('/payments', pagamentoRotas);
routes.use('/config', configuracaoRotas);
// removed debug/test routes; use /api/health/db in server for safe DB check

export { routes };
