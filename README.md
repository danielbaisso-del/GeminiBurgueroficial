<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gemini Burger - Multi-Tenant Restaurant Ordering System

A full-stack multi-tenant restaurant ordering system with AI-powered recommendations using Google Gemini, integrated with PIX payments and WhatsApp order notifications.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: MySQL (supports PostgreSQL via Prisma)
- **AI Integration**: Google Gemini for personalized recommendations
- **Deployment**: Vercel (serverless functions)

## Run Locally

**Prerequisites:** Node.js 18+, MySQL (or Docker)

### Quick Start with Docker

```bash
docker-compose up -d --build
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3333`.

### Manual Setup

#### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
# Create .env.local and add your Gemini API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local
npm run dev
```

## Deploy to Vercel

This repository is configured for Vercel deployment with both frontend and backend as serverless functions.

### Prerequisites

1. A Vercel account
2. MySQL database (e.g., PlanetScale, Railway, or any MySQL provider)
3. Google Gemini API key

### Deployment Steps

#### 1. Fork/Clone the Repository

```bash
git clone https://github.com/danielbaisso-del/GeminiBurgueroficial.git
cd GeminiBurgueroficial
```

#### 2. Install Vercel CLI (Optional for local testing)

```bash
npm i -g vercel
```

#### 3. Deploy to Vercel

##### Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Vercel will automatically detect the `vercel.json` configuration
3. Configure environment variables (see below)
4. Deploy!

##### Option B: Using Vercel CLI

```bash
vercel
# Follow the prompts
# Add environment variables when prompted or via dashboard
vercel --prod
```

#### 4. Configure Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

**Required Backend Variables:**

```
DATABASE_URL=mysql://user:password@host:3306/database_name
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

**Optional Variables:**

```
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
GEMINI_API_KEY=your-gemini-api-key
```

**Frontend Variables:**

```
VITE_GEMINI_API_KEY=your-gemini-api-key
```

> **Note**: Generate a secure JWT_SECRET using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Database Setup for Vercel

**Important**: Serverless functions have connection limits. We recommend:

#### Option 1: Prisma Data Proxy (Recommended)

Use Prisma Data Proxy for production serverless deployments to handle connection pooling:

```bash
# Generate Prisma Data Proxy connection string
npx prisma generate --data-proxy
```

Update your `DATABASE_URL` in Vercel to use the Data Proxy connection string.

#### Option 2: Connection Pooling Database

Use database providers with built-in connection pooling:

- **PlanetScale** (recommended for MySQL, built-in HTTP API)
- **Supabase** (PostgreSQL with connection pooling)
- **Railway** (supports connection pooling)
- **Neon** (PostgreSQL with serverless support)

### Post-Deployment Steps

1. **Run Prisma Migrations**:
   ```bash
   # Set DATABASE_URL locally or use Vercel environment
   npx prisma migrate deploy
   ```

2. **Create Admin User**:
   ```bash
   cd backend
   npm run prisma:seed
   # Or manually create using the create-admin script
   ```

3. **Test the Deployment**:
   - Frontend: `https://your-app.vercel.app`
   - Health Check: `https://your-app.vercel.app/health`
   - API: `https://your-app.vercel.app/api/auth/login`

### Local Testing with Vercel Dev

Test the serverless functions locally before deploying:

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your local database

# Create frontend/.env.local
echo "VITE_GEMINI_API_KEY=your_key" > frontend/.env.local

# Run Vercel dev server
vercel dev
```

This will start a local Vercel environment at `http://localhost:3000`.

## Important Notes & Caveats

### Prisma in Serverless

- **Connection Pooling**: Serverless functions can exhaust database connections. Use Prisma Data Proxy or a connection pooler.
- **Cold Starts**: First request may be slower due to Prisma Client initialization.
- **Binary Size**: Prisma generates platform-specific binaries. Vercel handles this automatically.

### File Uploads

- Static files in `/uploads` directory won't persist in serverless environment
- Consider using:
  - **Vercel Blob Storage** for file uploads
  - **AWS S3** or **Cloudinary** for production images
  - Update the upload middleware accordingly

### Rate Limiting

- Rate limiting middleware works per function instance
- Consider using external rate limiting (e.g., Upstash Redis) for production

### CORS Configuration

- Frontend uses relative paths (`/api/*`) - no CORS needed for same origin
- Configure `CORS_ORIGIN` if deploying frontend separately

## Project Structure

```
├── api/                    # Vercel serverless functions
│   └── server.ts          # Serverless wrapper
├── backend/               # Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── routes/        # API routes
│   │   └── server.ts      # App factory
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API & Gemini services
│   │   └── App.tsx
│   └── package.json
├── vercel.json           # Vercel configuration
└── docker-compose.yml    # Local development
```

## Development Workflow

1. Make changes to backend or frontend
2. Test locally with `vercel dev` or Docker
3. Commit and push to your repository
4. Vercel automatically deploys on push (if connected)

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | MySQL connection string | ✅ | - |
| `JWT_SECRET` | Secret for JWT tokens | ✅ | - |
| `JWT_EXPIRES_IN` | Token expiration | ❌ | `7d` |
| `NODE_ENV` | Environment mode | ❌ | `development` |
| `PORT` | Server port (local only) | ❌ | `3333` |
| `FRONTEND_URL` | Frontend URL | ❌ | `http://localhost:5173` |
| `CORS_ORIGIN` | Allowed CORS origins | ❌ | - |
| `GEMINI_API_KEY` | Google Gemini API key | ❌ | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | ❌ | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | ❌ | `100` |

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | ✅ |

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull
```

### Build Failures

```bash
# Clear Vercel cache
vercel --force

# Test build locally
cd backend && npm run build
cd frontend && npm run build
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ destructive)
npx prisma migrate reset
```

## Support & Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

## License

MIT
