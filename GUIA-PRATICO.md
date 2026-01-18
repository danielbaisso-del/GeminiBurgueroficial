# 🚀 GUIA PRÁTICO - GEMINI BURGER

**Como iniciar, desenvolver e fazer deploy**

---

## 📋 Índice Rápido

1. [Iniciar o Projeto (Do Zero)](#iniciar-o-projeto-do-zero)
2. [Desenvolvimento Local](#desenvolvimento-local)
3. [Integrar com Banco de Dados](#integrar-com-banco-de-dados)
4. [Testes Rápidos](#testes-rápidos)
5. [Troubleshooting](#troubleshooting)
6. [Deploy](#deploy)
7. [Referência de Arquivos](#referência-de-arquivos)

---

## 🎬 Iniciar o Projeto (Do Zero)

### Pré-requisitos
```
✅ Node.js 18+ (npm 9+)
✅ Git
✅ MySQL 8.0+ (local ou remoto)
```

### Opção 1: Docker (Recomendado)
```bash
docker-compose up -d --build
# Aguarda 30s

# Verificar status
docker-compose ps

# Backend rodando em: http://localhost:3333
# Frontend rodando em: http://localhost:5173
# MySQL rodando em: localhost:3306
# Prisma Studio: http://localhost:5555
```

**Parar tudo:**
```bash
docker-compose down
```

### Opção 2: Local (Sem Docker)

#### Backend
```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Editar DATABASE_URL para sua conexão MySQL

# 3. Gerar Prisma Client
npx prisma generate

# 4. Criar tabelas
npx prisma migrate dev

# 5. Rodar servidor
npm run dev
# Backend em: http://localhost:3333
```

#### Frontend
```bash
cd frontend

# 1. Instalar dependências
npm install

# 2. Configurar .env.local
echo "VITE_GEMINI_API_KEY=sua_api_key_aqui" > .env.local

# 3. Rodar dev server
npm run dev
# Frontend em: http://localhost:5173
```

#### MySQL (se não tiver)
```bash
# macOS
brew install mysql
brew services start mysql

# Windows (usar MySQL Installer)
# Linux
sudo apt-get install mysql-server
sudo service mysql start

# Criar database
mysql -u root -p
CREATE DATABASE burgueroficial;
```

---

## 💻 Desenvolvimento Local

### Estrutura do Projeto
```
backend/
├── src/
│   ├── controllers/      ← Lógica da aplicação
│   ├── routes/          ← Endpoints da API
│   ├── middlewares/     ← Auth, tenant, erros, upload
│   ├── services/        ← Integrações externas
│   ├── lib/             ← Configurações (Prisma)
│   └── server.ts        ← Ponto de entrada
├── prisma/
│   ├── schema.prisma    ← Estrutura do banco
│   └── migrations/      ← Histórico de mudanças
└── .env                 ← Variáveis de ambiente

frontend/
├── src/
│   ├── components/      ← Componentes React
│   ├── pages/          ← Páginas da app
│   ├── services/       ← Chamadas de API
│   ├── types/          ← TypeScript interfaces
│   ├── App.tsx         ← App principal
│   ├── AppRouter.tsx   ← Rotas
│   └── main.tsx        ← Entrada
├── index.html
├── tailwind.config.js  ← Estilos
└── .env.local          ← Secrets

database/
├── burgueroficial      ← Database MySQL
└── 11 tabelas criadas
```

### Fluxo de Desenvolvimento

#### 1️⃣ Criar novo endpoint
```
1. Criar função em controllers/MeuController.ts
2. Criar rota em routes/meuRotas.ts  
3. Exportar em routes/index.ts
4. Testar com curl/Postman
```

#### Exemplo: Endpoint de Cupom

**Step 1:** `backend/src/controllers/CouponController.ts`
```typescript
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ErroApp } from '../middlewares/tratadorErros';

export const couponController = {
  async create(req: Request, res: Response) {
    try {
      const { tenantId, code, discount, validFrom, validUntil } = req.body;
      
      // Validar dados
      if (!code || !discount) {
        throw new ErroApp('Code e discount obrigatórios', 400);
      }
      
      // Criar no banco
      const coupon = await prisma.coupon.create({
        data: {
          tenantId,
          code,
          discount: Number(discount),
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
        },
      });
      
      res.json(coupon);
    } catch (error) {
      throw error;
    }
  },

  async list(req: Request, res: Response) {
    const { tenantId } = req.query;
    const coupons = await prisma.coupon.findMany({
      where: { tenantId: tenantId as string },
    });
    res.json(coupons);
  },
};
```

**Step 2:** `backend/src/routes/couponRotas.ts`
```typescript
import { Router } from 'express';
import { couponController } from '../controllers/CouponController';
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';

export const couponRotas = Router();

couponRotas.post('/', autenticacaoMiddleware, couponController.create);
couponRotas.get('/', couponController.list);
```

**Step 3:** `backend/src/routes/index.ts`
```typescript
import { couponRotas } from './couponRotas';
app.use('/api/coupons', couponRotas);
```

**Step 4:** Testar
```bash
# Criar cupom
curl -X POST http://localhost:3333/api/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "tenantId": "tenant-123",
    "code": "PROMO10",
    "discount": 10,
    "validFrom": "2024-01-01",
    "validUntil": "2024-12-31"
  }'

# Listar cupons
curl http://localhost:3333/api/coupons?tenantId=tenant-123
```

#### 2️⃣ Adicionar campo ao banco
```
1. Editar backend/prisma/schema.prisma
2. Rodar: npx prisma migrate dev
3. Usar via Prisma
```

**Exemplo:** Adicionar `maxUses` ao Coupon

**Editar schema.prisma:**
```prisma
model Coupon {
  id              String      @id @default(uuid())
  tenantId        String
  code            String      @unique
  discount        Float
  maxUses         Int?        // Novo campo
  usedCount       Int         @default(0)
  validFrom       DateTime
  validUntil      DateTime
  active          Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  tenant          Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([code])
}
```

**Rodar migração:**
```bash
cd backend
npx prisma migrate dev --name add_coupon_max_uses
# Digita: add_coupon_max_uses
```

#### 3️⃣ Criar página no frontend
```
1. Criar componente em src/components/
2. Adicionar rota em src/AppRouter.tsx
3. Chamar API via src/services/apiService.ts
4. Estilizar com Tailwind
```

**Exemplo:** Página de Cupons

**Step 1:** `frontend/src/components/CouponsAdmin.tsx`
```typescript
import { useEffect, useState } from 'react';
import { api } from '../services/apiService';

export function CouponsAdmin() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/coupons', {
        params: { tenantId: localStorage.getItem('tenantId') },
      });
      setCoupons(response.data);
    } catch (err) {
      setError('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cupons</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Código</th>
            <th className="p-2">Desconto</th>
            <th className="p-2">Válido até</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon: any) => (
            <tr key={coupon.id} className="border-t">
              <td className="p-2">{coupon.code}</td>
              <td className="p-2">{coupon.discount}%</td>
              <td className="p-2">{new Date(coupon.validUntil).toLocaleDateString()}</td>
              <td className="p-2">
                <button className="text-blue-600 hover:underline">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2:** `frontend/src/AppRouter.tsx`
```typescript
import { CouponsAdmin } from './components/CouponsAdmin';

<Route path="/admin/coupons" element={<CouponsAdmin />} />
```

**Step 3:** Usar API
```typescript
import { api } from '../services/apiService';

// GET
const { data } = await api.get('/coupons');

// POST
await api.post('/coupons', { code: 'PROMO10', discount: 10 });

// PATCH
await api.patch('/coupons/id-123', { discount: 20 });

// DELETE
await api.delete('/coupons/id-123');
```

---

## 🗄️ Integrar com Banco de Dados

### Conexão MySQL

#### 1️⃣ Instalar/Iniciar MySQL
```bash
# macOS (Homebrew)
brew install mysql
brew services start mysql

# Windows (exe installer)
# ou usar Docker
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=Voyageturbo13 \
  -p 3306:3306 \
  mysql:8.0

# Linux (apt)
sudo apt-get install mysql-server
sudo service mysql start
```

#### 2️⃣ Criar database
```bash
mysql -u root -p
# Digite senha

CREATE DATABASE burgueroficial;
EXIT;
```

#### 3️⃣ Configurar .env
```bash
cd backend

# Copiar exemplo
cp .env.example .env

# Editar .env com suas credenciais
DATABASE_URL="mysql://root:Voyageturbo13@localhost:3306/burgueroficial"
JWT_SECRET="sua-chave-super-secreta"
MERCADO_PAGO_ACCESS_TOKEN="seu-token"
GEMINI_API_KEY="sua-chave"
```

#### 4️⃣ Rodar migrations
```bash
npx prisma generate
npx prisma migrate dev
# Seleciona "Create a new migration"
```

#### 5️⃣ Verificar no Prisma Studio
```bash
npx prisma studio
# Abre http://localhost:5555
```

### Queries Úteis

**Ver logs:**
```bash
# Backend
tail -f logs/app.log

# MySQL
mysql -u root -p burgueroficial
SELECT COUNT(*) as TotalTabelas FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'burgueroficial';
```

**Limpar dados (CUIDADO!):**
```sql
-- Deletar todos os pedidos
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM customers;

-- Deletar todos os produtos
DELETE FROM products;
DELETE FROM categories;
```

**Backup:**
```bash
mysqldump -u root -p burgueroficial > backup.sql

# Restaurar
mysql -u root -p burgueroficial < backup.sql
```

---

## 🧪 Testes Rápidos

### 1️⃣ Health Check
```bash
curl http://localhost:3333/health
# Esperado: {"status":"ok"}
```

### 2️⃣ Criar Restaurante
```bash
curl -X POST http://localhost:3333/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Burger Express",
    "slug": "burger-express",
    "businessType": "restaurant"
  }'
```

### 3️⃣ Fazer Login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@burgerexpress.com",
    "password": "senha123"
  }'

# Copia o token
# Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ Criar Categoria (com token)
```bash
TENANT_ID="seu-tenant-id"
TOKEN="seu-token-jwt"

curl -X POST http://localhost:3333/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "name": "Hambúrgueres",
    "description": "Nossos hambúrgueres especiais"
  }'
```

### 5️⃣ Criar Produto
```bash
CATEGORY_ID="seu-category-id"

curl -X POST http://localhost:3333/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "categoryId": "'$CATEGORY_ID'",
    "name": "Hamburguês Premium",
    "description": "Pão artesanal, carne, queijo",
    "price": 35.90,
    "stock": 50,
    "image": "url-da-imagem"
  }'
```

### 6️⃣ Criar Pedido
```bash
curl -X POST http://localhost:3333/api/orders/$TENANT_ID/create \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": "product-id", "quantity": 2 }
    ],
    "customerName": "João",
    "customerPhone": "11999999999",
    "customerEmail": "joao@email.com",
    "paymentMethod": "pix"
  }'
```

### 7️⃣ Teste no Frontend
```
1. npm run dev (em frontend/)
2. Navegue para http://localhost:5173
3. Clique em "Admin"
4. Faça login com credentials
5. Crie categoria e produtos
6. Faça um pedido
7. Verifique se aparece no banco
```

---

## 🆘 Troubleshooting

### Docker não inicia
```bash
# Limpar containers
docker-compose down -v

# Reconstruir
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

### Backend não conecta ao MySQL
```bash
# Verificar se MySQL está rodando
docker-compose ps

# Testar conexão
mysql -h localhost -u root -p -e "SELECT 1;"

# Verificar .env
cat backend/.env | grep DATABASE_URL
```

### Prisma migration falha
```bash
# Reset banco (apaga tudo!)
npx prisma migrate reset

# ou, migrar apenas dev
npx prisma migrate dev

# Ver status
npx prisma migrate status
```

### Build falha com TypeScript
```bash
# Limpar cache
rm -rf backend/node_modules
npm install

# Recompile
npm run build

# Ver erros
npm run type-check
```

### Frontend conecta mas não carrega produtos
```bash
# Verificar se backend está rodando
curl http://localhost:3333/health

# Verificar console do navegador (F12)
# Verificar se token está salvo
localStorage.getItem('adminToken')

# Testar API diretamente
curl http://localhost:3333/api/products?tenant=seu-tenant
```

### Erro de CORS
```
# No backend, verificar middleware em server.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

---

## 🚀 Deploy

### Deploy Local (Produção Simulada)
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build

# Verificar builds
ls -la backend/dist/
ls -la frontend/dist/
```

### Deploy com Docker
```bash
# Build e push para Docker Hub
docker build -t seu-usuario/gemini-burger-backend backend/
docker build -t seu-usuario/gemini-burger-frontend frontend/
docker push seu-usuario/gemini-burger-backend
docker push seu-usuario/gemini-burger-frontend

# Em servidor remoto
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy na Vercel
```bash
# Frontend
cd frontend
npm run build
vercel --prod

# Backend (usar plataforma como Render/Railway)
# Seguir instruções em DEPLOY.md
```

---

## 📚 Referência de Arquivos

### Backend Controllers
| Arquivo | Responsável por | Status |
|---------|-----------------|--------|
| AutenticacaoController | Login, Register | ✅ |
| ProdutoController | CRUD Produtos | ✅ |
| PedidoController | CRUD Pedidos | ✅ |
| ClienteController | CRUD Clientes | ✅ |
| CategoriaController | CRUD Categorias | ✅ |
| PagamentoController | PIX, Mercado Pago | ⚠️ Parcial |
| TenantController | Multi-tenant | ✅ |
| ConfiguracaoController | Settings | ✅ |
| AnaliticasController | Relatórios | ⚠️ 8 erros TS |

### Backend Middlewares
| Arquivo | Função | Status |
|---------|--------|--------|
| autenticacaoMiddleware | JWT Validation | ✅ |
| tenantMiddleware | Multi-tenant Context | ⚠️ Import error |
| rateLimiter | Rate Limiting | ✅ |
| tratadorErros | Error Handling | ✅ |
| uploadMiddleware | File Upload | ✅ |

### Frontend Components
| Componente | Função | Status |
|-----------|--------|--------|
| App.tsx | Root App | ✅ |
| AppRouter | Navigation | ⚠️ DEMO Mode |
| AdminDashboard | Admin Panel | ✅ |
| LoginAdmin | Login Form | ✅ |
| ProductModal | Add Product Modal | ✅ |

### Banco de Dados
| Tabela | Registros | Pré-requisito |
|--------|-----------|--------------|
| tenants | 0-N | - |
| users | 0-N | tenant |
| plans | 3 | - |
| categories | 0-N | tenant |
| products | 0-N | tenant, category |
| customers | 0-N | tenant |
| orders | 0-N | tenant, customer |
| order_items | 0-N | order, product |
| coupons | 0-N | tenant |
| analytics | auto | tenant |

---

## 💡 Tips & Tricks

### Regenerar Prisma Client após mudanças
```bash
npx prisma generate
```

### Ver alterações pendentes no banco
```bash
npx prisma migrate status
```

### Resetar tudo (CUIDADO!)
```bash
npx prisma migrate reset
# Apaga dados, reapplica todas migrations, seeders
```

### Debug de queries SQL
```typescript
// backend/.env
DATABASE_URL="mysql://...?log=query"
```

### Hot reload sem rebuild
```bash
# Backend
npm run dev

# Frontend
npm run dev
# Ambos recarregam automaticamente ao salvar
```

---

## 📞 Suporte

### Documentação Principal
- [DOCUMENTACAO-TECNICA.md](DOCUMENTACAO-TECNICA.md) - Análise completa
- [README.md](README.md) - Visão geral
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura detalhada

### Contato
- Email: seu-email@seudominio.com
- Issues: GitHub Issues
- Discord: [Link do servidor]

---

**Última atualização:** 18 de janeiro de 2026  
**Versão:** 1.0.0  
**Autor:** Gemini Burger Dev Team
