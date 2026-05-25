# Contable - Sistema de Gestão Financeira Pessoal Multiplataforma

O **Contable** é um sistema completo de gestão financeira pessoal (SaaS) premium, inspirado no design moderno, minimalista e intuitivo do aplicativo Contable, Mobills e interfaces do Nubank.

O ecossistema é composto por:
1. **Backend (API):** Desenvolvido em NestJS (TypeScript), Prisma ORM, segurança JWT e módulo de Inteligência Artificial para coaching financeiro.
2. **Frontend Web:** Construído em Next.js 14 (App Router), Tailwind CSS (glassmorphism dark-theme), Recharts para gráficos interativos e Framer Motion.
3. **Mobile App:** Aplicativo móvel híbrido em React Native com Expo contendo login biométrico e dashboard de finanças.

---

## 🛠️ Tecnologia Utilizada

### Backend
* **NestJS** (Clean Architecture modular)
* **Prisma ORM** (Configurado com SQLite out-of-the-box para execução instantânea, chaveável para PostgreSQL)
* **Passport JWT** (Autenticação de usuários segura)
* **Swagger UI** (Documentação automática de endpoints em `/docs`)

### Frontend Web
* **Next.js 14** (TypeScript & App Router)
* **Tailwind CSS** (Tema Dark Space, bordas glassmorphism e orbs de neon)
* **Recharts** (Visualização de fluxo de caixa mensal e distribuição de categorias)
* **Lucide React** (Ícones minimalistas)

### Mobile App
* **React Native + Expo**
* **Expo Go** (Ambiente de testes em tempo real)
* **EAS Build** (Compilação e distribuição nativa)

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
├── frontend/                  # Aplicação Web Next.js 14
│   ├── src/                   # Código fonte (App router, Componentes, Helpers de API)
│   ├── Dockerfile             # Configuração Docker do Frontend
│   └── package.json
│
├── mobile/                    # Aplicativo Híbrido React Native Expo
│   ├── assets/                # Ícones e SplashScreen oficiais
│   ├── App.tsx                # Fluxo de onboarding, login biométrico e extrato mobile
│   ├── app.json               # Configurações do Expo
│   ├── eas.json               # Perfis de compilação EAS (.apk)
│   └── package.json
│
├── docker-compose.yml         # Orquestrador de serviços (App + DB PostgreSQL + Redis Cache)
└── README.md                  # Guia de Instalação e Uso
```

---

## 🚀 Como Instalar e Iniciar o Projeto

### Pré-requisitos
* **Node.js** v18 ou superior instalado localmente.
* **npm** ou **yarn**.
* **Docker** (opcional, necessário apenas se optar por rodar via containers).

---

### Opção 1: Inicialização Local Separada (Recomendado para Desenvolvimento)

#### Passo 1: Configurar e Iniciar o Backend
```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Execute as migrations do Prisma para estruturar o banco local (SQLite dev.db)
npx prisma db push

# Inicie o servidor em modo de desenvolvimento (Porta 3001)
npm run start:dev
```
* O backend rodará em: `http://localhost:3001`
* Documentação interativa Swagger disponível em: `http://localhost:3001/docs`

#### Passo 2: Configurar e Iniciar o Frontend Web
```bash
# Em um novo terminal, vá para o frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor web (Porta 3000)
npm run dev
```
* O painel web estará pronto para acesso em: `http://localhost:3000`

#### Passo 3: Configurar e Iniciar o Aplicativo Mobile (Expo)
No macOS, é necessário aumentar o limite padrão de arquivos abertos do terminal (`ulimit`) antes de iniciar o Expo Metro Bundler para evitar o erro `EMFILE`:
```bash
# Em um novo terminal, vá para a pasta mobile
cd mobile

# Instale as dependências do app
npm install

# Inicie o Expo aumentando o limite de arquivos observados
ulimit -n 10240 && npm run start
```
* Pressione `w` no terminal para rodar a demonstração no navegador.
* Para rodar no celular/tablet, abra o app **Expo Go** no dispositivo e escaneie o QR Code gerado na tela do computador.

> [!TIP]
> Se o seu celular não conseguir conectar devido a bloqueios de rede local do roteador ou firewall do computador (exibindo a mensagem *"There was a problem running the requested app"*), execute o servidor em **modo túnel**:
> ```bash
> ulimit -n 10240 && npx expo start --tunnel
> ```

---

### Opção 2: Inicialização Completa via Docker Compose (PostgreSQL + Redis + App)

Caso tenha o Docker instalado e rodando em sua máquina, você pode subir todo o ecossistema integrado ao PostgreSQL e cache do Redis com um único comando na raiz do projeto:

```bash
# Na raiz de GestaoFinanceira, construa e inicialize os containers
docker-compose up --build
```
Isso criará:
* Banco **PostgreSQL** rodando na porta `5432`
* **Redis Cache** rodando na porta `6379`
* **Backend NestJS API** na porta `3001` (comunicando automaticamente com o Postgres)
* **Frontend Next.js** na porta `3000`

---

## 📦 Como Gerar o Arquivo `.apk` Standalone (Android)

Se você deseja gerar um instalador nativo **`.apk`** para instalar e testar o app permanentemente em um tablet ou celular Android, sem depender do Expo Go:

1. Acesse a pasta mobile:
   ```bash
   cd mobile
   ```
2. Instale o EAS CLI caso ainda não possua:
   ```bash
   npm install -g eas-cli
   ```
3. Faça login no serviço do Expo:
   ```bash
   npx eas-cli login
   ```
4. Vincule a pasta local ao projeto online:
   ```bash
   npx eas-cli init
   ```
   *(Escolha o projeto `gestaofinanceira` de sua conta)*
5. Execute o comando de compilação:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

A compilação será executada nos servidores em nuvem do Expo. Quando o processo for concluído, o terminal exibirá um **QR Code** e um **link de download** direto do arquivo `.apk` gerado. Basta abrir no celular ou tablet Android para baixar e instalar!

---

## 💡 Recursos de Destaque Implementados

1. **Dashboard Financeiro:** KPIs interativos atualizados dinamicamente, gráficos de evolução do fluxo de caixa e distribuição de despesas por categoria.
2. **AI Co-Pilot:** Inteligência Artificial integrada gerando alertas automáticos sobre orçamentos excedidos e chat financeiro em tempo real em português.
3. **Importação OFX/Extratos:** Leitor automático de arquivos bancários estruturados gerando lançamentos diretos no extrato.
4. **Metas Gamificadas:** Sistema de economia planejada com progresso visual e medalhas de conquista baseadas em pontuação.
5. **Simulador de Faturas:** Quitação de cartão de crédito integrado que debita o valor da conta corrente associada.
6. **Plano Premium (SaaS):** Upgrade de assinatura simulado que destrava recursos VIP alterando o status do usuário no banco de dados.
