# Instruções Copilot & Agentes de IA para Gemini Burger

## Visão Geral do Projeto
- **Gemini Burger** é um sistema multi-tenant de pedidos online para hamburguerias, integrando IA Google Gemini para recomendações, pagamentos via PIX e envio de pedidos pelo WhatsApp.
- O sistema é dividido em dois principais apps:
  - **backend/**: API Node.js (Express) com Prisma ORM (MySQL), multi-tenant, autenticação JWT, rate limiting e recursos administrativos.
  - **frontend/**: React + TypeScript, usa Vite, integra com Gemini AI e a API backend.

## Arquitetura & Padrões-Chave
- **Backend**
  - Entrada: `backend/src/server.ts` (app Express, carrega todas rotas de `src/routes/`)
  - Lógica multi-tenant: veja o modelo `Tenant` em `backend/prisma/schema.prisma` e `tenantMiddleware.ts`
  - Endpoints agrupados por recurso: veja `src/routes/` e `src/controllers/`
  - Tratamento de erros: centralizado em `middlewares/tratadorErros.ts`
  - Rate limiting: `middlewares/rateLimiter.ts` (aplicado em `/api`)
  - Arquivos estáticos: `/uploads` servidos pelo backend
  - Configuração de ambiente: `.env` (veja `.env.example`)
  - Migrações do banco: `npx prisma migrate dev` (dev), `npx prisma migrate deploy` (prod)
- **Frontend**
  - Entrada: `frontend/src/main.tsx` e `App.tsx`
  - Rotas: `AppRouter.tsx`
  - Estado & API: `services/geminiService.ts` (Gemini AI), demais chamadas usam axios
  - Estilização: Tailwind CSS (`tailwind.config.js`)
  - Configuração de ambiente: `.env.local` (precisa de `VITE_GEMINI_API_KEY`)

## Fluxos de Trabalho do Desenvolvedor
- **Subir tudo (Docker):** `docker-compose up -d --build`
<!-- Copilot / Agent guide for Gemini Burger (concise, actionable) -->

# Gemini Burger — Agent Instructions

**Purpose:** Help code agents be productive quickly: architecture, key flows, conventions, and exact commands.

**Big picture**
- **Two apps:** backend (Express + Prisma + MySQL) and frontend (React + TypeScript + Vite). See [backend/src/server.ts](backend/src/server.ts) and [frontend/src/main.tsx](frontend/src/main.tsx).
- **Multi-tenant:** tenant context set by middleware. Schema and examples: [backend/prisma/schema.prisma](backend/prisma/schema.prisma) and [backend/src/middlewares/tenantMiddleware.ts](backend/src/middlewares/tenantMiddleware.ts).
- **AI integration:** frontend calls Gemini via [frontend/src/services/geminiService.ts](frontend/src/services/geminiService.ts). Backend does not call Gemini.

**Where to make changes**
- **API endpoints:** add a controller in [backend/src/controllers](backend/src/controllers) and route in [backend/src/routes](backend/src/routes), then export it from [backend/src/routes/index.ts](backend/src/routes/index.ts).
- **Frontend pages:** add component under [frontend/src/components](frontend/src/components) and register route in [frontend/src/AppRouter.tsx](frontend/src/AppRouter.tsx).

**Conventions & patterns (must-follow)**
- **All backend API paths are under** `/api` (see [backend/src/routes/index.ts](backend/src/routes/index.ts)).
- **Auth:** JWT login endpoint at `/api/auth/login` (see [backend/src/controllers/AutenticacaoController.ts](backend/src/controllers/AutenticacaoController.ts)).
- **Static uploads:** served from `/uploads` (uploads directory at repository root). Use existing `uploadMiddleware.ts` for file handling.
- **Rate limiting:** applied to `/api` via [backend/src/middlewares/rateLimiter.ts](backend/src/middlewares/rateLimiter.ts).
- **DB migrations & Prisma:** run `npx prisma generate` and `npx prisma migrate dev` in `backend/`; schema at [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

**Developer workflows (exact commands)**
- Start everything (Docker):
```
docker-compose up -d --build
```
- Backend only:
```
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```
- Frontend only:
```
cd frontend
npm install
npm run dev
```
- Seeds / helpers: look at `create-admin.ts` and `seed-products.ts` in `backend/` for DB seeding samples.

**Important files to inspect for behavior/examples**
- Server bootstrap: [backend/src/server.ts](backend/src/server.ts)
- Tenant logic: [backend/src/middlewares/tenantMiddleware.ts](backend/src/middlewares/tenantMiddleware.ts)
- Auth controller: [backend/src/controllers/AutenticacaoController.ts](backend/src/controllers/AutenticacaoController.ts)
- Order flows: [backend/src/controllers/PedidoController.ts](backend/src/controllers/PedidoController.ts)
- Gemini usage: [frontend/src/services/geminiService.ts](frontend/src/services/geminiService.ts)
- Frontend routes: [frontend/src/AppRouter.tsx](frontend/src/AppRouter.tsx)

**Common pitfalls & quick checks**
- Missing env keys: frontend requires `VITE_GEMINI_API_KEY` in `.env.local`; backend uses `.env` modeled from `.env.example`.
- Prisma migrations must match MySQL connection in `.env`. For local dev use `npx prisma migrate dev`.
- File uploads: ensure `uploads/` exists and is writable by backend.

**When making PRs**
- Keep backend changes focused: add controller + route + unit of Prisma changes (migrations). Don't alter tenant model without verifying migration impacts.
- For frontend UI changes, update `AppRouter.tsx` and component list; run `npm run dev` and verify Gemini flows with a valid `VITE_GEMINI_API_KEY`.

If any section is unclear or you want this translated to Portuguese, tell me which parts to expand. Request examples and I will add snippet templates for controllers, routes, or components.
