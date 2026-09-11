# SmartGesso Mobile — Plano de Refatoração e Evolução do Frontend V4

> **Documento de execução técnica e UX para Hermes / implementação incremental**  
> Repositório: `SmartGesso-Mobile`  
> Data-base da auditoria: 24/08/2026  
> Stack atual: Expo 57 + React Native + Expo Router + React Query + Zustand + Axios + Zod  
> Documento complementar: `SmartGesso-API/docs/PLANO_REFATORACAO_BACKEND_V4.md`

---

# 1. Objetivo deste documento

Este documento é a **especificação autoritativa da refatoração do frontend/mobile**. Ele foi escrito para ser executado em etapas separadas pelo Hermes.

Fluxo de execução recomendado:

```text
backend estabiliza contrato da etapa
  ↓
mobile cria /goal da etapa correspondente
  ↓
Hermes analisa código atual
  ↓
implementa somente a etapa
  ↓
lint + typecheck + testes + validação manual
  ↓
revisar diff
  ↓
commit/PR
  ↓
próxima etapa
```

Experiência principal a preservar:

```text
Início | Orçamentos | + Novo | Serviços | Mais
```

Fluxo de negócio alvo:

```text
Cliente
  ↓
Orçamento
  ↓ aprovado
Serviço
  ↓
Execução + Financeiro
  ↓
Conclusão
  ↓
Garantia / Retorno
```

Princípios obrigatórios:

1. O usuário não deve precisar conhecer a estrutura interna do banco.
2. `Work/Obra` não deve ser passo obrigatório do novo orçamento.
3. Aprovar orçamento não exige uma segunda conversão manual.
4. React Query continua como fonte de server state.
5. Zustand fica restrito a estado global real, principalmente sessão/contexto.
6. A UI não duplica regra de negócio do backend.
7. Contratos da API devem ser tipados e centralizados na camada de service.
8. Features e permissions são conceitos diferentes.
9. Operações críticas precisam impedir duplo submit.
10. Não iniciar a próxima etapa automaticamente.

---

# 2. Diagnóstico atual — o que preservar e o que corrigir

## 2.1 Preservar

- Expo Router.
- bottom navigation simples.
- React Query.
- Zustand para sessão.
- Axios com interceptor e fila de refresh.
- `SecureStore` em native.
- design system próprio.
- componentes de loading/error/empty/snackbar/confirm.
- cadastro rápido de cliente dentro do orçamento.
- compartilhamento de PDF.
- acessibilidade já iniciada.

## 2.2 Problemas P0/P1

1. após `approve`, o Mobile ainda chama `convert-to-service`.
2. tela Serviços permite criação manual normal de OS.
3. wizard de orçamento ainda depende de Work/Obra.
4. `novo.tsx` concentra responsabilidades demais.
5. telas usam adapters como `toArray()` porque contrato da API é inconsistente.
6. suspensão de empresa é tratada principalmente por status HTTP, não `error.code`.
7. menu Mais duplica Orçamentos/Serviços e Pagamentos/Cobranças.
8. Produção/Estoque aparecem mesmo quando empresa não usa.
9. financeiro ainda não está centrado no Serviço.
10. anexos/fotos precisam migrar para contrato privado.

---

# 3. Como usar este documento no Hermes

Cada etapa contém um `GOAL HERMES` detalhado.

Use:

```text
/goal draft <conteúdo do bloco>
```

Durante execução:

```text
/goal status
```

Se fugir do escopo:

```text
/steer Não avance para outra etapa. Conclua somente a etapa atual do documento.
```

Depois de revisar e validar:

```text
/goal clear
```

Não use:

```text
/goal implemente todo o PLANO_REFATORACAO_FRONTEND_V4.md
```

---

# ETAPA 0 — Baseline técnico e visual

## Objetivo de negócio

Garantir que futuras mudanças de UX e integração possam ser comparadas com o comportamento atual e que regressões sejam detectadas cedo.

## Objetivo técnico

Registrar estado atual de build, testes, rotas, contratos, screenshots e dependências.

## Arquivos/domínios a analisar

- `package.json`
- lockfile
- `app/**`
- `src/services/api/**`
- `src/services/auth/**`
- `src/store/**`
- `src/types/**`
- `src/components/**`
- `src/theme/**`
- `docs/**`
- testes existentes

## Alterações obrigatórias

### 0.1 Executar baseline

Usar scripts reais existentes para:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run doctor
```

Validar execução em pelo menos uma plataforma alvo disponível.

### 0.2 Registrar telas críticas

- login;
- seleção de empresa;
- home;
- orçamentos;
- novo orçamento;
- detalhe do orçamento;
- serviços;
- Mais.

### 0.3 Contratos atuais

Mapear services e responses utilizados principalmente em:

```text
quotes
serviceOrders
clients
payments
expenses
works
measurements
```

## Não alterar

- não mudar UX;
- não mudar rotas;
- não alterar contrato de API;
- não remover Work;
- não alterar financeiro.

## Critério de aceite

Baseline executável e documentada sem mudança funcional.

## GOAL HERMES — ETAPA 0

```text
/goal draft
Você está no repositório SmartGesso-Mobile.

OBJETIVO
Criar uma baseline técnica e visual confiável antes da refatoração V4, sem alterar regra ou fluxo do produto.

LEIA
- docs/PLANO_REFATORACAO_FRONTEND_V4.md — ETAPA 0
- package.json
- app/**
- src/services/api/**
- src/store/**
- src/types/**
- testes existentes

FAÇA
1. Execute lint, typecheck, testes e expo doctor usando scripts reais.
2. Identifique falhas preexistentes.
3. Mapeie rotas e contracts usados nos fluxos críticos.
4. Registre quais telas e services participam de Quote→Service.
5. Não mude comportamento funcional.
6. Documente baseline no resumo final.

NÃO FAÇA
- não refatore telas;
- não remova código legado;
- não altere API integration;
- não avance para Etapa 1.

CRITÉRIO
A equipe consegue distinguir regressão futura de problema preexistente.
```

---

# ETAPA 1 — Corrigir Aprovação de Orçamento → Serviço

## Dependência obrigatória

Executar somente depois que o backend tiver estabilizado `POST /quotes/:id/approve` para devolver o Serviço criado/existente.

## Objetivo de negócio

O usuário toca **Aprovar orçamento** uma vez e o Serviço passa a existir automaticamente.

## Objetivo técnico

Remover a segunda chamada `convert-to-service` do fluxo normal e utilizar o `serviceOrder.id` retornado pelo `approve`.

## Problema atual

```text
Aprovar
→ API já cria Serviço
→ Mobile abre modal “Criar serviço?”
→ Mobile chama convert-to-service
→ conflito/409
```

## Arquivos principais

- `app/(app)/orcamentos/[id].tsx`
- `src/services/api/quotes.ts`
- `src/types/quote.ts`
- `src/types/serviceOrder.ts`
- React Query keys relacionadas
- testes da tela/service

## Alterações obrigatórias

### 1.1 Tipo do response

Criar tipo real equivalente a:

```ts
interface ApproveQuoteResponse {
  quote: Quote;
  serviceOrder: {
    id: string;
    code: number;
    status: ServiceOrderStatus;
  };
  serviceOrderCreated: boolean;
}
```

### 1.2 Mutation

A mutation de aprovação deve:

1. bloquear duplo clique enquanto pending;
2. chamar somente `quotesService.approve()`;
3. receber o Serviço da resposta;
4. invalidar Quote list/detail e ServiceOrder list;
5. oferecer ação **Abrir serviço**;
6. não chamar `convertToService()`.

### 1.3 UX

Se `serviceOrderCreated = true`:

```text
Orçamento aprovado e Serviço criado.
```

Se `false`:

```text
Orçamento já aprovado. Serviço existente localizado.
```

### 1.4 Código legado

Não apagar `quotesService.convertToService()` ainda se outro ponto do app usar. Marcar para remoção após busca no repositório comprovar ausência de consumidores.

## Não alterar

- não remover Work;
- não refatorar o wizard completo;
- não mudar financeiro;
- não alterar menu Mais.

## Testes obrigatórios

- aprovação com criação nova;
- aprovação de quote já aprovado;
- erro da API;
- botão disabled/pending;
- navegação para Serviço correto;
- query invalidation.

## Critério de aceite

A aprovação realiza uma única operação HTTP canônica e nunca chama conversão posterior no fluxo normal.

## GOAL HERMES — ETAPA 1

```text
/goal draft
Leia integralmente docs/PLANO_REFATORACAO_FRONTEND_V4.md e implemente SOMENTE a ETAPA 1.

DEPENDÊNCIA
Antes de alterar, confirme no código/contrato do SmartGesso-API que POST /quotes/:id/approve devolve quote + serviceOrder + serviceOrderCreated.

OBJETIVO DE NEGÓCIO
Ao aprovar um orçamento, o Serviço deve existir automaticamente e o usuário deve poder abri-lo sem uma segunda conversão.

OBJETIVO TÉCNICO
Remover a chamada convert-to-service do fluxo normal e usar o ID retornado por approve.

ALTERE PRINCIPALMENTE
- app/(app)/orcamentos/[id].tsx
- src/services/api/quotes.ts
- src/types/quote.ts
- src/types/serviceOrder.ts
- testes relacionados

FAÇA
1. Atualize o tipo real de approve.
2. Garanta submit único enquanto mutation estiver pending.
3. Após sucesso, invalide quote list/detail e service-orders.
4. Mostre feedback diferente para serviço novo ou já existente.
5. Navegue para /servicos/[id] usando o ID retornado.
6. Remova a chamada posterior de convertToService do fluxo da tela.
7. Mantenha o método legado no service apenas se ainda houver consumidores.
8. Adicione testes de sucesso, idempotência visual, erro e navegação.

NÃO FAÇA
- não refatore novo.tsx;
- não remova Work;
- não altere financeiro;
- não mexa no menu.

VALIDAÇÃO
lint + typecheck + testes + validação manual do fluxo de aprovação.

CRITÉRIO
Uma aprovação no app corresponde a uma única operação canônica e abre o Serviço retornado pela API.
```

---

# ETAPA 2 — Remover criação manual normal de Serviço

## Objetivo de negócio

Evitar que o usuário crie Serviço sem proposta comercial aprovada e perca rastreabilidade de cliente, escopo e valor.

## Objetivo técnico

Transformar a tab Serviços em gerenciamento dos Serviços originados de orçamentos aprovados.

## Arquivos principais

- `app/(app)/(tabs)/servicos.tsx`
- rota `app/(app)/servicos/novo.tsx` se existir
- `src/services/api/serviceOrders.ts`
- navegação/CTAs relacionados

## Alterações obrigatórias

### 2.1 Tela lista

Remover/ocultar:

```text
+ Nova ordem de serviço
```

### 2.2 Empty state

Trocar para:

```text
Nenhum serviço em andamento.
Quando um orçamento for aprovado, o Serviço aparecerá aqui.
```

CTA:

```text
Ver orçamentos
```

### 2.3 Rota de criação livre

Não deletar automaticamente. Primeiro procurar consumidores e decidir:

- retirar da navegação;
- marcar como legado;
- remover somente após backend/negócio confirmar que não haverá Serviço avulso.

### 2.4 Serviço avulso futuro

Se for necessário depois, será uma feature explícita, com permissão e origem identificada. Não reutilizar criação livre silenciosamente.

## Testes

- tab não mostra CTA de criação comum;
- empty state direciona para Orçamentos;
- serviço retornado da Etapa 1 aparece na lista.

## GOAL HERMES — ETAPA 2

```text
/goal draft
Implemente SOMENTE a ETAPA 2 do plano frontend V4.

OBJETIVO
Fazer a tela Serviços representar Serviços originados de orçamentos aprovados, removendo criação manual normal da UX.

ALTERE
- app/(app)/(tabs)/servicos.tsx
- rotas/CTAs de criação de Serviço apenas quando diretamente relacionados
- testes

FAÇA
1. Remova o botão + Nova ordem de serviço da experiência normal.
2. Atualize empty state para explicar que Serviços surgem de Orçamentos aprovados.
3. Adicione CTA Ver orçamentos.
4. Procure consumidores da rota /servicos/novo antes de removê-la.
5. Não apague código legado sem comprovar ausência de uso.

NÃO FAÇA
- não altere Quote wizard;
- não implemente serviço avulso;
- não altere backend.

CRITÉRIO
Usuário operacional normal não cria OS sem orçamento por acidente.
```

---

# ETAPA 3 — Remover Work/Obra do novo orçamento e introduzir Ambientes

## Dependência

Backend precisa fornecer `QuoteEnvironment` + `Measurement` vinculada a ambiente/Quote.

## Objetivo de negócio

Permitir que o usuário faça orçamento no campo de maneira natural:

```text
Cliente → Local → Ambientes → Medições → Itens
```

sem cadastrar uma “Obra”.

## Objetivo técnico

Retirar `workId`, `worksService` e `WorkPickerModal` do novo fluxo e substituir por ambientes locais/persistidos.

## Arquivos principais

- `app/(app)/orcamentos/novo.tsx` ou feature já extraída
- `src/services/api/works.ts`
- `src/services/api/measurements.ts`
- novos `quoteEnvironments.ts`
- `src/types/work.ts`
- `src/types/measurement.ts`
- novos tipos de environment
- compositions service

## Alterações obrigatórias

### 3.1 Novo fluxo

```text
1 Cliente
2 Local
3 Ambientes e medições
4 Serviço/Materiais
5 Valores
6 Prazo
7 Pagamento
8 Revisão
```

### 3.2 Environment

Cada ambiente deve suportar:

- nome;
- tipo de aplicação;
- comprimento/largura/altura quando aplicável;
- área/perímetro;
- observações;
- fotos em etapa posterior;
- ordem.

### 3.3 Estado

Remover do draft do novo fluxo:

```ts
workId
selectedMeasurementIds // substituir pelo modelo novo
```

Introduzir `QuoteEnvironmentDraft[]` ou equivalente.

### 3.4 Cálculo de materiais

Deve usar medições dos ambientes e não Work.

### 3.5 Compatibilidade

- telas históricas de Work podem permanecer;
- não apagar services/types de Work se ainda usados fora do novo fluxo;
- orçamento legado continua exibível.

## Testes

- criar 1 ambiente;
- criar múltiplos ambientes;
- cálculo de materiais usa medições corretas;
- alterar ambiente atualiza cálculo;
- nenhum Work é necessário no novo fluxo;
- quote legado abre normalmente.

## GOAL HERMES — ETAPA 3

```text
/goal draft
Implemente SOMENTE a ETAPA 3 do frontend V4.

DEPENDÊNCIA
Confirme primeiro que a API possui QuoteEnvironment e Measurement sem Work obrigatório.

OBJETIVO DE NEGÓCIO
O usuário deve criar orçamento usando Cliente → Local → Ambientes/Medições, sem selecionar Obra.

OBJETIVO TÉCNICO
Remover Work do fluxo de novo orçamento e consumir os novos endpoints de QuoteEnvironment/Measurement.

FAÇA
1. Remova WorkPicker do novo fluxo.
2. Remova worksService somente do novo orçamento.
3. Crie tipos/services para QuoteEnvironment.
4. Modele múltiplos ambientes e suas medições.
5. Preserve cálculo de materiais com base nas medições.
6. Preserve leitura de dados antigos.
7. Não delete telas/services de Work ainda se houver consumidores.
8. Crie testes do novo draft/payload/cálculo.

NÃO FAÇA
- não refatore toda a arquitetura visual fora do necessário;
- não mexa no Financeiro;
- não apague Work do projeto inteiro.

CRITÉRIO
É possível concluir novo orçamento completo sem criar ou selecionar Work.
```

---

# ETAPA 4 — Refatorar o wizard de Novo Orçamento

## Objetivo de negócio

Facilitar evolução e reduzir risco de bugs em uma das telas mais importantes do produto.

## Objetivo técnico

Quebrar o arquivo de aproximadamente 97 KB em feature estruturada, sem alterar comportamento funcional além do que já foi aprovado nas etapas anteriores.

## Arquivos principais

- `app/(app)/orcamentos/novo.tsx`
- novo `src/features/quotes/create/**`
- schemas Zod
- hooks
- components/steps

## Estrutura alvo sugerida

```text
src/features/quotes/create/
├── CreateQuoteScreen.tsx
├── types.ts
├── constants.ts
├── validation.ts
├── utils.ts
├── hooks/
│   ├── useQuoteDraft.ts
│   ├── useQuoteWizard.ts
│   ├── useMaterialCalculation.ts
│   └── useQuoteSubmit.ts
├── components/
│   ├── QuoteStepProgress.tsx
│   ├── QuickClientModal.tsx
│   ├── EnvironmentCard.tsx
│   └── QuoteReviewSummary.tsx
└── steps/
    ├── ClientStep.tsx
    ├── LocationStep.tsx
    ├── EnvironmentsStep.tsx
    ├── ItemsStep.tsx
    ├── PricingStep.tsx
    ├── DeadlineStep.tsx
    ├── PaymentStep.tsx
    └── ReviewStep.tsx
```

## Responsabilidades

- rota Expo Router: wrapper fino;
- `CreateQuoteScreen`: orquestra fluxo;
- `useQuoteDraft`: draft + ações;
- `useQuoteWizard`: navegação e validação de steps;
- `useMaterialCalculation`: server call de composição;
- `useQuoteSubmit`: payload/mutation/cache;
- steps: UI específica.

## Não fazer

- não mover server state para Zustand;
- não criar Context global para tudo;
- não duplicar validação;
- não mudar API só por refatoração estrutural.

## Testes

- hooks isolados;
- validation;
- ClientStep;
- EnvironmentStep;
- PricingStep;
- payload final.

## GOAL HERMES — ETAPA 4

```text
/goal draft
Implemente SOMENTE a ETAPA 4.

OBJETIVO
Refatorar o wizard de novo orçamento para uma feature modular e testável sem alterar comportamento funcional já estabilizado.

FAÇA
1. Transforme app/(app)/orcamentos/novo.tsx em rota fina.
2. Crie src/features/quotes/create com screen, steps, hooks, validation e componentes.
3. Mantenha React Query como server state.
4. Mantenha draft local à feature.
5. Não use Zustand como store de formulário.
6. Centralize Zod/validação.
7. Preserve design system, acessibilidade e navegação.
8. Extraia testes unitários de hooks/helpers/steps.
9. Garanta que payload final permaneça equivalente ao contrato vigente.

NÃO FAÇA
- não implemente novas features de produto;
- não altere Financeiro;
- não mude backend.

CRITÉRIO
A rota fica fina, responsabilidades ficam separadas e o fluxo continua funcional com testes verdes.
```

---

# ETAPA 5 — Padronizar integração com API e contratos tipados

## Objetivo de negócio

Reduzir bugs em que a UI espera um formato e a API retorna outro.

## Objetivo técnico

Centralizar adapters nos services e preparar geração automática de client/types via OpenAPI.

## Problema atual

Há `toArray<T>` em telas para tolerar:

```text
array puro
OU
{ data, total }
```

A tela não deve conhecer inconsistência de transporte.

## Arquivos principais

- `src/services/api/**`
- `src/types/**`
- telas com `toArray()`/casts
- `package.json` script `api:generate`

## Alterações obrigatórias

### 5.1 Curto prazo

Services retornam um contrato único para a UI.

### 5.2 Médio prazo

Consumir OpenAPI estabilizado do backend e gerar tipos/client.

### 5.3 Paginação

Adotar tipo comum quando backend suportar:

```ts
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### 5.4 Remover adapters das telas

Somente depois do service garantir o contrato.

## GOAL HERMES — ETAPA 5

```text
/goal draft
Implemente SOMENTE a ETAPA 5.

OBJETIVO
Eliminar contratos improvisados na UI e criar uma camada de API tipada e previsível.

FAÇA
1. Procure toArray, casts unknown/any e normalizações de response nas telas.
2. Mova normalização temporária para src/services/api.
3. Padronize tipos de lista/paginação conforme contrato real do backend.
4. Configure ou implemente api:generate somente se OpenAPI já estiver estável e disponível.
5. Atualize telas para consumir tipos definitivos.
6. Não altere UX além de erros derivados do contrato.
7. Crie testes de services/mappers.

NÃO FAÇA
- não invente response que a API não fornece;
- não gere client contra spec desatualizada;
- não refatore features não relacionadas.

CRITÉRIO
Nenhuma tela crítica precisa adivinhar se a API retorna array ou envelope.
```

## GOAL HERMES — ETAPA 15 (Home Acionável) — PROGRESSO

### ETAPA 6 — Home Acionável (V4 ETAPA 15) 🔄 EM ANDAMENTO

- [x] Helpers puros homeToday/homeAlerts com 33 testes (`src/features/home/homeToday.ts`, `src/features/home/homeAlerts.ts`)
- [x] Estilos timeline + variantes danger (`src/screens/Tabs/Home/styles.ts`)
- [x] Card Despesas do Mês no grid
- [ ] Seção Hoje (timeline)
- [ ] Card Serviços Atrasados
- [ ] Banner parcelas vencidas
- [ ] FeatureGate inventory no alerta de estoque

---

# ETAPA 6 — Acesso suspenso, erros centralizados e sessão

## Objetivo de negócio

Dar feedback claro quando a empresa está suspensa, usuário perdeu acesso ou sessão expirou, sem loops de requests e mensagens genéricas.

## Objetivo técnico

Orientar comportamento por `ApiError.code`, não apenas HTTP status.

## Arquivos principais

- `src/services/api/client.ts`
- `src/types/api.ts`
- `src/store/useSessionStore.ts`
- root layouts/navegação
- nova tela de acesso suspenso

## Alterações obrigatórias

### 6.1 Error mapper

Reconhecer códigos como:

```text
UNAUTHORIZED
FORBIDDEN
COMPANY_ACCESS_DENIED
COMPANY_ACCESS_SUSPENDED
SUBSCRIPTION_GRACE_PERIOD
VALIDATION_ERROR
RATE_LIMITED
NETWORK_ERROR
SERVER_ERROR
```

### 6.2 `COMPANY_ACCESS_SUSPENDED`

Independente de 402/403:

```text
error.code
→ accessDeniedHandler
→ tela dedicada
```

### 6.3 Tela

Mostrar:

- empresa;
- situação;
- suporte;
- atualizar situação;
- trocar empresa;
- sair.

### 6.4 401

Refresh falhou → limpar tokens + sessão + login.

### 6.5 Grace period

Não bloquear se a regra do backend permitir; apresentar aviso conforme produto.

## Testes

- 401 refresh falho;
- 402 com code suspended;
- 403 permission;
- trocar empresa;
- sem loop de retry.

## GOAL HERMES — ETAPA 6

```text
/goal draft
Implemente SOMENTE a ETAPA 6.

OBJETIVO
Padronizar o tratamento de sessão e acesso da empresa usando error.code da API.

FAÇA
1. Revise client.ts, toApiError e handlers atuais.
2. Faça COMPANY_ACCESS_SUSPENDED ser reconhecido pelo code, seja HTTP 402 ou 403.
3. Crie fluxo/tela dedicada de acesso suspenso.
4. Mantenha refresh queue e logout seguros.
5. Evite retry loop para empresa bloqueada.
6. Diferencie forbidden de subscription suspended.
7. Crie testes.

NÃO FAÇA
- não alterar regra de assinatura no frontend;
- não armazenar segredo adicional;
- não mudar telas operacionais fora do necessário.

CRITÉRIO
Cada erro de acesso crítico leva a um estado previsível e recuperável da aplicação.
```

---

# ETAPA 7 — Simplificar menu Mais e ações rápidas

## Objetivo de negócio

Diminuir carga cognitiva e deixar o app parecer ferramenta operacional, não um ERP cheio de módulos repetidos.

## Arquivos principais

- `app/(app)/(tabs)/mais.tsx`
- `app/(app)/(tabs)/novo.tsx`
- navigation/routes
- permissions/features quando disponíveis

## Estrutura alvo

```text
Operação
  Clientes
  Agenda
  Estoque* 
  Produção*

Financeiro
  Financeiro
  Despesas

Gestão
  Relatórios
  Equipe*

Conta
  Empresa
  Configurações
  Perfil

Suporte
  Ajuda
  Trocar empresa
  Sair
```

`*` somente quando feature + permission.

## Alterações obrigatórias

- remover Orçamentos e Serviços do Mais se já estão nas tabs;
- consolidar Pagamentos/Cobranças em Financeiro;
- manter Notificações em local coerente, sem duplicação;
- `Novo` deve mostrar apenas ações frequentes e permitidas.

## GOAL HERMES — ETAPA 7

```text
/goal draft
Implemente SOMENTE a ETAPA 7.

OBJETIVO
Simplificar navegação e remover duplicidades do menu Mais/Novo.

FAÇA
1. Remova Orçamentos e Serviços do Mais porque já existem em tabs.
2. Consolide Pagamentos/Cobranças em Financeiro.
3. Organize seções Operação, Financeiro, Gestão, Conta e Suporte.
4. Preserve rotas existentes quando ainda usadas; mude apenas entrada de navegação.
5. Atualize Novo para mostrar ações frequentes.
6. Respeite permissions/features se a Etapa 8 já estiver disponível; caso contrário deixe integração preparada sem hardcode confuso.
7. Teste navegação e acessibilidade.

NÃO FAÇA
- não criar módulos novos;
- não alterar backend;
- não reestilizar o app inteiro.

CRITÉRIO
Menu tem menos duplicidade, ações são encontráveis e tabs principais continuam simples.
```

---

# ETAPA 8 — Feature flags + permissions na UX

## Dependência

Backend precisa fornecer `GET /companies/current/features` ou contrato equivalente.

## Objetivo de negócio

Mostrar a cada empresa e usuário somente o que realmente pode usar.

## Objetivo técnico

Combinar feature efetiva com permissão do membro para controlar visibilidade/ações.

## Arquivos principais

- novo `src/services/api/companyFeatures.ts`
- hook `useCompanyFeatures`
- `PermissionGate`
- `src/types/permissions.ts`
- menu Mais
- home/dashboard
- rotas de módulos opcionais

## Regra

```text
visible = featureEnabled && permissionGranted
```

Feature não substitui permission e permission não substitui feature.

## Alterações obrigatórias

- React Query para server state das features;
- não persistir em Zustand sem necessidade;
- Produção/Estoque/Compras/Equipe etc. condicionais;
- guard visual em ações sensíveis;
- deep link para rota de feature desabilitada deve mostrar fallback seguro.

## GOAL HERMES — ETAPA 8

```text
/goal draft
Implemente SOMENTE a ETAPA 8.

OBJETIVO
Controlar visibilidade e navegação por feature efetiva da empresa + permissão do usuário.

FAÇA
1. Consuma endpoint de features via React Query.
2. Crie useCompanyFeatures.
3. Combine com PermissionGate/roles existentes.
4. Atualize menu, Novo e home para módulos opcionais.
5. Garanta fallback para deep links sem acesso.
6. Não use Zustand como fonte de server state sem justificativa.
7. Crie testes da matriz feature x permission.

CRITÉRIO
Produção, Estoque, Compras, Financeiro avançado etc. só aparecem quando a empresa e o usuário realmente podem usar.
```

---

# ETAPA 9 — Financeiro centrado no Serviço

## Dependência

Backend Etapa 7 concluída com `financial-summary` e endpoints de despesas/recebíveis.

## Objetivo de negócio

Permitir ao usuário entender o resultado real do Serviço sem fazer conta manual.

## Objetivo técnico

Criar UI financeira baseada exclusivamente nos dados calculados pelo backend.

## Arquivos principais

- `app/(app)/servicos/[id].tsx`
- novas rotas/sections financeiras
- services `financial`, `expenses`, `receivables`
- components de resumo
- permissions

## Alterações obrigatórias

### 9.1 Resumo

Exibir separadamente:

```text
Valor contratado
Aditivos aprovados
Total contratado
Recebido
A receber
Custo realizado
Resultado projetado
Resultado realizado/caixa
Margem
```

### 9.2 Não calcular fonte da verdade no Mobile

Mobile apenas formata response; não reconstrói lucro somando arrays como regra oficial.

### 9.3 Despesa a partir do Serviço

`serviceOrderId` vem da rota/contexto e não deve ser selecionado manualmente.

### 9.4 Recebimento

Mostrar parcelas, vencimento, status, data e meio.

### 9.5 Permissions

Perfis sem acesso a custos/margem não renderizam dados restritos.

## Testes

- summary correto;
- sem permission;
- partial payment;
- erro/loading;
- invalidate após registrar despesa/recebimento.

## GOAL HERMES — ETAPA 9

```text
/goal draft
Implemente SOMENTE a ETAPA 9.

DEPENDÊNCIA
Confirme endpoints financeiros do ServiceOrder no backend.

OBJETIVO
Transformar o detalhe de Serviço em um hub financeiro com valores rastreáveis e claros.

FAÇA
1. Crie service/types para financial-summary, expenses e receivables.
2. Exiba contratado, recebido, a receber, custo, resultado e margem separadamente.
3. Não calcule lucro oficial no frontend.
4. Registre despesa/recebimento já vinculado ao Serviço atual.
5. Respeite permissions de custo/margem.
6. Invalide queries corretamente.
7. Trate loading/error/empty.
8. Teste permissions e atualizações.

NÃO FAÇA
- não alterar fórmula financeira definida pelo backend;
- não implementar Aditivos ainda além de exibir valor no summary se já vier da API.

CRITÉRIO
Usuário autorizado consegue compreender situação financeira do Serviço sem cálculos manuais.
```

---

# ETAPA 10 — Anexos e fotos privados

## Dependência

Backend Etapa 8 com Attachment autenticado/signed URL.

## Objetivo de negócio

Permitir documentação fotográfica segura do orçamento, execução, comprovantes e garantia.

## Objetivo técnico

Criar componentes reutilizáveis de captura/upload/listagem por entidade/categoria.

## Arquivos sugeridos

```text
src/services/api/attachments.ts
src/components/domain/attachments/
  AttachmentPicker.tsx
  AttachmentGrid.tsx
  AttachmentCard.tsx
  PhotoCaptureButton.tsx
```

Telas:

- Quote/Environment;
- Service antes/durante/depois;
- Expense receipt;
- Purchase document;
- Warranty.

## Alterações obrigatórias

- upload multipart autenticado;
- não persistir URL física pública como premissa;
- download via endpoint autorizado/signed URL;
- compressão apropriada com `expo-image-manipulator`;
- estado visual `pendente/enviando/enviado/falhou`;
- evitar upload duplicado em retry.

## GOAL HERMES — ETAPA 10

```text
/goal draft
Implemente SOMENTE a ETAPA 10.

OBJETIVO
Criar experiência segura e reutilizável de anexos/fotos usando o novo contrato Attachment da API.

FAÇA
1. Crie attachments service e tipos.
2. Crie componentes reutilizáveis de picker/capture/grid/card.
3. Integre pelo menos os contextos definidos na etapa, priorizando Serviço e comprovantes.
4. Comprima imagens quando apropriado sem destruir qualidade necessária.
5. Mostre estados de upload.
6. Use URL autorizada/signed; não assuma arquivo público.
7. Teste erro/retry/tenant contract.

NÃO FAÇA
- não acessar storage diretamente;
- não guardar token em URL;
- não criar fila offline financeira automática.

CRITÉRIO
Fotos/documentos só são abertos por fluxo autorizado e a UI comunica claramente o estado de envio.
```

---

# ETAPA 11 — Aditivos de Serviço

## Dependência

Backend ServiceAdditional disponível.

## Objetivo de negócio

Registrar trabalho adicional sem modificar o orçamento original aprovado.

## UX alvo

```text
Serviço #35

Aditivos
#1 Parede adicional   R$ 1.200  Aprovado
#2 Sanca extra        R$   600  Aguardando

+ Novo aditivo
```

## Alterações obrigatórias

- lista no detalhe do Serviço;
- criar rascunho;
- enviar/apresentar;
- aprovar/rejeitar conforme permissão;
- refetch financial-summary após status aprovado;
- não somar manualmente como fonte da verdade.

## GOAL HERMES — ETAPA 11

```text
/goal draft
Implemente SOMENTE a ETAPA 11.

OBJETIVO
Adicionar UX de Aditivos vinculados ao Serviço sem editar o Quote aprovado.

FAÇA
- services/types ServiceAdditional;
- lista e detalhe no Serviço;
- formulário de criação;
- ações de status permitidas;
- atualização do financial-summary após aprovação;
- permissions;
- loading/error/testes.

NÃO FAÇA
- não editar total do Quote original;
- não calcular total oficial no frontend;
- não implementar Compras.

CRITÉRIO
O usuário enxerga claramente contrato original e extras aprovados separadamente.
```

---

# ETAPA 12 — Fornecedores e Compras

## Dependência

Backend Supplier/Purchase/Inventory integrado.

## Objetivo de negócio

Permitir registrar de quem comprou, quanto custou e para qual Serviço/estoque foi o material.

## UX alvo

Rotas possíveis:

```text
/compras
/compras/novo
/compras/[id]
/fornecedores
/fornecedores/[id]
```

A partir do Serviço:

```text
Comprar materiais
```

com `serviceOrderId` implícito.

## Alterações obrigatórias

- Supplier picker/cadastro;
- Purchase form;
- itens com quantidade/unidade/custo;
- status da compra;
- recebimento;
- refetch estoque;
- anexar nota/comprovante via Attachment;
- permissions/features.

## GOAL HERMES — ETAPA 12

```text
/goal draft
Implemente SOMENTE a ETAPA 12.

OBJETIVO
Adicionar experiência de Fornecedores e Compras integrada ao Serviço e estoque.

FAÇA
1. Crie services/types de Supplier/Purchase.
2. Crie lista, detalhe e novo.
3. Permita abrir Nova Compra a partir do Serviço com serviceOrderId implícito.
4. Suporte itens e status.
5. Ao marcar recebida, refaça queries de estoque.
6. Integre Attachment para nota/comprovante.
7. Respeite feature e permission.
8. Crie testes.

NÃO FAÇA
- não recalcular estoque localmente como fonte da verdade;
- não criar módulo contábil completo.

CRITÉRIO
Usuário consegue rastrear fornecedor → compra → Serviço/estoque usando dados da API.
```

---

# ETAPA 13 — Garantia e Retorno

## Dependência

Backend WarrantyReturn + Attachment.

## Objetivo de negócio

Manter relacionamento pós-serviço e histórico de problemas/garantias.

## UX

No Serviço concluído:

```text
Concluído em 20/08/2026
Garantia até ...

Retornos e garantia
Nenhum retorno
+ Registrar retorno
```

Campos:

- tipo;
- motivo;
- descrição;
- data;
- agendamento;
- fotos;
- custo quando permitido;
- status.

## Regra

Não mudar o Serviço original de `CONCLUIDA` para `EM_ANDAMENTO` automaticamente.

## GOAL HERMES — ETAPA 13

```text
/goal draft
Implemente SOMENTE a ETAPA 13.

OBJETIVO
Criar UX de garantia/retorno vinculada ao Serviço concluído sem destruir o histórico original.

FAÇA
- services/types;
- seção no Serviço;
- formulário de retorno;
- status/timeline;
- fotos via Attachment;
- permissions;
- testes.

NÃO FAÇA
- não reabra Service automaticamente;
- não confundir retorno com Aditivo.

CRITÉRIO
Serviço continua concluído e os eventos pós-serviço ficam rastreáveis separadamente.
```

---

# ETAPA 14 — Follow-up comercial

## Dependência

Backend QuoteFollowUp/loss reason.

## Objetivo de negócio

Ajudar o usuário a não perder orçamento por falta de retorno e identificar causas de perda.

## Arquivos/telas

- lista de Orçamentos;
- detalhe do Orçamento;
- novo service/hook de follow-up;
- home/dashboard.

## Alterações obrigatórias

### 14.1 Indicadores

```text
Enviado há 4 dias
Follow-up hoje
Vence em 2 dias
```

### 14.2 Ações

- Registrar contato;
- Agendar follow-up;
- Marcar não aprovado;
- motivo estruturado + observação.

### 14.3 Motivos

- Preço
- Prazo
- Concorrente
- Adiado
- Sem resposta
- Mudança de escopo
- Outro

## GOAL HERMES — ETAPA 14

```text
/goal draft
Implemente SOMENTE a ETAPA 14.

OBJETIVO
Adicionar follow-up comercial acionável na lista/detalhe de Orçamentos.

FAÇA
1. Consuma QuoteFollowUp/loss reason da API.
2. Mostre próximos contatos e validade.
3. Adicione Registrar contato e Agendar follow-up.
4. Estruture motivo de perda sem remover observação livre.
5. Atualize React Query após ações.
6. Adicione testes de filtros/indicadores.

NÃO FAÇA
- não criar CRM genérico;
- não alterar aprovação já estabilizada.

CRITÉRIO
Usuário identifica rapidamente quais propostas exigem ação e por que negócios foram perdidos.
```

---

# ETAPA 15 — Home/Dashboard acionável

## Objetivo de negócio

Responder à pergunta: **o que eu preciso fazer hoje?**

## Objetivo técnico

Priorizar cards e listas acionáveis em vez de gráficos decorativos.

## Conteúdo sugerido

### Cards

- orçamentos aguardando resposta;
- serviços em andamento;
- serviços atrasados;
- a receber;
- despesas do mês;
- follow-ups hoje.

### Hoje

```text
09:00 Medição — Cliente X
13:00 Início — Cliente Y
16:00 Follow-up — Cliente Z
```

### Alertas

- propostas vencendo;
- parcelas vencidas;
- material abaixo do mínimo;
- retorno/garantia pendente.

## Regras

- feature + permission filtram conteúdo;
- não duplicar relatório completo na home;
- cada card deve levar a uma ação/lista relevante.

## GOAL HERMES — ETAPA 15

```text
/goal draft
Implemente SOMENTE a ETAPA 15.

OBJETIVO
Transformar Home em painel acionável do dia, não em dashboard decorativo.

FAÇA
1. Audite home atual e endpoints disponíveis.
2. Mostre cards realmente acionáveis definidos na etapa.
3. Crie seção Hoje e Alertas.
4. Cada card deve navegar para filtro/lista correspondente.
5. Respeite feature/permission.
6. Não carregar dados pesados desnecessários.
7. Teste estados loading/empty/error.

CRITÉRIO
Usuário entende prioridades do dia em poucos segundos e consegue agir a partir da Home.
```

---

# ETAPA 16 — Offline e confiabilidade de campo

## Objetivo de negócio

Evitar perda de informações em locais com conexão instável sem criar inconsistências financeiras ou duplicidade.

## Bom candidato a offline

- draft de orçamento;
- medição;
- observação;
- checklist;
- fotos pendentes;
- atualização operacional conflict-safe.

## Não enfileirar cegamente

- aprovar orçamento;
- receber pagamento;
- cancelar recebimento;
- concluir compra;
- alterar permissão;
- ação que depende de sequência;
- estoque sensível sem estratégia de conflito.

## Estados visuais

```text
Somente neste aparelho
Pendente de sincronização
Sincronizado
Falhou
Conflito
```

## Regras técnicas

- idempotency key quando backend suportar;
- retry com backoff;
- não esconder erro de conflito;
- upload de foto pode ter fila independente;
- draft local deve ser recuperável.

## GOAL HERMES — ETAPA 16

```text
/goal draft
Implemente SOMENTE a ETAPA 16.

OBJETIVO
Melhorar confiabilidade em campo sem colocar operações críticas em sincronização cega.

FAÇA
1. Leia docs/OFFLINE.md e FASE8-OFFLINE.md além deste plano.
2. Classifique ações atuais em offline-safe e online-required.
3. Implemente recuperação de draft/medição/checklist conforme arquitetura existente.
4. Crie estados visuais de sincronização.
5. Use idempotency key somente onde backend suportar.
6. Não enfileire aprovação/pagamento/compra crítica sem estratégia explícita.
7. Teste reconexão, retry e conflito.

CRITÉRIO
Conexão ruim não perde dados de campo e não duplica operações financeiras/comerciais críticas.
```

---

# ETAPA 17 — Performance, acessibilidade, testes e segurança mobile

## Objetivo de negócio

Consolidar qualidade para uso diário em produção.

## Performance

Revisar:

- `staleTime`;
- invalidações amplas;
- queries duplicadas;
- server-side search;
- paginação;
- FlatList;
- debounce;
- requests canceláveis.

Não adicionar biblioteca de performance antes de medir.

## Acessibilidade

- touch targets;
- labels;
- contraste;
- erro próximo do campo;
- status por texto + cor/ícone;
- focus/foco quando viável;
- disabled/loading claros.

## Testes

### Unitários

- schemas;
- formatters;
- mappers;
- permissions/features;
- hooks.

### Componentes

- QuoteCard;
- ServiceCard;
- FinancialSummary;
- EnvironmentStep;
- AttachmentGrid;
- PermissionGate.

### Integração

```text
criar orçamento
→ aprovar
→ abrir Serviço
```

```text
empresa suspensa
→ tela apropriada
```

### E2E

Web pode usar Playwright; native pode avaliar Maestro posteriormente se houver ganho real.

## Segurança

- native: SecureStore;
- web produtivo futuro: preferir cookie HttpOnly coordenado com backend;
- nunca logar access/refresh token;
- limpar sessão corretamente.

## GOAL HERMES — ETAPA 17

```text
/goal draft
Implemente SOMENTE a ETAPA 17.

OBJETIVO
Consolidar performance, acessibilidade, testes e segurança do SmartGesso-Mobile sem adicionar features novas.

FAÇA
1. Meça/inspecione queries e listas antes de otimizar.
2. Corrija invalidações e paginação/busca conforme contratos reais.
3. Audite acessibilidade das telas críticas.
4. Amplie testes unitários/component/integration dos fluxos V4.
5. Proteja logs e token handling.
6. Não adicionar dependência pesada sem justificativa.
7. Execute lint, typecheck, tests e expo doctor.

NÃO FAÇA
- não criar feature nova;
- não alterar regra de backend;
- não redesenhar visualmente o produto sem necessidade.

CRITÉRIO
Fluxos críticos têm cobertura, app não degrada em listas comuns, acessibilidade básica está preservada e tokens/dados sensíveis não aparecem em logs.
```

---

# 4. Ordem recomendada de implementação

```text
FASE A — ESTABILIZAÇÃO
Etapa 0  Baseline
Etapa 1  Aprovação → Serviço
Etapa 2  Serviços sem criação manual normal

FASE B — FLUXO PRINCIPAL
Etapa 3  Ambientes/Medições sem Obra
Etapa 4  Refatorar wizard
Etapa 5  Contratos de API
Etapa 6  Acesso suspenso/erros

FASE C — NAVEGAÇÃO E PRODUTO CONFIGURÁVEL
Etapa 7  Menu Mais/Novo
Etapa 8  Feature flags + permissions

FASE D — OPERAÇÃO E FINANCEIRO
Etapa 9  Financeiro por Serviço
Etapa 10 Anexos privados
Etapa 11 Aditivos
Etapa 12 Compras/Fornecedores
Etapa 13 Garantia/Retorno
Etapa 14 Follow-up
Etapa 15 Home acionável

FASE E — CONFIABILIDADE
Etapa 16 Offline
Etapa 17 Performance/A11y/Testes/Segurança
```

Dependências com backend:

```text
Backend Etapa 1 → Frontend Etapa 1
Backend Etapa 6 → Frontend Etapa 3
Backend Etapa 7 → Frontend Etapa 9
Backend Etapa 8 → Frontend Etapa 10
Backend Etapa 9 → Frontend Etapa 11
Backend Etapa 10 → Frontend Etapa 12
Backend Etapa 11 → Frontend Etapa 13
Backend Etapa 12 → Frontend Etapa 14
Backend Etapa 13 → Frontend Etapa 8
```

---

# 5. Definição de pronto global

Uma etapa só está pronta quando, quando aplicável:

- [ ] contrato da API confirmado;
- [ ] tipos representam response real;
- [ ] loading/error/empty/success tratados;
- [ ] submit duplicado impedido;
- [ ] React Query invalidado corretamente;
- [ ] tenant/companyId presente na query key quando necessário;
- [ ] feature/permission respeitada;
- [ ] acessibilidade preservada;
- [ ] comportamento offline definido;
- [ ] testes relevantes criados;
- [ ] lint verde;
- [ ] typecheck verde;
- [ ] testes verdes;
- [ ] Expo Doctor sem regressão relevante;
- [ ] navegação crítica testada manualmente;
- [ ] nenhuma alteração fora do escopo.

---

# 6. Prompt mestre para qualquer etapa

```text
Você é o engenheiro React Native/Expo sênior responsável pelo SmartGesso-Mobile.

CONTEXTO
- Expo 57 + React Native + Expo Router + React Query + Zustand + Axios + Zod.
- Backend NestJS/Prisma.
- SaaS multiempresa.
- Fluxo alvo: Cliente → Orçamento → Serviço → Execução/Financeiro → Resultado → Garantia.
- Navegação principal: Início | Orçamentos | Novo | Serviços | Mais.

REGRAS GERAIS
1. Leia integralmente docs/PLANO_REFATORACAO_FRONTEND_V4.md.
2. Execute somente a etapa informada.
3. Quando houver dependência, confirme o contrato real no backend antes de codificar.
4. React Query é server state.
5. Zustand não deve virar store de formulário.
6. Não duplicar regra de negócio do backend.
7. Não calcular como fonte da verdade o que a API deve fornecer.
8. Adapters de transporte ficam no service, não na tela.
9. Preserve design system e acessibilidade.
10. Feature e permission são verificações distintas.
11. Operações críticas bloqueiam duplo submit.
12. Não coloque aprovação/pagamento em offline queue sem estratégia explícita.
13. Não exponha token/dado sensível em logs.
14. Não faça refatoração cosmética fora da etapa.
15. Não avance para a etapa seguinte automaticamente.

ANTES DE ALTERAR
1. Liste arquivos afetados.
2. Descreva comportamento atual.
3. Confirme response/endpoint real.
4. Identifique query keys, mutations, navigation, permissions e stores envolvidos.
5. Identifique compatibilidade com dados/telas legadas.

VALIDAÇÃO
Execute os scripts reais equivalentes a:
- lint
- typecheck
- tests
- expo doctor quando relevante

Faça validação manual das rotas críticas tocadas.

SAÍDA FINAL
1. arquivos alterados;
2. comportamento anterior;
3. comportamento novo;
4. contrato da API usado;
5. testes executados;
6. impacto em cache/offline;
7. riscos residuais;
8. dependências para próxima etapa;
9. por que a etapa está concluída.
```

---

# 7. Sugestões finais de produto e UX

## 7.1 Não transformar o app em ERP visual pesado

A arquitetura interna pode ser robusta, mas a UI deve ser orientada a tarefa.

## 7.2 Serviço deve ser o hub pós-aprovação

Detalhe ideal:

```text
Cliente + local
Status + agenda

Execução
  Checklist
  Fotos
  Materiais
  Equipe

Comercial
  Orçamento origem
  Aditivos

Financeiro
  Recebíveis
  Despesas
  Resultado

Pós-serviço
  Garantia
  Retornos
```

## 7.3 Novo deve ter poucas ações frequentes

```text
Novo orçamento
Novo cliente
Agendar visita
Registrar despesa
Registrar recebimento
```

filtradas por role/feature.

## 7.4 Medição precisa ser muito rápida

No campo:

```text
+ Ambiente
nome
medidas
salvar
+ próximo ambiente
```

Sem Obra → Medição → voltar → Orçamento.

## 7.5 Fotos contextualizadas

Cada foto precisa saber:

- empresa;
- orçamento/Serviço;
- ambiente;
- categoria/fase;
- data;
- autor.

## 7.6 Previsto e realizado visualmente separados

Especialmente no financeiro.

## 7.7 Permissões também melhoram UX

Não mostrar botão que o usuário nunca poderá usar.

## 7.8 Produção é opcional

Empresas sem fábrica própria não devem ver Produção.

## 7.9 Home deve ser operacional

Priorizar pendências, agenda, follow-up, atrasos e vencimentos.

## 7.10 Recursos futuros depois da V4 estabilizada

Avaliar apenas após uso real:

- aceite/assinatura digital;
- WhatsApp assistido;
- templates de orçamento;
- favoritos de itens;
- duplicação de ambiente;
- timeline completa do cliente;
- mapa/rota da agenda;
- QR/etiqueta de estoque;
- pesquisa global;
- notificações automáticas de vencimento;
- indicadores de conversão.

---

# 8. Resultado esperado ao final da V4

O usuário deve conseguir executar o ciclo principal sem entender a arquitetura interna:

```text
1. Cadastrar/selecionar cliente
2. Criar orçamento
3. Informar local
4. Adicionar ambientes e medições
5. Definir materiais/serviços
6. Definir preço, prazo e pagamento
7. Gerar/enviar PDF
8. Registrar aprovação
9. Serviço aparece automaticamente
10. Executar com agenda/checklist/fotos/materiais
11. Registrar compras/despesas/recebimentos
12. Acompanhar resultado
13. Registrar aditivos quando houver mudança de escopo
14. Concluir
15. Registrar garantia/retorno quando necessário
16. Fazer follow-up comercial de propostas ainda abertas
```

O critério final é: **uma experiência simples para o profissional, apoiada por contratos previsíveis, segurança multiempresa, rastreabilidade e arquitetura de frontend fácil de manter**.
