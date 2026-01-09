<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gemini Burger - Multi-tenant Restaurant Ordering System

A full-stack application with AI-powered recommendations for restaurant ordering, featuring multi-tenant support, PIX payments, and WhatsApp integration.

## Architecture

- **Frontend**: React + TypeScript + Vite (in `/frontend`)
- **Backend**: Express + Prisma + MySQL (in `/backend`)
- **AI Integration**: Google Gemini API for recommendations

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

3. Create `.env` file (use `.env.example` as template):
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/gemini_burger"
   JWT_SECRET="your-secret-key"
   CORS_ORIGIN="http://localhost:5173"
   ```
   
   See `backend/.env.example` for all available options including:
   - Email configuration
   - WhatsApp API
   - Payment gateways (MercadoPago, Stripe)
   - Rate limiting settings

5. Run Prisma migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. Start backend server:
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:3333`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file and set your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. Run the app:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Deploy to Vercel (Serverless)

This repository is configured for deployment on Vercel with:
- Frontend served as a static site from root `/`
- Backend API deployed as serverless functions under `/api/*`

### Deployment Steps

1. **Create a new project in Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import this repository
   - Set Root Directory to the repository root (not a subdirectory)

2. **Configure Environment Variables** in Vercel Project Settings:
   
   Required variables:
   ```
   DATABASE_URL=<your-production-database-url>
   JWT_SECRET=<your-jwt-secret>
   FRONTEND_URL=<your-vercel-domain>
   CORS_ORIGIN=<your-vercel-domain>
   VITE_GEMINI_API_KEY=<your-gemini-api-key>
   NODE_ENV=production
   ```
   
   Optional variables (if used in your backend):
   - Storage/S3 credentials
   - WhatsApp API keys
   - PIX payment gateway credentials
   - Any other third-party API keys

3. **Deploy**:
   - Vercel will automatically use the `vercel.json` configuration
   - Frontend will be built from `/frontend` directory
   - Backend will be deployed as serverless functions from `/api`

### Prisma in Serverless Environment

⚠️ **Important**: Prisma in serverless environments can face connection pooling issues.

**Recommended approaches for production:**

1. **Prisma Data Proxy** (Recommended):
   - Use Prisma's connection pooling service
   - Update `DATABASE_URL` to use the Data Proxy connection string
   - See: https://www.prisma.io/docs/data-platform/data-proxy

2. **PlanetScale or similar serverless-friendly databases**:
   - Use databases optimized for serverless connections
   - Better connection handling for short-lived functions

3. **Deploy backend separately**:
   - Use a platform with persistent connections (Railway, Render, DigitalOcean)
   - Keep frontend on Vercel, point API calls to separate backend

### Local Testing with Vercel CLI

Test the Vercel configuration locally before deploying:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run Vercel development server
vercel dev
```

This will:
- Build and serve the frontend as static files
- Run the serverless functions locally
- Simulate the Vercel environment

### Troubleshooting

**Database Connection Issues:**
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Consider using Prisma Data Proxy for better serverless compatibility
- Check database allows connections from Vercel's IP ranges

**Build Failures:**
- Verify all environment variables are set in Vercel
- Check build logs for missing dependencies
- Ensure TypeScript compilation succeeds for both frontend and backend

**API Routes Not Working:**
- Verify `/api/*` routes are properly configured in `vercel.json`
- Check serverless function logs in Vercel dashboard
- Ensure backend dependencies are installed during build

**File Uploads and Static Files:**
- ⚠️ Vercel serverless functions have ephemeral filesystems
- Uploaded files will not persist between function invocations
- **Recommended**: Use cloud storage (AWS S3, Cloudinary, Vercel Blob) for file uploads
- The `/uploads` route in `vercel.json` is for local development only
- Update the backend to use cloud storage for production file uploads

## Development

### Project Structure

```
├── api/                    # Vercel serverless function wrapper
│   └── server.ts          # Serverless handler for Express app
├── backend/               # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── routes/        # API routes
│   │   └── server.ts      # Express app factory
│   ├── prisma/            # Prisma schema and migrations
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   └── package.json
├── vercel.json            # Vercel deployment configuration
└── README.md
```

### Scripts

**Backend:**
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run production build
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `vercel dev`
5. Submit a pull request

## License

MIT
