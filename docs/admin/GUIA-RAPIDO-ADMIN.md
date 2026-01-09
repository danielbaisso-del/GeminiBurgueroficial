# 🚀 Guia Rápido - Área Administrativa

## 📋 Instalação em 3 Passos

### 1️⃣ Instalar Dependências do Backend
```bash
cd backend
npm install multer @types/multer
```

### 2️⃣ Atualizar Banco de Dados
```bash
npx prisma generate
npx prisma migrate dev --name add-admin-config-fields
```

### 3️⃣ Iniciar Aplicação
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔐 Primeiro Acesso

1. Abra `http://localhost:5173`
2. Clique no ícone de **engrenagem** (⚙️) no canto inferior esquerdo
3. Faça login com suas credenciais de admin

## 🎯 Funcionalidades Principais

### 📊 Visão Geral
- Veja estatísticas em tempo real
- Total de pedidos e faturamento
- Pedidos pendentes
- Total de produtos cadastrados

### 🍔 Gerenciar Produtos

#### Criar Produto
1. Clique em **"Novo Produto"**
2. Faça upload da imagem
3. Preencha nome, descrição e preço
4. Selecione a categoria
5. Adicione calorias e estoque (opcional)
6. Clique em **"Criar Produto"**

#### Editar Produto
1. Clique no ícone de **lápis** (✏️) no produto
2. Faça as alterações necessárias
3. Clique em **"Atualizar Produto"**

#### Ativar/Desativar Produto
- Clique no ícone de **olho** (👁️) no produto
- Verde = disponível | Vermelho = indisponível

#### Excluir Produto
- Clique no ícone de **lixeira** (🗑️)
- Confirme a exclusão

### ⚙️ Configurações

#### Informações Básicas
```
✏️ Nome do Estabelecimento
📞 Telefone
💬 WhatsApp
🟢/🔴 Status (Aberto/Fechado)
```

#### 🎨 Personalizar Cores
Clique nos seletores de cor para personalizar:
- 🟠 Cor Primária (laranja padrão)
- ⚫ Cor Secundária (preto padrão)
- 🟧 Cor de Destaque
- ⚪ Cor do Texto
- ⬛ Cor de Fundo

#### 🖼️ Logo e Banner
1. Clique em **"Carregar Logo"** ou **"Carregar Banner"**
2. Selecione a imagem (max 5MB)
3. Veja o preview
4. Clique em **"Salvar Configurações"**

#### 📍 Endereço
Preencha todos os campos:
```
CEP: _____-___
Rua: _______________
Número: _____
Bairro: _______________
Cidade: _______________
Estado: __
```

### 💾 Salvar Alterações
Sempre clique em **"Salvar Configurações"** após fazer mudanças!

## 🎨 Dicas de Personalização

### Cores Recomendadas

**Esquema Laranja (Atual)**
```
Primária:    #ea580c (laranja escuro)
Secundária:  #18181b (preto)
Destaque:    #f97316 (laranja)
Texto:       #ffffff (branco)
Fundo:       #0a0a0a (preto)
```

... (continues in original)
