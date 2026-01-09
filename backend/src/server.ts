import express from 'express';
import cors from 'cors';
import path from 'path';
import 'express-async-errors';
import { config } from 'dotenv';
import { routes } from './routes';
import { tratadorErros } from './middlewares/tratadorErros';
import { generalLimiter } from './middlewares/rateLimiter';

config();

/**
 * Factory function to create and configure the Express app
 * This allows the app to be used both in serverless (Vercel) and traditional server environments
 */
export default function createApp() {
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

// Allow running locally with `npm run dev` or `npm start`
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
