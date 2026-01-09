# Vercel Deployment Guide

## Overview

This project is configured to deploy on Vercel as a monorepo with:
- **Frontend**: Static site built with Vite (React + TypeScript)
- **Backend**: Serverless Functions (Express + Prisma)

## Configuration Files

### vercel.json
The root `vercel.json` configures:
- Frontend build from `frontend/package.json` using `@vercel/static-build`
- Backend API from `api/**/*.ts` using `@vercel/node`
- Routing: `/api/*` → serverless functions, `/*` → frontend static files

### api/server.ts
Wrapper that exports the Express app as a Vercel serverless handler using `serverless-http`.

### backend/src/server.ts
Refactored to export `createApp()` function that returns the configured Express app without listening. When run directly (not imported), it starts the server normally.

## Environment Variables Required

### Backend (Vercel Project Settings)
```
DATABASE_URL=prisma://your-data-proxy-url
JWT_SECRET=your-secret-key-at-least-32-chars
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend (Vercel Project Settings)
```
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_API_URL=https://your-app.vercel.app/api
```

## Database Setup for Serverless

⚠️ **Critical**: Traditional MySQL connections don't work well in serverless environments.

### Recommended Solutions:

#### Option 1: Prisma Data Proxy (Recommended)
1. Enable Data Proxy in Prisma Cloud
2. Get the Data Proxy connection string: `prisma://...`
3. Use it as `DATABASE_URL` in Vercel

#### Option 2: PlanetScale
1. Create a PlanetScale database (MySQL-compatible, serverless-native)
2. Use the connection string with `?sslaccept=strict`

#### Option 3: Connection Pooler
1. Deploy a connection pooler (e.g., PgBouncer for PostgreSQL, ProxySQL for MySQL)
2. Point your app to the pooler instead of direct database

## Local Testing with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Link to your Vercel project
vercel link

# Pull environment variables from Vercel
vercel env pull .env.local

# Run development server with Vercel's environment
vercel dev
```

### Expected Behavior:
- Frontend runs on http://localhost:3000
- API requests to `/api/*` are proxied to serverless functions
- Hot reload works for both frontend and backend

### Known Issues with `vercel dev`:

1. **Prisma Client Generation**: May need to run `cd backend && npx prisma generate` before `vercel dev`

2. **File Uploads**: The `/uploads` directory for static files may not work the same in serverless. Consider using:
   - Vercel Blob Storage
   - AWS S3
   - Cloudinary

3. **Cold Starts**: First request after idle time may be slow (5-10 seconds)

4. **Connection Limits**: Each serverless function invocation creates new database connections. Use Data Proxy or connection pooling.

5. **Rate Limiting**: Express rate limiting middleware may not work correctly across multiple serverless instances. Consider using:
   - Vercel Edge Config
   - Redis (Upstash)
   - External rate limiting service

## Build Process

### Backend Build (`backend/vercel-build`)
```bash
prisma generate  # Generate Prisma Client
tsc              # Compile TypeScript to JavaScript
```

### Frontend Build (`frontend/vercel-build`)
```bash
vite build       # Build React app to dist/
```

## Deployment Checklist

- [ ] Create Vercel account and link repository
- [ ] Set up database (PlanetScale, Prisma Data Proxy, or pooler)
- [ ] Configure all environment variables in Vercel
- [ ] Run initial database migration: `npx prisma migrate deploy`
- [ ] Deploy to Vercel (automatic on git push)
- [ ] Test health endpoint: `https://your-app.vercel.app/api/health`
- [ ] Test frontend: `https://your-app.vercel.app`
- [ ] Test authentication: Login flow
- [ ] Test API endpoints: Products, Orders, etc.

## Post-Deployment

### Database Migrations
```bash
# Set production DATABASE_URL locally
export DATABASE_URL="prisma://..."

# Run migrations
cd backend
npx prisma migrate deploy
```

### Monitor Performance
- Check Vercel Analytics for traffic and performance
- Monitor serverless function execution time
- Watch for cold start issues
- Check database connection pool usage

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies are in `dependencies` (not `devDependencies`)
- Test build locally: `cd backend && npm run build`

### API Returns 500
- Check Vercel function logs
- Verify DATABASE_URL is correct
- Ensure Prisma Client is generated
- Check environment variables are set

### Database Connection Errors
- Verify using Data Proxy or serverless-compatible database
- Check connection string format
- Ensure database allows connections from Vercel IPs

### Frontend Can't Reach API
- Verify VITE_API_URL is set correctly
- Check CORS settings in backend
- Ensure API routes match `/api/*` pattern

### Slow Performance
- First request after idle has cold start delay
- Consider upgrading to Vercel Pro for better performance
- Implement caching where possible
- Use Edge Functions for high-traffic endpoints

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy)
- [PlanetScale](https://planetscale.com/)
- [Serverless Framework](https://www.serverless.com/)
