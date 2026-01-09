<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gemini Burger - AI-Powered Multi-Tenant Burger Ordering System

A complete system for online burger orders with AI recommendations, PIX payments, and WhatsApp integration.

## 🚀 Deploy to Vercel

This repository is configured as a monorepo for Vercel deployment with:
- **Frontend**: React + TypeScript + Vite (static build)
- **Backend**: Express + Prisma (serverless functions)

### Prerequisites for Vercel Deployment

1. **Database**: MySQL database (recommend PlanetScale or a managed MySQL service)
   - For Prisma, you may need to use [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy) in serverless environments
2. **Vercel Account**: [Sign up for free](https://vercel.com/signup)

### Deployment Steps

1. **Fork or Clone this repository**

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the `vercel.json` configuration

3. **Configure Environment Variables** in Vercel Dashboard:

   **Required Variables:**
   ```
   DATABASE_URL=mysql://user:pass@host:3306/dbname
   JWT_SECRET=your-super-secret-jwt-key-use-crypto-random-64-bytes
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGIN=https://your-app.vercel.app
   ```

   **Optional Variables:**
   ```
   JWT_EXPIRES_IN=7d
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   GEMINI_API_KEY=your-gemini-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key-for-frontend
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   WHATSAPP_API_URL=your-whatsapp-api-url
   WHATSAPP_API_TOKEN=your-whatsapp-token
   ```

4. **Database Setup**:
   - Run Prisma migrations on your production database:
     ```bash
     npx prisma migrate deploy
     ```
   - If using PlanetScale or a serverless database, consider using [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy)

5. **Deploy**:
   - Click "Deploy" in Vercel
   - Vercel will build both frontend and backend

### Vercel Serverless Considerations

- **Prisma in Serverless**: Consider using Prisma Data Proxy or connection pooling for better performance
- **File Uploads**: The `/uploads` directory won't persist in serverless. Use external storage (S3, Cloudinary, etc.) for production
- **Cold Starts**: First request after inactivity may be slower
- **Execution Time Limits**: Vercel serverless functions have execution time limits (10s for Hobby, 60s for Pro)

## 🏠 Run Locally

### Prerequisites

- Node.js 18+ and npm
- MySQL database (or Docker for local development)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env.local and add your Gemini API key
echo "VITE_GEMINI_API_KEY=your-api-key" > .env.local
npm run dev
```

### Full Stack with Docker

```bash
docker-compose up -d --build
```

## 🧪 Local Testing for Vercel Deployment

Before deploying to Vercel, test the serverless setup locally:

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Test Locally with Vercel Dev

```bash
# From repository root
vercel dev
```

This will simulate the Vercel environment locally, running:
- Frontend at `http://localhost:3000`
- Backend API at `http://localhost:3000/api/*`

### 3. Build Tests

**Backend TypeScript Build:**
```bash
cd backend
npm run build
# Check that dist/ folder is created with compiled JS
```

**Frontend Build:**
```bash
cd frontend
npm run build
# Check that dist/ folder is created with static assets
```

## 📚 Documentation

- [Admin Features](./ADMIN-FEATURES.md)
- [Architecture](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOY.md)
- [Quick Start](./QUICKSTART.md)

## 🔒 Security

- Never commit secrets or database credentials
- Always use environment variables for sensitive data
- Generate strong JWT secrets using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## 📝 License

MIT
