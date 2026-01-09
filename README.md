<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gemini Burger - Multi-Tenant Restaurant Ordering System

A full-stack application for restaurant ordering with AI-powered recommendations using Google Gemini, multi-tenant support, PIX payments, and WhatsApp integration.

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL with Prisma ORM
- **AI**: Google Gemini API
- **Deployment**: Vercel (Frontend + Serverless Functions)

## 📦 Run Locally

**Prerequisites:** Node.js 18+, MySQL

### Option 1: Using Docker (Recommended)

```bash
docker-compose up -d --build
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   # Root dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Configure environment variables:**
   
   Backend (`.env` in backend folder):
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/gemini_burger"
   JWT_SECRET="your-secret-key"
   PORT=3333
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   ```
   
   Frontend (`.env.local` in frontend folder):
   ```env
   VITE_GEMINI_API_KEY=your-gemini-api-key
   VITE_API_URL=http://localhost:3333/api
   ```

3. **Setup database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run the applications:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 🌐 Deploy to Vercel

This project is configured for Vercel deployment with both frontend and backend running as serverless functions.

### Prerequisites

1. A Vercel account
2. A MySQL database (recommended: PlanetScale or similar serverless-compatible DB)
3. Prisma Data Proxy connection string (for serverless environments)

### Deployment Steps

1. **Fork/Clone this repository**

2. **Import project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Vercel will automatically detect the `vercel.json` configuration

3. **Configure Environment Variables in Vercel:**

   **Required for Backend (Serverless Functions):**
   ```
   DATABASE_URL=your-prisma-data-proxy-connection-string
   JWT_SECRET=your-jwt-secret-key
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.vercel.app
   ```

   **Required for Frontend:**
   ```
   VITE_GEMINI_API_KEY=your-gemini-api-key
   VITE_API_URL=https://your-app.vercel.app/api
   ```

   **Optional:**
   ```
   PORT=3333
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Database Setup for Serverless:**
   
   ⚠️ **Important**: Traditional MySQL connections may not work well in serverless environments due to connection pooling limitations.
   
   **Recommended Options:**
   
   - **Prisma Data Proxy**: Enable Prisma Data Proxy for your database and use the Data Proxy connection string
     ```
     DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=..."
     ```
   
   - **PlanetScale**: A MySQL-compatible serverless database
     ```
     DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/database?sslaccept=strict"
     ```
   
   - **Connection Pooling**: Use a connection pooler like PgBouncer or similar for MySQL

5. **Deploy:**
   - Click "Deploy" in Vercel
   - The build will:
     - Generate Prisma Client
     - Build backend TypeScript to JavaScript
     - Build frontend React app with Vite
     - Deploy both as serverless functions and static files

6. **Run Database Migrations:**
   ```bash
   # From your local machine with DATABASE_URL set to production
   cd backend
   npx prisma migrate deploy
   ```

### Vercel Configuration Details

The `vercel.json` configuration:
- **Frontend**: Built as static files and served from `/frontend/dist`
- **Backend API**: Runs as serverless functions under `/api/*`
- **Routing**: All `/api/*` requests are routed to serverless functions, everything else to the frontend

### Testing Deployment

1. **Test Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Test Frontend:**
   Visit `https://your-app.vercel.app` in your browser

### Troubleshooting

**Database Connection Issues:**
- Ensure you're using a Prisma Data Proxy connection string or serverless-compatible database
- Check that all environment variables are set correctly in Vercel
- Verify your database allows connections from Vercel's IP ranges

**Build Failures:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `dependencies` (not `devDependencies`) for production builds
- Verify TypeScript compiles without errors locally: `cd backend && npm run build`

**API Not Working:**
- Check that API routes match the pattern `/api/*`
- Verify CORS settings include your Vercel domain
- Check serverless function logs in Vercel dashboard

**Cold Start Performance:**
- First request may be slower (cold start)
- Consider using Vercel Edge Functions for frequently accessed endpoints
- Implement proper connection pooling for database

### Local Testing with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull

# Run locally with Vercel's environment
vercel dev
```

## 📚 Documentation

- [Architecture Documentation](ARCHITECTURE.md)
- [Admin Features](ADMIN-FEATURES.md)
- [Security Guide](SECURITY.md)
- [Troubleshooting](TROUBLESHOOTING-ADMIN.md)

## 🔑 Key Features

- Multi-tenant architecture
- AI-powered product recommendations (Google Gemini)
- PIX payment integration
- WhatsApp order notifications
- Admin dashboard
- Real-time order tracking
- Product catalog management
- Customer management
- Analytics and reports

## 📄 License

MIT License
