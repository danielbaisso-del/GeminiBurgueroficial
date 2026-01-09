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
- **Somente backend:**
  - `cd backend && npm install`
  - `cp .env.example .env` e configure
  - `npx prisma generate && npx prisma migrate dev`
  - `npm run dev` (usa tsx para hot reload)
- **Somente frontend:**
  - `cd frontend && npm install`
  - `npm run dev` (servidor Vite)
- **Testes:** Não há suíte formal; veja `test.js` e `test-models.js` para scripts ad-hoc.
- **API Docs:** Veja lista de endpoints em `README-COMPLETO.md` e arquivos de rotas/controllers.

## Convenções & Integrações
- **URLs da API:** Todos endpoints do backend ficam sob `/api` (veja `src/routes/index.ts`)
- **Autenticação:** JWT via `/api/auth/login`, token exigido para endpoints admin
- **Multi-tenant:** Contexto do tenant via middleware, dados segregados no banco
- **Integração IA:** Frontend chama Gemini API via `geminiService.ts`, backend não acessa Gemini diretamente
- **WhatsApp:** Pedidos enviados via WhatsApp (veja lógica nos controllers do backend)
- **PIX:** Pagamento via QR code (frontend)

## Notas Especiais
- **Segurança:** Revise `SECURITY.md` antes de produção
- **Deploy:** Veja `DEPLOY.md` para opções em nuvem (Vercel, Railway, VPS)
- **Soluções de problemas:** Veja `TROUBLESHOOTING-ADMIN.md` e `README-COMPLETO.md`

## Exemplos
- Adicionar novo recurso de API: crie controller, rota e atualize `src/routes/index.ts`
- Adicionar nova página frontend: crie componente, rota em `AppRouter.tsx` e link na UI

Para mais detalhes, veja `README-COMPLETO.md` e comentários nos diretórios principais.
