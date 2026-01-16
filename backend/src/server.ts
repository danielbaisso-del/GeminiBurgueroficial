import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import 'express-async-errors';
import { config } from 'dotenv';
import { autenticacaoRotas } from './routes/autenticacaoRotas';
import { produtoRotas } from './routes/produtoRotas';
import { pedidoRotas } from './routes/pedidoRotas';
import { clienteRotas } from './routes/clienteRotas';
import { categoriaRotas } from './routes/categoriaRotas';
import { analiticasRotas } from './routes/analiticasRotas';
import configuracaoRotas from './routes/configuracaoRotas';
import { tenantRotas } from './routes/tenantRotas';
import { pagamentoRotas } from './routes/pagamentoRotas';
import { tratadorErros } from './middlewares/tratadorErros';
import { generalLimiter } from './middlewares/rateLimiter';

config();

const app = express();
const PORT = Number(process.env.PORT || 3333);

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting geral
app.use('/api', generalLimiter);

app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", 'ws:', 'http:', 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

// Serve frontend build if present (prefer backend/public, fallback to frontend/dist)
const backendPublic = path.join(__dirname, '..', 'public');
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');

if (fs.existsSync(backendPublic)) {
  app.use(express.static(backendPublic));
}

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Routes
app.use('/api/auth', autenticacaoRotas);
app.use('/api/products', produtoRotas);
app.use('/api/orders', pedidoRotas);
app.use('/api/customers', clienteRotas);
app.use('/api/categories', categoriaRotas);
app.use('/api/analytics', analiticasRotas);
app.use('/api/config', configuracaoRotas);
app.use('/api/tenants', tenantRotas);
app.use('/api/payments', pagamentoRotas);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Serve index explicitly at root (prefer backend/public)
app.get('/', (req, res) => {
  const indexFromBackend = path.join(backendPublic, 'index.html');
  const indexFromFrontend = path.join(frontendDist, 'index.html');

  if (fs.existsSync(indexFromBackend)) return res.sendFile(indexFromBackend);
  if (fs.existsSync(indexFromFrontend)) return res.sendFile(indexFromFrontend);

  return res.status(404).send('Not Found');
});

// SPA fallback for non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  const indexFromBackend = path.join(backendPublic, 'index.html');
  const indexFromFrontend = path.join(frontendDist, 'index.html');

  if (fs.existsSync(indexFromBackend)) return res.sendFile(indexFromBackend);
  if (fs.existsSync(indexFromFrontend)) return res.sendFile(indexFromFrontend);

  return res.status(404).send('Not Found');
});

// Error handler (placed last)
app.use(tratadorErros);

if (require.main === module) {
  // Instrumentation: log environment and Node info to help debugging startup failures
  process.stdout.write(`Node: ${process.version}\n`);
  process.stdout.write(`PORT: ${PORT}\n`);
  process.stdout.write(`NODE_ENV: ${process.env.NODE_ENV}\n`);

  process.on('uncaughtException', (err) => {
    process.stderr.write(`uncaughtException: ${String(err)}\n`);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    process.stderr.write(`unhandledRejection: ${String(reason)}\n`);
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    process.stdout.write(`🚀 Server running on http://localhost:${PORT}\n`);
    process.stdout.write(`📊 Environment: ${process.env.NODE_ENV}\n`);
  });

  server.on('error', (error: unknown) => {
    process.stderr.write(`❌ Server error: ${String(error)}\n`);

    function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
      return typeof e === 'object' && e !== null && 'code' in e;
    }

    if (isErrnoException(error) && error.code === 'EADDRINUSE') {
      process.stderr.write(`Port ${PORT} is already in use\n`);
    }

    process.exit(1);
  });
}

export default app;
