import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import 'express-async-errors';
import { config } from 'dotenv';
import { routes } from './routes';
import { tratadorErros } from './middlewares/tratadorErros';
import { generalLimiter } from './middlewares/rateLimiter';

// Load environment variables
config();

/**
 * Creates and configures the Express application for both traditional and serverless deployment
 * 
 * This function is designed to be compatible with:
 * - Traditional Node.js server deployment (when run directly)
 * - Vercel serverless functions (when imported and wrapped with serverless-http)
 * 
 * Configuration:
 * - CORS: Configured from CORS_ORIGIN or FRONTEND_URL environment variables
 * - Rate Limiting: Applied to /api routes (consider external limiter for production serverless)
 * - Static Files: Serves /uploads directory (use external storage for serverless production)
 * - Error Handling: Centralized error handler middleware
 * 
 * Important for Serverless Deployment:
 * - Ensure DATABASE_URL is set with connection pooling (Prisma Data Proxy recommended)
 * - Cold starts may take 1-3s for Prisma Client initialization
 * - File uploads should use external storage (Vercel Blob, S3, Cloudinary)
 * - Rate limiting works per-function-instance; consider Redis-based solution
 * 
 * @returns Configured Express Application instance
 */
export function createApp(): Application {
  const app = express();

  // Middlewares
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));

  // Rate limiting geral
  app.use('/api', generalLimiter);

  app.use(express.json());

  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // Routes
  app.use('/api', routes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    });
  });

  // Error handler
  app.use(tratadorErros);

  return app;
}

// Export default for serverless
export default createApp;

// Only start server if running directly (not imported)
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 3333;

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  });

  server.on('error', (error: any) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });
}
