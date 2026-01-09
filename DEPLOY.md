# 🚀 GUIA DE DEPLOY - GEMINI BURGER

## 📋 **Pré-Deploy Checklist**

- [ ] Código testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET forte gerado
- [ ] Banco de dados produção criado
- [ ] Domínio registrado
- [ ] Certificado SSL obtido
- [ ] Backups configurados

---

## 🎯 **OPÇÃO 0: Deploy Vercel Monorepo (NOVO - Mais Simples!)**

### **Deploy Completo (Frontend + Backend) no Vercel**

Esta é a opção mais simples para deploy de produção usando Vercel serverless functions.

#### **1. Pré-requisitos**

- Conta Vercel (grátis): https://vercel.com
- Banco de dados MySQL com conexão pooling (recomendado):
  - **PlanetScale** (grátis): https://planetscale.com
  - **Railway** (pago ~$5/mês): https://railway.app
  - **Supabase** (grátis): https://supabase.com
- Ou usar **Prisma Data Proxy** para evitar problemas de conexão

#### **2. Configurar Banco de Dados**

**Opção A: PlanetScale (Recomendado para serverless)**
```bash
# PlanetScale tem pooling nativo e é ideal para serverless
# 1. Crie conta em planetscale.com
# 2. Crie novo database
# 3. Copie connection string (formato: mysql://...)
```

**Opção B: Prisma Data Proxy (Para qualquer DB)**
```bash
# 1. Acesse: https://cloud.prisma.io
# 2. Crie projeto e conecte seu banco
# 3. Habilite Data Proxy
# 4. Use a connection string do Data Proxy no DATABASE_URL
```

#### **3. Deploy no Vercel**

**Via Dashboard (Mais Fácil):**

1. Acesse: https://vercel.com/dashboard
2. Click "Add New Project"
3. Import seu repositório GitHub
4. Vercel detecta automaticamente a configuração monorepo
5. Configure as variáveis de ambiente (ver abaixo)
6. Click "Deploy"

**Via CLI:**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (na raiz do projeto)
vercel

# Seguir prompts e configurar variáveis
```

#### **4. Variáveis de Ambiente Obrigatórias**

Configure no Vercel Dashboard → Settings → Environment Variables:

```env
# Database
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=5&pool_timeout=10"

# JWT
JWT_SECRET="gere-um-secret-forte-com-crypto-random-64-bytes"
JWT_EXPIRES_IN="7d"

# Environment
NODE_ENV="production"

# CORS (use seu domínio Vercel)
CORS_ORIGIN="https://seu-projeto.vercel.app"
FRONTEND_URL="https://seu-projeto.vercel.app"

# Gemini AI (se necessário)
GEMINI_API_KEY="sua-chave-gemini"

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX_REQUESTS="100"
```

**⚠️ IMPORTANTE: Gerar JWT_SECRET forte:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **5. Configuração do Prisma para Serverless**

**Problema:** Serverless functions criam nova conexão a cada request.

**Soluções:**

**A) Usar PlanetScale (pooling nativo)** ✅ Recomendado
```env
DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/db?sslaccept=strict"
```

**B) Usar Prisma Data Proxy** ✅ Funciona com qualquer DB
```env
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=..."
```

**C) Limitar conexões na connection string**
```env
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=5&pool_timeout=10"
```

#### **6. Executar Migrações**

Após deploy inicial, execute as migrações:

```bash
# Localmente, com DATABASE_URL apontando para produção
DATABASE_URL="sua-url-producao" npx prisma migrate deploy

# Ou via Vercel CLI
vercel env pull
cd backend
npx prisma migrate deploy
```

#### **7. Testar o Deploy**

```bash
# Health check
curl https://seu-projeto.vercel.app/health

# API test
curl https://seu-projeto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha"}'
```

#### **8. Desenvolvimento Local com Vercel**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Linkar projeto
vercel link

# Baixar variáveis de ambiente
vercel env pull

# Rodar localmente
vercel dev
```

#### **9. Limitações e Considerações**

**Vercel Serverless Limits:**
- **Timeout:** 10s (Hobby), 60s (Pro)
- **Memory:** 1GB (Hobby), 3GB (Pro)
- **File Size:** 50MB por função

**Para Uploads de Arquivo:**
- Limite: 4.5MB via API
- Para produção, considere:
  - AWS S3
  - Cloudinary
  - Vercel Blob Storage

**Para Background Jobs:**
- Serverless não é ideal para jobs longos
- Considere:
  - Vercel Cron Jobs
  - Serviços externos (Inngest, QStash)

#### **10. Monitoramento**

- **Logs:** Vercel Dashboard → Deployments → Function Logs
- **Metrics:** Vercel Dashboard → Analytics
- **Errors:** Configure Sentry ou similar

#### **11. Domínio Customizado**

```bash
# Via CLI
vercel domains add seudominio.com

# Ou via Dashboard
# Settings → Domains → Add
```

---

## 🎯 **OPÇÃO 1: Deploy Separado Frontend/Backend (Alternativa)**

### **Frontend: Vercel (Grátis)**

1. **Instale Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Configure variáveis:**
- No painel Vercel, adicione `VITE_GEMINI_API_KEY`
- Settings → Environment Variables

4. **Domínio custom (opcional):**
- Vercel fornece: `seu-projeto.vercel.app`
- Ou configure domínio próprio

---

### **Backend: Railway (Pago ~$5-10/mês)**

1. **Acesse:** https://railway.app

2. **Crie novo projeto:**
- New Project → Deploy from GitHub
- Selecione seu repositório
- Escolha pasta `backend`

3. **Configure variáveis:**
```env
NODE_ENV=production
DATABASE_URL=mysql://...
JWT_SECRET=seu-secret-forte-aqui
FRONTEND_URL=https://seu-frontend.vercel.app
CORS_ORIGIN=https://seu-frontend.vercel.app
```

4. **MySQL Railway:**
- Add Service → MySQL
- Copie `DATABASE_URL` gerado
- Cole nas variáveis do backend

5. **Migrations:**
```bash
# No Railway CLI ou via dashboard:
npx prisma migrate deploy
```

---

## 🎯 **OPÇÃO 2: VPS (Mais controle)**

### **DigitalOcean / AWS / Azure**

#### **1. Criar Droplet/VPS**

**DigitalOcean (exemplo):**
- Ubuntu 22.04 LTS
- 2GB RAM mínimo
- 1 vCPU
- ~$12/mês

#### **2. Configurar servidor**

```bash
# SSH no servidor
ssh root@seu-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Instalar Nginx
apt install nginx -y

# Instalar Certbot (SSL)
apt install certbot python3-certbot-nginx -y
```

#### **3. Clonar projeto**

```bash
# Criar usuário deploy
adduser deploy
usermod -aG docker deploy
su - deploy

# Clonar repo
git clone https://github.com/seu-usuario/gemini-burger.git
cd gemini-burger
```

#### **4. Configurar .env produção**

```bash
# Backend
cd backend
cp .env.example .env
nano .env
```

Configurar:
```env
NODE_ENV=production
DATABASE_URL="mysql://gemini:senha-forte@mysql:3306/gemini_burger"
JWT_SECRET="gere-com-crypto"
FRONTEND_URL="https://seudominio.com.br"
CORS_ORIGIN="https://seudominio.com.br"
```

#### **5. Docker Compose Produção**

Criar `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: gemini-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: senha-root-forte
      MYSQL_DATABASE: gemini_burger
      MYSQL_USER: gemini
      MYSQL_PASSWORD: senha-usuario-forte
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backup:/backup
    networks:
      - gemini-network

  backend:
    build: ./backend
    container_name: gemini-backend
    restart: always
    environment:
      DATABASE_URL: mysql://gemini:senha-usuario-forte@mysql:3306/gemini_burger
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
      PORT: 3333
      FRONTEND_URL: https://seudominio.com.br
    ports:
      - "3333:3333"
    depends_on:
      - mysql
    networks:
      - gemini-network
    command: sh -c "npx prisma migrate deploy && npm start"

  frontend:
    build:
      context: ./frontend
      args:
        VITE_GEMINI_API_KEY: ${VITE_GEMINI_API_KEY}
    container_name: gemini-frontend
    restart: always
    ports:
      - "5173:5173"
    networks:
      - gemini-network

volumes:
  mysql_data:

networks:
  gemini-network:
```

#### **6. Subir containers**

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

#### **7. Configurar Nginx**

```bash
sudo nano /etc/nginx/sites-available/gemini-burger
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/gemini-burger /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### **8. Configurar SSL (HTTPS)**

```bash
# Obter certificado
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br -d api.seudominio.com.br

# Testar renovação automática
sudo certbot renew --dry-run
```

#### **9. Configurar DNS**

No seu provedor de domínio (Registro.br, GoDaddy, etc):

```
Tipo  | Nome | Valor          | TTL
------|------|----------------|-----
A     | @    | seu-ip-vps     | 3600
A     | www  | seu-ip-vps     | 3600
A     | api  | seu-ip-vps     | 3600
```

---

## 🔄 **Automatizar Deploy (CI/CD)**

### **GitHub Actions**

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/gemini-burger
            git pull
            docker-compose -f docker-compose.prod.yml up -d --build
```

Adicionar secrets no GitHub:
- Settings → Secrets → Actions
- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

---

## 📊 **Monitoramento**

### **UptimeRobot (Grátis)**
1. Acesse: https://uptimerobot.com
2. Add Monitor → HTTP(s)
3. URL: `https://seudominio.com.br/health`
4. Configure alertas por email

### **PM2 (Logs e processo)**
```bash
npm install -g pm2
pm2 start npm --name "backend" -- start
pm2 startup
pm2 save
pm2 logs
```

---

## 🔐 **Firewall**

```bash
# Configurar UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 💾 **Backup Automático**

Criar script `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec gemini-mysql mysqldump -u gemini -psenha gemini_burger > /backup/db_$DATE.sql
find /backup -name "db_*.sql" -mtime +7 -delete
```

Agendar no crontab:
```bash
crontab -e
# Adicionar:
0 2 * * * /home/deploy/gemini-burger/backup.sh
```

---

## 🚨 **Troubleshooting**

### **Site não carrega**
```bash
# Verificar containers
docker ps

# Ver logs
docker logs gemini-frontend
docker logs gemini-backend

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

### **Erro 502 Bad Gateway**
```bash
# Backend não está rodando
docker restart gemini-backend
```

### **SSL não funciona**
```bash
# Renovar certificado
sudo certbot renew --force-renewal
```

---

## 📈 **Escalabilidade (Futuro)**

- Load Balancer (Nginx/HAProxy)
- Múltiplas instâncias backend
- Redis para cache
- CDN para assets estáticos
- Banco de dados gerenciado (AWS RDS, PlanetScale)

---

## ✅ **Checklist Pós-Deploy**

- [ ] Site acessível via HTTPS
- [ ] API respondendo
- [ ] Pedidos funcionando
- [ ] WhatsApp enviando
- [ ] Email de confirmação (se configurado)
- [ ] Backup rodando
- [ ] Monitoramento ativo
- [ ] Firewall configurado
- [ ] Logs rotacionando

---

## 📞 **Precisa de Ajuda?**

- Documentação Docker: https://docs.docker.com
- Nginx: https://nginx.org/en/docs/
- Certbot: https://certbot.eff.org/

---

**🎉 Parabéns! Seu sistema está no ar!**
