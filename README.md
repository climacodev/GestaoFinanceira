# Contable - Sistema de Gestão Financeira Pessoal Multiplataforma

O **Contable** é um sistema completo de gestão financeira pessoal (SaaS) premium, inspirado no design moderno, minimalista e intuitivo do aplicativo Contable, Mobills e interfaces do Nubank.

O ecossistema é composto por:
1. **Backend (API):** Desenvolvido em NestJS (TypeScript), Prisma ORM, segurança JWT e módulo de Inteligência Artificial para coaching financeiro.
2. **Frontend Web:** Construído em Next.js (App Router), Tailwind CSS (glassmorphism dark-theme), Recharts para gráficos interativos e Framer Motion.
3. **Mobile App:** Aplicativo móvel híbrido em React Native com Expo Shell contendo login biométrico e dashboard de finanças.

---

## 🛠️ Tecnologia Utilizada

### Backend
* **NestJS** (Arquitetura modular organizada sob princípios SOLID e Clean Architecture)
* **Prisma ORM** (Configurado com SQLite out-of-the-box para execução instantânea, facilmente chaveável para PostgreSQL)
* **Passport JWT** (Autenticação de usuários segura)
* **Swagger UI** (Documentação automática de endpoints da API)

### Frontend Web
* **Next.js 14** (TypeScript & App Router)
* **Tailwind CSS** (Tema Dark Space, bordas glassmorphism e orbs de neon flutuantes)
* **Recharts** (Visualização de fluxo de caixa mensal e distribuição de categorias)
* **Lucide React** (Pacote de ícones minimalistas)

### Mobile App
* **React Native + Expo**
* **StatusBar & Stylesheet API** (Ajustado com tema escuro de alto contraste)

---

## 📂 Estrutura do Projeto

```text
GestaoFinanceira/
├── backend/                   # Microserviço NestJS API
│   ├── prisma/                # Schema de banco de dados e migrations SQLite/Postgres
│   ├── src/                   # Código fonte (Auth, Finance, AI, Reports, Prisma modules)
│   ├── Dockerfile             # Configuração Docker do Backend
│   └── package.json
│
├── frontend/                  # Aplicação Web Next.js
│   ├── src/                   # Código fonte (App router, Componentes, Helpers de API)
│   ├── Dockerfile             # Configuração Docker do Frontend
│   └── package.json
│
├── mobile/                    # Aplicativo Híbrido React Native Expo
│   ├── App.tsx                # Fluxo de onboarding, login biométrico e extrato mobile
│   └── package.json
│
├── docker-compose.yml         # Orquestrador de serviços (App + DB PostgreSQL + Redis Cache)
└── README.md                  # Documentação de referência
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* **Node.js** v18 ou superior instalado localmente.
* **npm** ou **yarn**.

---

### Opção 1: Inicialização Local Separada (Recomendado para Testes Rápidos)

#### Passo 1: Iniciar o Backend
```bash
# Navegue até a pasta do backend
cd backend

# Execute as migrations do Prisma para estruturar o dev.db (SQLite)
npx prisma db push

# Inicie o servidor em modo de desenvolvimento (Porta 3001)
npm run start:dev
```
* O backend rodará em: `http://localhost:3001`
* Documentação interativa Swagger disponível em: `http://localhost:3001/docs`

#### Passo 2: Iniciar o Frontend Web
```bash
# Abra um novo terminal na raiz do projeto e navegue para o frontend
cd frontend

# Inicie o servidor web em modo de desenvolvimento (Porta 3000)
npm run dev
```
* O painel web estará pronto para acesso em: `http://localhost:3000`
* O frontend possui **mecanismo de fallback automático** para banco de dados mockado local no navegador caso a API backend esteja desligada, facilitando a navegação.

#### Passo 3: Iniciar o Aplicativo Mobile (Expo)
```bash
# Abra outro terminal na raiz do projeto e navegue para a pasta mobile
cd mobile

# Inicie o empacotador Expo
npm run start
```
* Pressione `w` no terminal para rodar a demonstração no navegador, ou escaneie o QR Code com o aplicativo **Expo Go** em seu celular (iOS/Android) para ver a interface mobile.

---

### Opção 2: Inicialização via Docker Compose (PostgreSQL + Redis + App)

Caso tenha o Docker instalado e rodando em sua máquina, você pode subir o ecossistema completo integrado ao PostgreSQL e cache do Redis:

```bash
# Na raiz do projeto, suba o container
docker-compose up --build
```
Isso criará:
* Banco PostgreSQL rodando na porta `5432`
* Redis Cache rodando na porta `6379`
* Backend API na porta `3001` (apontando automaticamente para o PostgreSQL)
* Frontend Web na porta `3000`

---

## 💡 Recursos de Destaque Implementados

1. **Dashboard Financeiro Completo:** KPIs interativos atualizados dinamicamente, gráficos de área para fluxo de caixa, gráficos de rosca para distribuição de despesas por categoria.
2. **AI Co-Pilot (Inteligência Artificial):** Painel de insights gerando alertas de orçamento (ex: *Despesa com Alimentação ultrapassou a média*) e um chat interativo em tempo real que lê seus saldos e metas para dar conselhos financeiros em português.
3. **Importação OFX/Spreadsheet:** Envie arquivos de extrato bancário. O sistema faz a leitura mockada e cria transações na hora.
4. **Metas Gamificadas:** Barra de progresso das metas financeiras com medalhas de conquistas de acordo com seu desempenho de poupança (Poupador Iniciante, Economista Prata, Lenda das Finanças).
5. **Simulador de Faturas:** Liquide suas faturas de cartões de crédito debitando automaticamente o valor correspondente de contas bancárias ativas.
6. **Contable Premium (SaaS):** Upgrade de plano premium simulado alterando permissões do banco e desbloqueando funcionalidades exclusivas.
