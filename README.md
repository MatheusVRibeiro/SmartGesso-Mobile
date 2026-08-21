# SmartGesso Mobile 🏗️

**Aplicativo operacional mobile para empresas assinantes do SmartGesso**

O SmartGesso Mobile é a aplicação mobile do ecossistema SmartGesso, uma plataforma SaaS multiempresa para gestão comercial, operacional, produtiva e financeira de empresas de gesso e drywall.

---

## 📋 Índice

- [Contexto do Projeto](#contexto-do-projeto)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Execução no Android](#execução-no-android)
- [API](#api)
- [OpenAPI](#openapi)
- [Testes](#testes)
- [EAS Build](#eas-build)
- [Segurança](#segurança)
- [Problemas Comuns](#problemas-comuns)
- [Stack Completa](#stack-completa)
- [Documentação Adicional](#documentação-adicional)

---

## Contexto do Projeto

O SmartGesso surgiu de uma necessidade real de pequenas empresas do setor de gesso. Atualmente, muitas dessas empresas utilizam cadernos, planilhas, WhatsApp e cálculos manuais, o que causa perda de informações, erros de orçamento e falta de clareza sobre lucro.

O SmartGesso Mobile é o aplicativo operacional que permite aos usuários:

- **Autenticar** e gerenciar sessões seguras
- **Selecionar** e trocar entre empresas (multiempresa)
- Acessar **dashboards** com indicadores em tempo real
- Gerenciar **clientes** e suas obras
- Realizar **medições** e cálculos de materiais
- Criar **orçamentos** e compartilhar PDFs
- Controlar **ordens de produção** e serviço
- Gerenciar **financeiro** (recebimentos, cobranças, despesas)
- Controlar **estoque** e movimentações
- Funcionar com **internet instável** (offline first)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    SmartGesso Mobile                        │
│                    (Expo + React Native)                     │
├─────────────────────────────────────────────────────────────┤
│  App Router (auth/company/app)  │  State (Zustand)         │
├─────────────────────────────────────────────────────────────┤
│  Services (Axios)              │  Storage (SecureStore)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SmartGesso API                           │
│                    (NestJS + Prisma)                        │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Companies  │  Clients  │  Orders  │  Finance   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL (Hostinger)                        │
└─────────────────────────────────────────────────────────────┘
```

**Fluxo de dados:**
1. Mobile consome API REST via HTTPS
2. API valida autenticação JWT (access + refresh tokens)
3. API acessa banco MySQL via Prisma ORM
4. Mobile armazena tokens no SecureStore (nunca AsyncStorage)

---

## Pré-requisitos

| Ferramenta | Versão Mínima | Versão Recomendada |
|------------|---------------|-------------------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 9.0.0 | 10.x |
| Expo CLI | 16.0.0 | 16.x |
| Android Studio | — | Última estável |
| JDK | 17 | 17 ou 21 |
| Git | 2.30+ | Última estável |

**Para celular físico:**
- Android 6.0+ (API 23+)
- Expo Go instalado OU development build

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/[ORG]/smartgesso-mobile.git
cd smartgesso-mobile
```

### 2. Instale dependências

```bash
npm install
```

### 3. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com os valores do seu ambiente.

### 4. Verifique o ambiente

```bash
npx expo-doctor
```

### 5. Inicie o desenvolvimento

```bash
npx expo start
```

---

## Variáveis de Ambiente

O arquivo `.env.example` contém as variáveis públicas necessárias:

```bash
# URL base da API
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1

# Ambiente da aplicação
EXPO_PUBLIC_APP_ENV=development

# Nome da aplicação
EXPO_PUBLIC_APP_NAME=SmartGesso

# WhatsApp de suporte (formato: 5511999999999)
EXPO_PUBLIC_SUPPORT_WHATSAPP=

# Email de suporte
EXPO_PUBLIC_SUPPORT_EMAIL=
```

**Variáveis importantes:**
- `EXPO_PUBLIC_API_URL` — URL base da API (inclui `/api/v1`)
- `EXPO_PUBLIC_APP_ENV` — `development`, `staging` ou `production`

> ⚠️ **Nunca** coloque `DATABASE_URL` no mobile. O banco de dados é acessado apenas pela API.

---

## Execução no Android

### Opção 1: Emulador Android

1. Instale o Android Studio
2. Configure um AVD (Android Virtual Device)
3. Inicie o emulador
4. Execute:

```bash
npx expo start --android
```

### Opção 2: Celular Físico

1. Instale o **Expo Go** na Play Store
2. Conecte o celular à mesma rede Wi-Fi
3. Execute:

```bash
npx expo start
```

4. Escaneie o QR Code com o Expo Go

### Opção 3: Development Build

```bash
# Crie o development build
eas build --profile development --platform android

# Instale no celular
eas build:install

# Inicie
npx expo start --dev-client
```

---

## API

O SmartGesso Mobile consome a API REST do SmartGesso-API.

### URL Base

```
Desenvolvimento: http://localhost:3000/api/v1
Produção:       https://[DOMINIO]/api/v1
```

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login do usuário |
| POST | `/auth/refresh` | Renovar access token |
| GET | `/auth/me` | Dados do usuário autenticado |
| POST | `/auth/forgot-password` | Solicitar recuperação de senha |
| POST | `/auth/reset-password` | Redefinir senha |
| POST | `/auth/accept-invitation` | Aceitar convite |
| GET | `/auth/companies` | Listar empresas do usuário |
| POST | `/auth/switch-company` | Trocar empresa ativa |

### Contrato

A API retorna responses no formato:

```json
{
  "data": { ... },
  "message": "Sucesso"
}
```

Para erros:

```json
{
  "message": "Descrição do erro",
  "code": "ERROR_CODE",
  "errors": { "campo": ["Erro específico"] }
}
```

---

## OpenAPI

> 📝 **PENDENTE:** Gerar client a partir do OpenAPI da API SmartGesso

```bash
npm run api:generate
```

Quando disponível, os tipos TypeScript serão gerados automaticamente a partir do spec OpenAPI da API.

---

## Testes

### Rodar Todos os Testes

```bash
npm test
```

### Rodar em Modo Watch

```bash
npm run test:watch
```

### Tipos e Lint

```bash
npm run typecheck
npm run lint
```

### Cobertura

```bash
npm test -- --coverage
```

**Alvo de cobertura:** 80%+ para componentes e serviços críticos.

### Testes E2E (Playwright)

```bash
# Instalar dependências
npm install
npx playwright install

# Executar todos os testes E2E
npm run test:e2e

# Interface gráfica (debug)
npm run test:e2e:ui

# Modo debug (passo a passo)
npm run test:e2e:debug
```

**Credenciais de teste:**
- Email: a.mult@example.com
- Senha: Senha@123456

**Fluxos testados:**
- Login e autenticação
- Criação e edição de orçamentos
- Aprovação de orçamentos e serviços
- Modo offline e sincronização

Consulte `e2e/README.md` para documentação completa.

---

## EAS Build

O projeto está configurado para uso com EAS (Expo Application Services).

### Perfis de Build

| Perfil | Uso | Distribuição |
|--------|-----|--------------|
| `development` | Desenvolvimento local | Internal |
| `preview` | Testes internos | Internal |
| `production` | Publicação | Store |

### Comandos

```bash
# Build de desenvolvimento
eas build --profile development --platform android

# Build de preview
eas build --profile preview --platform android

# Build de produção
eas build --profile production --platform android

# Submeter à Play Store
eas submit --profile production --platform android
```

### Configuração

O arquivo `eas.json` define os perfis:

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## Segurança

### Armazenamento de Tokens

- ✅ **Expo SecureStore** — armazenamento seguro para tokens
- ❌ **NUNCA** usar AsyncStorage para tokens ou dados sensíveis
- ❌ **NUNCA** expor tokens em logs, URLs ou analytics

### Multiempresa

- Cache isolado por empresa (companyId)
- Troca de empresa limpa dados da empresa anterior
- Tokens são revogados no logout

### JWT

- **Access Token:** 15 minutos (curto prazo)
- **Refresh Token:** 30 dias (longo prazo)
- Reuso de refresh token revoga todas as sessões anteriores

### Boas Práticas

- NUNCA colocar `DATABASE_URL` no mobile
- NUNCA confiar em `companyId` do body (usar contexto de autenticação)
- Sempre limpar cache ao trocar empresa
- NUNCA inventar dados de produção
- Validar dados com Zod em tempo de execução

---

## Problemas Comuns

### OneDrive / Sincronização

Se o projeto está em uma pasta sincronizada com OneDrive:

```bash
# Desabilite sincronização temporariamente
# Ou mova o projeto para C:\Users\SeuUsuario\Projetos
```

### Portas em Uso

```bash
# Porta 8081 (Metro)
npx expo start --port 8082

# Porta 19000 (Expo)
npx expo start --port 19001
```

### NODE_ENV

Nunca defina `NODE_ENV=production` em desenvolvimento. O Expo deve gerenciar isso automaticamente.

### Erros de Tipos

```bash
# Verificar tipos
npm run typecheck

# Limpar cache
rm -rf node_modules/.cache
npm install
```

### Build Falhou

```bash
# Verificar ambiente
npx expo-doctor

# Limpar cache do EAS
eas build --clear-cache
```

---

## Stack Completa

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React Native | 0.86.0 | Framework mobile |
| Expo | ~57.0.7 | Plataforma |
| Expo Router | ~57.0.14 | Navegação |
| TypeScript | ~6.0.3 | Linguagem (strict) |
| React | 19.2.3 | UI library |
| Zustand | ^5.0.15 | Estado global |
| TanStack Query | ^5.101.4 | Dados remotos |
| Axios | ^1.18.1 | HTTP client |
| React Hook Form | ^7.85.0 | Formulários |
| Zod | ^3.25.76 | Validação |
| Expo SecureStore | ^57.0.1 | Armazenamento seguro |
| Jest | ^30.4.2 | Testes unitários |
| React Native Testing Library | ^13.3.3 | Testes de componentes |
| ESLint | ^10.8.1 | Lint |
| Prettier | ^3.9.6 | Formatação |

---

## Fluxo Orçamento → Serviço

O fluxo principal do SmartGesso Mobile:
1. Gesseiro cria orçamento (wizard 8 etapas: cliente, local, medição, tipo de serviço, materiais, valores, prazo, pagamento)
2. Gesseiro envia ao cliente
3. Cliente aprova (notificação push) ou rejeita
4. Ao aprovar, serviço é criado automaticamente com dados reaproveitados do orçamento
5. Gesseiro agenda e executa o serviço (etapas, checklist, fotos)
6. Registra pagamentos e despesas vinculados ao serviço
7. Conclui e visualiza resultado financeiro

---

## Documentação Adicional

A documentação completa do projeto está organizada na pasta `docs/`:

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura do sistema e estrutura de pastas |
| [NAVIGATION.md](docs/NAVIGATION.md) | Mapa de rotas e fluxos de navegação |
| [API_INTEGRATION.md](docs/API_INTEGRATION.md) | Integração com a API REST |
| [SECURITY.md](docs/SECURITY.md) | Práticas de segurança |
| [OFFLINE.md](docs/OFFLINE.md) | Estratégia offline first |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens e componentes do design system |
| [TESTING.md](docs/TESTING.md) | Estratégia e execução de testes |
| [ROADMAP.md](docs/ROADMAP.md) | Roadmap de implementação por fases |

---

## Contribuição

Este é um projeto privado do ecossistema SmartGesso. Para contribuições, consulte o repositório principal ou entre em contato com a equipe de desenvolvimento.

---

## Licença

Proprietário — Todos os direitos reservados.

---

**SmartGesso** © 2026 — Desenvolvido com 💙 para empresas de gesso e drywall