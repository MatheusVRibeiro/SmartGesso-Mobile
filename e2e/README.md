# Testes E2E - SmartGesso-Mobile

Testes end-to-end usando Playwright para validar fluxos principais do aplicativo.

## Pré-requisitos

- Node.js 18+
- npm
- Expo CLI (para rodar o app)
- API SmartGesso rodando em `localhost:3000`

## Instalação

```bash
# Instalar dependências
npm install

# Instalar navegadores Playwright
npx playwright install
```

## Configuração

### Variáveis de Ambiente

O app precisa estar rodando em `localhost:8081` (Expo web).

### Credenciais de teste

- **Email:** a.mult@example.com
- **Senha:** Senha@123456

## Executar Testes

### Todos os testes

```bash
npm run test:e2e
```

### Com interface gráfica (recomendado para debug)

```bash
npm run test:e2e:ui
```

### Modo debug (passo a passo)

```bash
npm run test:e2e:debug
```

### Testes específicos

```bash
# Apenas testes de login
npx playwright test login

# Apenas testes de orçamento
npx playwright test orcamento

# Apenas testes de serviço
npx playwright test servico

# Apenas testes offline
npx playwright test offline
```

## Estrutura dos Testes

```
e2e/
├── login.spec.ts       # Testes de autenticação
├── orcamento.spec.ts   # Testes de criação/edição de orçamentos
├── servico.spec.ts     # Testes de aprovação e status de serviços
└── offline.spec.ts     # Testes de funcionamento offline
```

## Fluxos Testados

### Login (`login.spec.ts`)
- Renderização da tela de login
- Validação de credenciais inválidas
- Login com sucesso e navegação para dashboard
- Logout correto

### Orçamentos (`orcamento.spec.ts`)
- Listagem de orçamentos existentes
- Criação de novo orçamento via wizard
- Edição de orçamento existente

### Serviços (`servico.spec.ts`)
- Listagem de serviços
- Aprovação de orçamento e criação de serviço
- Atualização de status do serviço
- Histórico de serviços

### Modo Offline (`offline.spec.ts`)
- Detecção de conexão offline
- Criação de pagamento offline
- Sincronização ao voltar online
- Gerenciamento da fila de sincronização

## Relatório de Testes

Após executar os testes, um relatório HTML é gerado em `playwright-report/`.

```bash
# Abrir relatório
npx playwright show-report
```

## Screenshots e Vídeos

- Screenshots são salvos em `test-results/` quando há falhas
- Vídeos são gravados no primeiro retry

## Troubleshooting

### App não inicia

```bash
# Verificar se Expo está rodando
npx expo start --web
```

### API não responde

Verifique se a SmartGesso-API está rodando em `localhost:3000`.

### Testes falham no CI

- Verifique se as credenciais de teste existem no banco
- Confirme que a API está acessível
- Ajuste timeouts conforme necessidade

## Ambiente CI

Para CI, defina a variável `CI=true`:

```bash
CI=true npm run test:e2e
```
