# Vercel Deployment Testing Notes

## Local Build Tests

### Backend TypeScript Compilation
```bash
cd backend
npm install
npm run build
```
**Result**: ✅ SUCCESS
- Compiled successfully to `backend/dist/`
- No TypeScript errors
- Generated declaration files (.d.ts)

### Frontend Vite Build
```bash
cd frontend
npm install
npm run build
```
**Result**: ✅ SUCCESS
- Built successfully to `frontend/dist/`
- Bundle size: 355.80 kB (gzipped: 100.91 kB)
- 1760 modules transformed
- Build time: ~3 seconds

### Serverless-HTTP Integration
```bash
cd backend
npm install serverless-http
```
**Result**: ✅ SUCCESS
- Package installed without issues
- Version: 3.2.0
- Zero vulnerabilities

## Code Changes Summary

### 1. vercel.json (Root)
- Configured static build for frontend using `@vercel/static-build`
- Configured serverless functions for backend using `@vercel/node`
- Routing: `/api/*` → serverless functions, `/*` → static frontend

### 2. api/server.ts (New)
- Serverless wrapper that imports the Express app factory
- Uses `serverless-http` to adapt Express for serverless environment
- Exports default handler for Vercel

### 3. backend/src/server.ts (Refactored)
- Extracted app creation into `createApp()` function
- Added default export for serverless compatibility
- Preserved original CLI behavior with `require.main === module` check
- No breaking changes to existing functionality

### 4. backend/package.json (Updated)
- Added `serverless-http@^3.2.0` dependency
- Added `vercel-build: "prisma generate && tsc"` script
- Ensures Prisma client is generated before build

### 5. frontend/package.json (Updated)
- Added `vercel-build: "vite build"` script
- Already had correct `build` script

### 6. README.md (Comprehensive Update)
- Added Vercel deployment guide
- Documented all environment variables
- Added troubleshooting section
- Included Prisma serverless caveats
- Added local testing with `vercel dev`

## Vercel Configuration Analysis

### Build Configuration
```json
"builds": [
  {
    "src": "frontend/package.json",
    "use": "@vercel/static-build",
    "config": { "distDir": "dist" }
  },
  {
    "src": "api/**/*.ts",
    "use": "@vercel/node"
  }
]
```
- Frontend builds as static site
- Backend builds as serverless functions
- TypeScript files in `api/` directory

### Route Configuration
```json
"routes": [
  { "src": "/api/(.*)", "dest": "/api/server.ts" },
  { "src": "/(.*)", "dest": "/frontend/dist/$1" }
]
```
- All `/api/*` requests → serverless function
- All other requests → static frontend files
- Frontend uses relative paths (no CORS issues)

## Environment Variables Required

### Backend (Required)
- `DATABASE_URL` - MySQL/PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `NODE_ENV` - Set to "production"

### Backend (Optional)
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS
- `CORS_ORIGIN` - Comma-separated allowed origins
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 60000)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests (default: 100)

### Frontend (Required)
- `VITE_GEMINI_API_KEY` - Google Gemini API key

## Known Issues & Caveats

### 1. Database Connection Pooling
**Issue**: Serverless functions can exhaust database connections
**Solutions**:
- Use Prisma Data Proxy (recommended)
- Use database with built-in pooling (PlanetScale, Supabase)
- Configure connection limits in Prisma schema

### 2. File Uploads
**Issue**: `/uploads` directory is not persistent in serverless
**Solutions**:
- Use Vercel Blob Storage
- Use AWS S3 or Cloudinary
- Update upload middleware to use external storage

### 3. Cold Starts
**Issue**: First request may be slow (Prisma initialization)
**Impact**: Typical cold start: 1-3 seconds
**Mitigation**: Vercel keeps warm instances for active sites

### 4. Rate Limiting
**Issue**: Rate limiting is per-function-instance
**Solutions**:
- Use external rate limiter (Upstash Redis)
- Configure Vercel's edge rate limiting
- Current middleware works but not ideal for serverless

## Testing Checklist for Deployment

Before deploying to Vercel, ensure:

- [ ] All environment variables are set in Vercel dashboard
- [ ] Database is accessible from Vercel (check firewall/IP restrictions)
- [ ] JWT_SECRET is generated securely (64 bytes recommended)
- [ ] Prisma migrations are run: `npx prisma migrate deploy`
- [ ] Admin user is created: `npm run prisma:seed`
- [ ] CORS_ORIGIN includes Vercel domain
- [ ] Frontend VITE_GEMINI_API_KEY is set

## Local Testing with Vercel Dev

```bash
# From repository root
vercel dev

# This will:
# 1. Start local serverless simulation
# 2. Serve frontend from /frontend/dist
# 3. Run backend as serverless function
# 4. Use local .env files
```

**Note**: First run requires Vercel CLI authentication

## Post-Deployment Verification

After deploying to Vercel:

1. **Health Check**:
   ```
   https://your-app.vercel.app/health
   ```
   Should return: `{"status":"ok","timestamp":"...","environment":"production"}`

2. **API Test**:
   ```
   https://your-app.vercel.app/api/auth/login
   ```
   Should accept POST with credentials

3. **Frontend**:
   ```
   https://your-app.vercel.app/
   ```
   Should load React app

4. **Static Assets**:
   Check browser console for 404s on CSS/JS files

## Performance Considerations

### Bundle Sizes
- Frontend: ~355 KB (gzipped: ~100 KB) - Good
- Backend: ~2 KB (server.js) - Excellent
- Dependencies bundled by Vercel automatically

### Optimization Recommendations
1. Enable Vercel Analytics for monitoring
2. Use Vercel's Image Optimization for product images
3. Consider splitting large frontend chunks
4. Implement lazy loading for routes
5. Use Prisma's connection pooling

## Security Checklist

- [x] JWT_SECRET uses crypto-random bytes
- [x] Environment variables not committed to git
- [x] CORS configured for production domain
- [x] Rate limiting enabled on API routes
- [x] SQL injection prevention (Prisma ORM)
- [x] Input validation with Zod
- [ ] Enable Vercel's DDoS protection
- [ ] Configure Vercel's Edge rate limiting
- [ ] Set up Vercel's Web Application Firewall

## Rollback Plan

If deployment fails:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test with `vercel dev` locally
4. Redeploy previous version from Vercel dashboard
5. Check GitHub issues for similar problems

## Next Steps After Successful Deployment

1. Set up custom domain in Vercel
2. Configure Vercel Analytics
3. Set up monitoring/alerting
4. Migrate file uploads to Vercel Blob
5. Configure Prisma Data Proxy for production
6. Set up CI/CD for automatic deployments
7. Configure preview deployments for PRs

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma in Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Serverless HTTP](https://github.com/dougmoscrop/serverless-http)
