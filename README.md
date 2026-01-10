# Gemini Burger (monorepo)

Resumo rápido:
- Frontend: `frontend/` (Vite)
- Backend: `backend/` (Express + Prisma)
- Serverless functions: `api/` (Vercel)

Local
1. Backend
   cd backend
   npm install
   cp .env.example .env
   npx prisma generate
   npx prisma migrate dev
   npm run dev

2. Frontend
   cd frontend
   npm install
   npm run dev

Deploy no Vercel
- Branch sugerida: `feature/vercel-deploy`
- Adicione variáveis no painel do Vercel:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `GEMINI_API_KEY` (opcional)
- Para evitar exaustão de conexões do Prisma em serverless, considere usar Prisma Data Proxy ou hospedar o DB em instância com conexões persistentes.

CI
- Use o arquivo `.github/workflows/ci.yml` (exemplo na raiz) para validar builds.
