# Finalizar migrações Prisma — Passos

Esses passos mostram como finalizar e aplicar as migrações do Prisma localmente (desenvolvimento Windows) e em produção.

1) Preparar ambiente

 - Certifique-se de que `backend/.env` contenha `DATABASE_URL` apontando para seu MySQL.
 - Caso não exista, copie `backend/.env.example` para `backend/.env` e ajuste.

No PowerShell (Windows):

```powershell
cd backend
npm install
# copie o .env (se necessário)
Copy-Item .env.example .env -Force
```

No CMD (Windows):

```cmd
cd backend
npm install
copy .env.example .env
```

2) Gerar client Prisma

```bash
npx prisma generate
```

3) Aplicar migrações (desenvolvimento)

Se estiver em desenvolvimento e quiser criar/rodar migrações interativas:

```bash
npx prisma migrate dev --name init
```

Isso criará (se necessário) as migrações e aplicará no banco local.

4) Aplicar migrações (produção / CI)

No servidor/CI, use:

```bash
npx prisma migrate deploy
```

5) Seeds (criar admin e dados iniciais)

O repositório tem um script de seed em `backend/package.json` (`prisma:seed`). Rode:

```bash
npm run prisma:seed
```

6) Verificar com Prisma Studio

```bash
npx prisma studio
```

Notas e cuidados

- Verifique que `@prisma/client` e `prisma` nas versões do `package.json` são compatíveis.
- Em produção, use `prisma migrate deploy` e nunca `migrate dev`.
- Certifique-se de backup do banco antes de aplicar migrações em produção.
