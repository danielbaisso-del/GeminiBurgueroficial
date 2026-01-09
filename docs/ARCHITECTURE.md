# Arquitetura do Projeto — Gemini Burger

Resumo rápido para desenvolvedores entrando no repo.

Estrutura principal
- `backend/` — API Node.js (TypeScript + Express) com Prisma (MySQL). Entrada: `backend/src/server.ts`.
- `frontend/` — SPA React + TypeScript + Vite. Entrada: `frontend/src/main.tsx`.
- `frontend/public/` — assets públicos (imagens estáticas como `heineken.png`, `02.png`, `batata-com-cheddar.png`, `agua.jpg`).
- `uploads/` — pasta pública usada pelo backend (servida em `/uploads` quando os arquivos são colocados em `backend/uploads`).
- `.github/workflows/` — automações CI/CD (deploy Vercel, sincronização de imagens).

Padrões e convenções
- Todas as rotas da API ficam sob `/api` no backend (veja `backend/src/routes/index.ts`).
- Multi-tenant: o middleware de tenant está em `backend/src/middlewares/tenantMiddleware.ts`.
- Frontend usa `getImagePath()` (em `frontend/src/utils/image.ts`) para resolver imagens públicas.
- Em modo demo o admin carrega produtos do `localStorage` (ver `frontend/src/components/AdminDashboard.tsx`).

Fluxos de desenvolvimento
- Rodar frontend local:
```
cd frontend
npm install
npm run dev
```
- Rodar backend local:
```
cd backend
npm install
# copie .env.example para .env e ajuste DATABASE_URL
npm run dev
```
- Subir tudo com Docker (dev/infra):
```
docker-compose up -d --build
```

Deploy (resumido)
- Frontend: deploy no Vercel (arquivos públicos em `frontend/public` ficam disponíveis em `https://<project>.vercel.app/<file>`).
- Backend: recomendado deploy em Railway/Render/host com MySQL; garantir `FRONTEND_URL`/`CORS_ORIGIN` incluam o domínio do frontend.

Boas práticas para PRs
- Mudanças no backend devem incluir migrações do Prisma quando alteram o schema.
- Para alterações de imagens estáticas, atualize `frontend/public` — o workflow `sync-public-to-backend` sincroniza para `backend/uploads` quando desejado.

Se precisar de uma reestruturação mais agressiva (monorepo com workspaces, mover controllers para uma camada `services/` separada, ou portar backend para serverless), diga qual abordagem prefere e eu aplico em passos seguros.
