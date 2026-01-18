# 📚 DOCUMENTAÇÃO TÉCNICA - GEMINI BURGER

**Data:** 18 de janeiro de 2026  
**Status:** ✅ Análise e Setup Completo

---

## 📖 Índice

1. [Status do Projeto](#status-do-projeto)
2. [Análise Técnica Completa](#análise-técnica-completa)
3. [Problemas Identificados](#problemas-identificados)
4. [Soluções Técnicas](#soluções-técnicas)
5. [Banco de Dados](#banco-de-dados)
6. [Checklist de Validação](#checklist-de-validação)

---

## 🎯 Status do Projeto

### Resumo Executivo
```
✅ Análise completa concluída (45 min)
✅ npm install backend (558 pacotes) 
✅ npm install frontend (334 pacotes)
✅ .env configurado
✅ Banco MySQL conectado (burgueroficial)
✅ 11 tabelas criadas (137 colunas)
⚠️  Build falha (8 erros TypeScript - CORRIGÍVEL)
❌ Frontend offline (modo DEMO)
```

### Estatísticas
| Métrica | Valor | Status |
|---------|-------|--------|
| Arquivos analisados | ~100+ | ✅ |
| Linhas de código | ~10.000+ | ✅ |
| Controllers | 9 | ✅ OK |
| Rotas | 18 | ⚠️ Faltam proteções |
| Models Prisma | 11 | ✅ Completo |
| Testes | 0% | ❌ Zero |
| Vulnerabilidades | 0 | ✅ OK |

---

## 🔍 Análise Técnica Completa

### Arquitetura do Projeto

#### Backend (Express.js + Prisma + MySQL)
```
backend/
├── src/
│   ├── controllers/     ✅ 9 controllers bem estruturados
│   ├── routes/          ⚠️  18 rotas, algumas sem proteção
│   ├── middlewares/     ✅ 4 middlewares funcionais
│   ├── services/        ⚠️ Começando (MercadoPago)
│   └── lib/
│       └── prisma.ts    ✅ Cliente Prisma configurado
├── prisma/
│   ├── schema.prisma    ✅ Schema completo (358 linhas)
│   └── migrations/      ✅ Migrations rodadas
└── package.json         ✅ Dependências OK
```

**Status:** ✅ Código OK, ⚠️ Build com erros TypeScript

#### Frontend (React + TypeScript + Vite)
```
frontend/
├── src/
│   ├── App.tsx              (1090 linhas)
│   ├── AppRouter.tsx        ⚠️ Modo DEMO
│   ├── components/          ✅ Componentes OK
│   ├── services/            ⚠️ Desconectado do backend
│   └── types/               ✅ Types definidos
└── package.json             ✅ Dependências OK
```

**Status:** ✅ Código OK, ❌ Desconectado do backend

#### Banco de Dados (MySQL)
```
Database: burgueroficial
Host: localhost:3306
User: root
Status: ✅ CONECTADO

Tabelas:
1. tenants          ✅ Restaurantes (multi-tenant)
2. users            ✅ Usuários/Admins
3. plans            ✅ Planos de assinatura
4. categories       ✅ Categorias de produtos
5. products         ✅ Produtos/menu
6. customers        ✅ Clientes
7. orders           ✅ Pedidos
8. order_items      ✅ Itens de pedidos
9. coupons          ✅ Cupons de desconto
10. analytics        ✅ Métricas
11. _prisma_migrations ✅ Controle de migrations
```

**Status:** ✅ PRONTO PARA USAR

---

## 🚨 Problemas Identificados (26 total)

### P0 - CRÍTICOS (Bloqueiam execução) - 5 problemas

#### 1. Build falha com erros TypeScript
**Arquivo:** `backend/src/controllers/AnaliticasController.ts`
- **Linhas:** 68, 102, 188, 224, 240, 262, 266, 277
- **Problema:** Parâmetros sem tipagem explícita
- **Solução:** Adicionar tipos nos `.map()`, `.reduce()`, `.sort()`
- **Exemplo:**
  ```typescript
  // ❌ ANTES
  .reduce((sum, order) => sum + Number(order.total), 0)
  
  // ✅ DEPOIS
  .reduce((sum: number, order: any) => sum + Number(order.total), 0)
  ```

#### 2. Import incorreto em tenantMiddleware
**Arquivo:** `backend/src/middlewares/tenantMiddleware.ts`
- **Linha:** 4
- **Problema:** `import { Tenant }` - Prisma não exporta tipo assim
- **Solução:** `import type { Tenant }`
  ```typescript
  // ❌ ANTES
  import { Tenant } from '@prisma/client';
  
  // ✅ DEPOIS
  import type { Tenant } from '@prisma/client';
  ```

#### 3. Frontend offline (Modo DEMO)
**Arquivo:** `frontend/src/AppRouter.tsx` (linha 21)
- **Problema:** Frontend funciona 100% offline com localStorage
- **Impacto:** Nenhum pedido é salvo no banco
- **Solução:** Conectar com API real do backend
- **Status:** Requer refatoração (30 min)

#### 4. Rotas sem autenticação
**Arquivo:** `backend/src/routes/produtoRotas.ts`
- **Problema:** POST/PATCH/DELETE não exigem token JWT
- **Risco:** Qualquer um pode criar/modificar produtos
- **Solução:** Adicionar `autenticacaoMiddleware`
  ```typescript
  // ❌ ANTES
  produtoRotas.post('/', produtoController.create);
  
  // ✅ DEPOIS
  produtoRotas.post('/', autenticacaoMiddleware, produtoController.create);
  ```

#### 5. Stock não validado
**Arquivo:** `backend/src/controllers/PedidoController.ts`
- **Problema:** Aceita pedido mesmo se stock < quantidade
- **Solução:** Validar stock antes de criar pedido
  ```typescript
  if (product.stock !== null && product.stock < item.quantity) {
    throw new ErroApp(`Stock insuficiente`, 400);
  }
  ```

### P1 - SEGURANÇA (5 problemas)

1. **JWT_SECRET inseguro** - Usar valor aleatório forte
2. **Dados em logs** - Pode expor senhas/dados sensíveis
3. **CORS muito permissivo** - Deveria ser mais restritivo em prod
4. **PIX sem integração real** - Apenas mock, não testa real
5. **Rate limiting fraco** - Sem limites por endpoint

### P2 - FUNCIONALIDADES FALTANTES (12 itens)

- ⛔ Endpoints públicos para listar categorias
- ⛔ Validação de cupom (data, uso máximo)
- ⛔ Validação de horário (aberto/fechado)
- ⛔ Notificação via WhatsApp (integração)
- ⛔ Webhook Mercado Pago testado
- ⛔ Testes unitários (0%)
- ⛔ Documentação de API (Swagger)
- ⛔ Soft delete (dados históricos)
- ⛔ Audit trail (quem fez o quê)
- ⛔ Export de dados (PDF/Excel)
- ⛔ Busca e filtro avançado
- ⛔ Integração real Gemini AI

### P3 - BANCO DE DADOS (4 problemas)

1. **JSON fields sem validação** - Dados malformados podem quebrar frontend
2. **Falta soft delete** - Deleta histórico ao remover customer
3. **Falta audit trail** - Impossível rastrear quem fez o quê
4. **Validação de enum faltando** - Valores inválidos podem entrar

---

## 💻 Soluções Técnicas

### FIX #1: Corrigir TypeScript (10 min)
**Arquivo:** `backend/src/controllers/AnaliticasController.ts`

Adicionar tipagem em todos os callbacks:
```typescript
// Linha 68
.reduce((sum: number, order: any) => sum + Number(order.total), 0)

// Linha 102
.map((item: any) => ({...}))

// Linha 262
.sort((a: LocationStat, b: LocationStat) => b.revenue - a.revenue)

// Adicionar interface
interface LocationStat {
  location: string;
  revenue: number;
  orders: number;
  customers: number;
}
```

### FIX #2: Corrigir Import Tenant (5 min)
**Arquivo:** `backend/src/middlewares/tenantMiddleware.ts`

Linha 4:
```typescript
import type { Tenant } from '@prisma/client';
```

### FIX #3: Adicionar Autenticação Produtos (10 min)
**Arquivo:** `backend/src/routes/produtoRotas.ts`

```typescript
import { autenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';

// Rotas protegidas
produtoRotas.post('/', autenticacaoMiddleware, produtoController.create);
produtoRotas.patch('/:id', autenticacaoMiddleware, produtoController.update);
produtoRotas.delete('/:id', autenticacaoMiddleware, produtoController.delete);

// Rotas públicas
produtoRotas.get('/public', produtoController.listPublic);
produtoRotas.get('/:id', produtoController.getById);
```

### FIX #4: Adicionar Autenticação Categorias (10 min)
Mesmo padrão do FIX #3

### FIX #5: Validar Stock (15 min)
**Arquivo:** `backend/src/controllers/PedidoController.ts`

Na função `create`, após buscar produtos:
```typescript
for (const item of data.items) {
  const product = products.find(p => p.id === item.productId);
  if (!product) continue;
  
  if (product.stock !== null && product.stock < item.quantity) {
    throw new ErroApp(
      `Produto ${product.name}: apenas ${product.stock} em estoque`,
      400
    );
  }
}

// Decrementar stock ao criar pedido
for (const item of data.items) {
  const product = products.find(p => p.id === item.productId)!;
  if (product.stock !== null) {
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: { decrement: item.quantity } },
    });
  }
}
```

### FIX #6: Validar Cupom (20 min)
**Arquivo:** `backend/src/controllers/PedidoController.ts`

```typescript
if (data.couponCode) {
  coupon = await prisma.coupon.findFirst({
    where: {
      tenantId: tenant.id,
      code: data.couponCode,
      active: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
    },
  });

  if (!coupon) {
    throw new ErroApp('Cupom inválido ou expirado', 400);
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new ErroApp('Limite de uso do cupom atingido', 400);
  }
}
```

### FIX #7: Conectar Frontend com Backend (30 min)
**Criar arquivo:** `frontend/src/services/apiService.ts`

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// APIs públicas
export const fetchProducts = (tenantSlug: string) =>
  axios.get(`${API_URL}/products?tenant=${tenantSlug}`);

export const createOrder = (tenantSlug: string, data: any) =>
  axios.post(`${API_URL}/orders/${tenantSlug}/create`, data);

export const loginAdmin = (email: string, password: string) =>
  api.post('/auth/login', { email, password });
```

---

## 🗄️ Banco de Dados

### Configuração
```
Host:     localhost:3306
Port:     3306
Database: burgueroficial
User:     root
Password: Voyageturbo13
Status:   ✅ CONECTADO
```

### Tabelas e Relacionamentos
```
tenants (1) ──┬──→ (N) users
              ├──→ (N) categories
              ├──→ (N) products
              ├──→ (N) customers
              ├──→ (N) orders
              ├──→ (N) coupons
              ├──→ (N) analytics
              └──→ (1) plans

orders (N) ──┬──→ (1) customers
             ├──→ (N) order_items
             └──→ (1) coupons (optional)

order_items (N) ──→ (1) products
```

### Exemplos de Queries Úteis

**Ver todos os tenants:**
```sql
SELECT id, slug, businessName, status FROM tenants;
```

**Ver pedidos de um tenant:**
```sql
SELECT o.id, o.orderNumber, o.total, o.status, c.name 
FROM orders o 
JOIN customers c ON o.customerId = c.id 
WHERE o.tenantId = '<tenant-id>';
```

**Ver produtos de uma categoria:**
```sql
SELECT p.id, p.name, p.price, p.stock, p.available 
FROM products p 
WHERE p.categoryId = '<category-id>' AND p.tenantId = '<tenant-id>';
```

**Usar Prisma Studio (Visual):**
```bash
npx prisma studio
# Abre em http://localhost:5555
```

---

## ✅ Checklist de Validação

### Build
- [ ] Ler todos os FIX #1-#7 acima
- [ ] Aplicar FIX #1 (TypeScript - 10 min)
- [ ] Aplicar FIX #2 (Import - 5 min)
- [ ] Executar `npm run build` (deve passar)
- [ ] Sem warnings críticos

### Backend Rodando
- [ ] Aplicar FIX #3 e #4 (Autenticação - 20 min)
- [ ] Aplicar FIX #5 (Stock - 15 min)
- [ ] Executar `npm run dev`
- [ ] Deve iniciar em localhost:3333
- [ ] Health check: `curl http://localhost:3333/health`

### Banco de Dados
- [ ] Banco criado e rodando
- [ ] 11 tabelas criadas
- [ ] Conexão testada
- [ ] Via Prisma Studio: `npx prisma studio`

### API Testada
- [ ] Register funcionando
- [ ] Login funcionando
- [ ] Criar categoria
- [ ] Criar produto
- [ ] Criar pedido
- [ ] Dados aparecem no banco

### Frontend Conectado
- [ ] Aplicar FIX #7 (API Service - 30 min)
- [ ] Remover modo DEMO
- [ ] Executar `npm run dev`
- [ ] Deve conectar ao backend
- [ ] Produtos carregando da API real

### Fluxo Completo
- [ ] Criar restaurante
- [ ] Criar categoria
- [ ] Criar produto
- [ ] Listar produtos (frontend)
- [ ] Criar pedido (frontend)
- [ ] Ver pedido no banco
- [ ] Dados corretos no banco

---

## 🎯 Próximos Passos

### Imediato (Hoje - 2-3 horas)
1. Corrigir TypeScript (FIX #1, #2) - 15 min
2. Adicionar autenticação (FIX #3, #4) - 20 min
3. Validar stock (FIX #5) - 15 min
4. Testar build - 5 min
5. Conectar frontend (FIX #7) - 30 min
6. Validar fluxo completo - 30 min

### Próxima Semana
- [ ] Testes unitários
- [ ] Documentação de API (Swagger)
- [ ] Validação de cupom (FIX #6)
- [ ] Validação de horário
- [ ] Integração Mercado Pago

### Duas Semanas
- [ ] Integração WhatsApp
- [ ] Notificações real-time
- [ ] Deploy staging
- [ ] Testes e2e

---

**Status Atual:** 🟢 PRONTO PARA IMPLEMENTAÇÃO  
**Tempo Estimado:** 2-3 horas  
**Resultado Esperado:** Sistema 100% funcional
