<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gemini Burger - Multi-tenant Restaurant Ordering System

A comprehensive multi-tenant ordering system for burger restaurants with AI-powered recommendations using Google Gemini AI, PIX payments, and WhatsApp integration.

## Run Locally

**Prerequisites:** Node.js 18+, MySQL

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other configuration.

4. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_API_URL=http://localhost:3333
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

This project is configured for deployment to Vercel as a monorepo with serverless functions.

### Prerequisites

- Vercel account
- MySQL database (recommend PlanetScale, Railway, or similar with connection pooling)
- Prisma Data Proxy or direct database connection with limited connections

### Deployment Steps

1. **Fork or clone this repository** to your GitHub account

2. **Import project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the monorepo structure

3. **Configure Environment Variables** in Vercel Dashboard:

   **Required variables:**
   ```
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_secure_random_string
   NODE_ENV=production
   ```

   **Optional variables:**
   ```
   CORS_ORIGIN=https://your-domain.vercel.app
   FRONTEND_URL=https://your-domain.vercel.app
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_API_URL=https://your-domain.vercel.app
   ```

4. **Database Considerations for Serverless:**
   
   Serverless functions create new connections for each request. To avoid connection exhaustion:
   
   - **Option A (Recommended):** Use [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy)
     - Setup a Data Proxy in Prisma Cloud
     - Use the Data Proxy connection string in `DATABASE_URL`
   
   - **Option B:** Use a database with built-in connection pooling:
     - PlanetScale (built-in pooling)
     - Railway (connection pooling available)
     - Supabase (pooling mode)
   
   - **Option C:** Configure connection pooling:
     ```
     DATABASE_URL="mysql://user:password@host:port/database?connection_limit=5&pool_timeout=10"
     ```

5. **Deploy:**
   - Click "Deploy" in Vercel
   - Vercel will build both frontend and backend
   - First deployment may take 3-5 minutes

6. **Post-deployment:**
   - Run database migrations (if needed):
     ```bash
     npx prisma migrate deploy
     ```
   - Access your app at the Vercel URL provided

### Local Testing with Vercel CLI

Test the Vercel deployment locally before pushing:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull

# Run local development
vercel dev
```

### Troubleshooting Vercel Deployment

**Database Connection Issues:**
- Ensure `DATABASE_URL` is set correctly in Vercel environment variables
- Check that your database allows connections from Vercel IPs
- Consider using Prisma Data Proxy for serverless environments

**Build Failures:**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are listed in package.json
- Verify TypeScript compilation succeeds locally: `cd backend && npm run build`

**Function Timeout:**
- Vercel has a 10-second timeout for Hobby plan (60s for Pro)
- Optimize database queries and add indexes
- Consider using background jobs for long-running tasks

**File Uploads:**
- Vercel serverless functions have limited filesystem access
- For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
- Current `/uploads` implementation works locally but needs adaptation for production

### Architecture Notes

- **Frontend:** Static build deployed to Vercel CDN
- **Backend:** Serverless functions in `/api` directory
- **Database:** Must support connection pooling for serverless
- **Multi-tenant:** Tenant context maintained through JWT and middleware

For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [DEPLOY.md](./DEPLOY.md)
