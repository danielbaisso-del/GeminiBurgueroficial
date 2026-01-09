Guia rápido: Deploy do frontend no Vercel

Este arquivo mostra os passos mínimos para publicar o `frontend/` no Vercel e deixar as imagens públicas acessíveis.

1) Pré-requisitos
- Repositório no GitHub.
- Projeto criado no Vercel (https://vercel.com).

2) Arquivos públicos
- Confirme que as imagens estão em `frontend/public`: `heineken.png`, `02.png`, `batata-com-cheddar.png`, `agua.jpg`.

3) Secrets / Tokens (GitHub)
- Adicione no repositório (Settings → Secrets → Actions):
  - `VERCEL_TOKEN` — token (Vercel Account → Tokens).
  - `VERCEL_ORG_ID` — organização (Project Settings → General → Org ID).
  - `VERCEL_PROJECT_ID` — ID do projeto (Project Settings → General → Project ID).

4) Variáveis de ambiente (Vercel) — obrigatório para integração com backend
- No painel do projeto Vercel (Project Settings → Environment Variables), adicione:
  - `VITE_GEMINI_API_KEY` — sua chave Gemini (se usar)
  - `VITE_API_URL` — URL pública do backend (ex.: `https://api.seudomain.com`), se tiver backend remoto
  - `FRONTEND_URL` — `https://gemini-burgueroficial.vercel.app` (opcional, usado para alguns links gerados)

5) Workflow GitHub Actions
- Há um workflow em `.github/workflows/deploy-frontend-vercel.yml` que:
  - roda em push para `main`/`master`
  - instala deps, builda `frontend` e publica com a action do Vercel

6) Como testar localmente
```
cd frontend
npm install
npm run dev
```
Abra `http://localhost:5173/heineken.png` para verificar as imagens.

7) Backend (opções rápidas)
- Recomendado: deploy do backend em Railway/Render/Cloud com um MySQL gerenciado.
- Variáveis necessárias no backend: `DATABASE_URL`, `FRONTEND_URL` and `CORS_ORIGIN` (inclua `https://gemini-burgueroficial.vercel.app`).
- Ajuste no backend: confirme que `server.ts` lê `process.env.CORS_ORIGIN`/`process.env.FRONTEND_URL` (o repositório já tem isso). Ao configurar o backend, coloque no `.env`:

```
FRONTEND_URL="https://gemini-burgueroficial.vercel.app"
CORS_ORIGIN="https://gemini-burgueroficial.vercel.app"
```

- Armazenamento de imagens: duas opções:
  - manter imagens em `frontend/public` e usar os URLs do Vercel (recomendado para imagens estáticas), ou
  - copiar `frontend/public/*` para `backend/uploads` e servir via `https://<seu-backend>/uploads/<file>` (script/CI já incluso no repo).
- Migrações do Prisma (produção):
```
npx prisma migrate deploy
```

8) Exemplo de links públicos depois do deploy (frontend)
- https://<seu-projeto>.vercel.app/heineken.png
- https://<seu-projeto>.vercel.app/02.png
- https://<seu-projeto>.vercel.app/batata-com-cheddar.png
- https://<seu-projeto>.vercel.app/agua.jpg

Se quiser, eu posso:
- gerar instruções automáticas para configurar os `secrets` (arquivo README adicional),
- ou criar um workflow sugerido para deploy do `backend/` em Railway/Render (precisa de credenciais).
