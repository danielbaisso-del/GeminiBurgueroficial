import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        // Bind to all interfaces to avoid Windows loopback/IPv6 issues during dev
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3333',
            changeOrigin: true,
          }
        }
      },
      preview: {
        port: 5173,
        host: '0.0.0.0',
        headers: {
          'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
