# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Setup

### 1. Database Setup ⚠️ CRITICAL
- [ ] Create MySQL or PostgreSQL database
- [ ] Note the connection string (format: `mysql://user:pass@host:port/db`)
- [ ] Ensure database allows connections from Vercel IPs (or use serverless-friendly providers)
- [ ] **Recommended Providers**:
  - [ ] PlanetScale (MySQL with built-in HTTP API, serverless-optimized)
  - [ ] Supabase (PostgreSQL with connection pooling)
  - [ ] Railway (supports connection pooling)
  - [ ] Neon (PostgreSQL serverless)

### 2. Prisma Setup for Serverless
- [ ] Consider Prisma Data Proxy for connection pooling
- [ ] Or ensure your database provider supports connection pooling
- [ ] Update `schema.prisma` connection_limit if needed:
  ```prisma
  datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
    relationMode = "prisma" // For PlanetScale
  }
  ```

### 3. Generate Secrets
- [ ] Generate JWT_SECRET (64 bytes recommended):
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Save this secret securely (password manager)
- [ ] Get Google Gemini API key from https://makersuite.google.com/app/apikey

### 4. Prepare Vercel Account
- [ ] Create Vercel account at https://vercel.com
- [ ] Connect GitHub account to Vercel
- [ ] Install Vercel CLI (optional, for local testing):
  ```bash
  npm i -g vercel
  ```

## Deployment Steps

### Step 1: Import Repository to Vercel
- [ ] Go to https://vercel.com/new
- [ ] Select "Import Git Repository"
- [ ] Choose `danielbaisso-del/GeminiBurgueroficial`
- [ ] Vercel will detect `vercel.json` automatically

### Step 2: Configure Environment Variables
Navigate to your project → Settings → Environment Variables

#### Backend Variables (Required)
- [ ] `DATABASE_URL` = Your database connection string
- [ ] `JWT_SECRET` = Your generated secret (64 chars)
- [ ] `NODE_ENV` = `production`

#### Frontend Variables (Required)
- [ ] `VITE_GEMINI_API_KEY` = Your Gemini API key

#### Optional Variables (Recommended)
- [ ] `JWT_EXPIRES_IN` = `7d` (or your preferred duration)
- [ ] `FRONTEND_URL` = Your Vercel app URL (e.g., `https://your-app.vercel.app`)
- [ ] `CORS_ORIGIN` = Your Vercel app URL(s) comma-separated

**Important**: Apply variables to "Production", "Preview", and "Development" environments

### Step 3: Deploy
- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for build to complete (typically 2-5 minutes)
- [ ] Check deployment logs for any errors

### Step 4: Run Database Migrations
After first successful deployment:

```bash
# Option A: Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Option B: Manually with DATABASE_URL
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

- [ ] Migrations completed successfully

### Step 5: Create Admin User
```bash
# Option A: Run seed script
cd backend
npm run prisma:seed

# Option B: Create admin manually
npx tsx backend/create-admin.ts
```

- [ ] Admin user created
- [ ] Note admin credentials securely

## Post-Deployment Verification

### Test Health Check
- [ ] Visit: `https://your-app.vercel.app/health`
- [ ] Expected response:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-...",
    "environment": "production"
  }
  ```

### Test Frontend
- [ ] Visit: `https://your-app.vercel.app/`
- [ ] Page loads without errors
- [ ] Check browser console (F12) for errors
- [ ] Verify images and assets load correctly

### Test API Endpoints
Test login endpoint:
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

- [ ] API responds correctly
- [ ] Returns JWT token on successful login

### Test Gemini AI Integration
- [ ] Open frontend and try AI recommendations
- [ ] Check if Gemini API key works
- [ ] Verify AI responses are generated

## Configuration Options

### Custom Domain (Optional)
- [ ] Go to Project Settings → Domains
- [ ] Add your custom domain
- [ ] Update DNS records as instructed
- [ ] Update `FRONTEND_URL` and `CORS_ORIGIN` environment variables

### Preview Deployments
- [ ] Enable preview deployments for pull requests
- [ ] Configure preview environment variables if different

### Monitoring Setup
- [ ] Enable Vercel Analytics (optional, paid feature)
- [ ] Set up external monitoring (e.g., Sentry, DataDog)
- [ ] Configure error alerts

## Troubleshooting

### Build Fails
- [ ] Check Vercel deployment logs
- [ ] Verify all dependencies in package.json
- [ ] Ensure environment variables are set
- [ ] Test build locally: `cd backend && npm run build`

### Database Connection Errors
- [ ] Verify DATABASE_URL format is correct
- [ ] Check database firewall allows Vercel IPs
- [ ] Ensure database is running and accessible
- [ ] Consider using Prisma Data Proxy

### Frontend Not Loading
- [ ] Check Vercel deployment logs for build errors
- [ ] Verify frontend build succeeded
- [ ] Check browser console for errors
- [ ] Ensure `VITE_GEMINI_API_KEY` is set

### API 404 Errors
- [ ] Verify `vercel.json` routing is correct
- [ ] Check that `api/server.ts` exists
- [ ] Ensure backend built successfully
- [ ] Check Vercel function logs

### Prisma Errors
```bash
# Regenerate Prisma Client
npx prisma generate

# Check database connection
npx prisma db pull

# Reset database (⚠️ destructive)
npx prisma migrate reset
```

### Rate Limiting Issues
- [ ] Consider implementing external rate limiter (Upstash Redis)
- [ ] Configure Vercel Edge rate limiting
- [ ] Adjust `RATE_LIMIT_MAX_REQUESTS` environment variable

## Production Optimizations

### Database Optimization
- [ ] Set up Prisma Data Proxy connection string
- [ ] Configure connection pooling in schema.prisma
- [ ] Monitor database connections in provider dashboard

### File Upload Migration
- [ ] Set up Vercel Blob Storage
- [ ] Or configure AWS S3/Cloudinary
- [ ] Update multer middleware to use external storage
- [ ] Migrate existing `/uploads` files

### Performance
- [ ] Enable Vercel's Image Optimization
- [ ] Set up CDN for static assets
- [ ] Implement lazy loading for routes
- [ ] Monitor cold start times

### Security
- [ ] Rotate JWT_SECRET regularly
- [ ] Set up rate limiting with Redis
- [ ] Enable Vercel's DDoS protection
- [ ] Configure Web Application Firewall
- [ ] Set security headers in vercel.json

## Maintenance

### Regular Tasks
- [ ] Monitor Vercel function logs weekly
- [ ] Check database connection pool usage
- [ ] Review and rotate secrets quarterly
- [ ] Update dependencies monthly
- [ ] Back up database regularly

### Updates
When deploying updates:
- [ ] Test locally with `vercel dev`
- [ ] Deploy to preview environment first
- [ ] Verify preview deployment
- [ ] Deploy to production
- [ ] Monitor for errors post-deployment

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Prisma Serverless Guide**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Repository Issues**: https://github.com/danielbaisso-del/GeminiBurgueroficial/issues

## Emergency Rollback

If production deployment has critical issues:

1. **Quick Rollback**:
   - [ ] Go to Vercel Dashboard → Deployments
   - [ ] Find previous working deployment
   - [ ] Click "..." → "Promote to Production"

2. **Investigate**:
   - [ ] Check Vercel function logs
   - [ ] Review deployment logs
   - [ ] Check environment variables
   - [ ] Test locally with production env vars

3. **Fix and Redeploy**:
   - [ ] Fix issues locally
   - [ ] Test with `vercel dev`
   - [ ] Deploy again

---

## Summary

✅ **Pre-Deployment**: Database, secrets, Vercel account
✅ **Deployment**: Import repo, set env vars, deploy
✅ **Post-Deployment**: Migrations, admin user, testing
✅ **Optimization**: Prisma Data Proxy, external storage, monitoring

**Estimated Time**: 30-60 minutes for first deployment

**Need Help?** Check VERCEL-DEPLOYMENT.md for detailed technical notes.
