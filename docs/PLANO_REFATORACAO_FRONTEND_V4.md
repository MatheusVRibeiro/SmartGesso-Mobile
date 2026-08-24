# SmartGesso Mobile — Plano de Refatoração e Evolução do Frontend V4

> **Documento de execução técnica e UX**  
> Repositório: `SmartGesso-Mobile`  
> Data-base da auditoria: 24/08/2026  
> Stack atual: Expo 57 + React Native + Expo Router + React Query + Zustand + Axios + Zod  
> Documento complementar: `SmartGesso-API/docs/PLANO_REFATORACAO_BACKEND_V4.md`

---

# 1. Objetivo deste documento

Este documento organiza as mudanças recomendadas no aplicativo mobile em etapas executáveis, com dependências claras em relação ao backend.

A intenção NÃO é reconstruir o aplicativo. A base atual possui boas decisões de arquitetura, principalmente:

- Expo Router;
- bottom navigation simples;
- React Query;
- SecureStore em Android/iOS;
- Zustand para sessão;
- design system próprio;
- fluxos de autenticação já estruturados;
- telas separadas por domínio;
- cadastro rápido de cliente dentro do orçamento.

O objetivo é **simplificar o fluxo operacional, corrigir inconsistências com a API, reduzir complexidade de manutenção e preparar o aplicativo para financeiro, anexos, aditivos, compras, garantia e features configuráveis**.

A experiência principal desejada permanece:

```text
Início | Orçamentos | + Novo | Serviços | Mais
```

E o fluxo de negócio alvo é:

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

---

# 2. Princípios de UX e arquitetura

1. O usuário deve pensar em **Cliente → Orçamento → Serviço**, e não em entidades técnicas do banco.
2. "Obra" não deve ser um passo obrigatório para criar orçamento.
3. Um orçamento aprovado deve resultar em serviço sem exigir uma segunda conversão manual.
4. A tela deve refletir a regra da API, e não manter lógicas paralelas de negócio.
5. Permissões devem controlar a experiência visual, mas a segurança final pertence ao backend.
6. Funcionalidades opcionais não devem aparecer para empresas que não as utilizam.
7. A UI deve separar "valor contratado", "recebido", "a receber", "custo" e "resultado".
8. Arquivos/fotos devem ser tratados como anexos autenticados.
9. Operações sensíveis devem ter feedback claro de sucesso, falha e estado offline.
10. Não duplicar entrada de menu para a mesma funcionalidade.
11. Arquivos de tela do Expo Router devem ser finos; lógica complexa deve ir para features/hooks/components.
12. O aplicativo deve reagir a `error.code` padronizado pela API, não depender apenas de status HTTP.

---

# 3. Diagnóstico resumido do mobile atual

## 3.1 Pontos fortes

- Bottom navigation já segue o modelo correto:

```text
Início
Orçamentos
Novo
Serviços
Mais
```

- `SecureTokenStorage` utiliza `expo-secure-store` em native.
- Axios possui interceptors de access token e refresh token.
- Existe fila para requisições durante refresh.
- React Query organiza cache e invalidação.
- Há componentes reutilizáveis como:
  - `AppButton`;
  - `AppCard`;
  - `AppInput`;
  - `StatusBadge`;
  - `LoadingState`;
  - `ErrorState`;
  - `EmptyState`;
  - `ConfirmDialog`;
  - `AppSnackbar`.
- O fluxo de Novo Orçamento já está estruturado como wizard.
- Cadastro rápido de cliente acontece sem abandonar o wizard.
- PDF de orçamento é gerado e compartilhado pelo app.
- Existe suporte inicial a notificações, offline e testes.

## 3.2 Problemas prioritários

### P0 — fluxo incorreto de aprovação

Após `approve`, o backend atual já cria uma OS, mas o mobile ainda pergunta "Criar serviço" e chama `convert-to-service`, causando conflito.

### P0 — complexidade desnecessária

O wizard de orçamento ainda carrega `Work`/Obra e depende dela para medições.

### P0/P1 — manutenção

`app/(app)/orcamentos/novo.tsx` possui aproximadamente 97 KB e concentra muitas responsabilidades.

### P1 — Serviços

A tela oferece criação manual de OS, mesmo que o fluxo principal deva ser Orçamento aprovado → Serviço.

### P1 — contrato de acesso

O Axios trata 403 como suspensão/acesso negado, mas a API pode responder 402 com `COMPANY_ACCESS_SUSPENDED`.

### P1 — menu

`Mais` repete Orçamentos/Serviços e possui Pagamentos e Cobranças apontando para a mesma rota.

### P1 — features

Produção e Estoque aparecem independentemente da necessidade da empresa.

### P1/P2 — financeiro

A interface atual ainda não é orientada ao resultado real de cada serviço.

---

# 4. Matriz de prioridade

| Prioridade | Item | Dependência |
|---|---|---|
| P0 | Corrigir aprovação → serviço | Backend Etapa 1 |
| P0 | Refatorar wizard gigante | Pode iniciar parcialmente |
| P0 | Corrigir contratos de tipos/listas | OpenAPI/backend |
| P1 | Remover criação manual normal de OS | Backend estável |
| P1 | Remover Obra do fluxo | Backend QuoteEnvironment |
| P1 | Tratar suspensão por `error.code` | Backend error contract |
| P1 | Menu e feature flags | Backend features endpoint |
| P1 | Financeiro por Serviço | Backend financeiro |
| P1 | Anexos privados | Backend Attachment |
| P2 | Aditivos | Backend ServiceAdditional |
| P2 | Compras/fornecedores | Backend Purchase/Supplier |
| P2 | Garantia/retorno | Backend WarrantyReturn |
| P2 | Follow-up | Backend QuoteFollowUp |
| P2 | Testes mobile de fluxo | APIs estabilizadas |
| P2 | Offline seguro | Regras de sincronização |

---

# 5. ETAPA 0 — Baseline e preparação

## 5.1 Executar antes de modificar

- [ ] `npm install`/`npm ci` conforme lockfile.
- [ ] `npm run lint`.
- [ ] `npm run typecheck`.
- [ ] `npm test`.
- [ ] `npm run doctor`.
- [ ] validar build/execução em Android ou Expo Go/dev build conforme configuração do projeto.
- [ ] confirmar URL/API de desenvolvimento.
- [ ] registrar screenshots das telas principais antes da refatoração.

## 5.2 Regra de branches

Cada mudança de domínio deve ter branch/PR própria.

Evitar:

```text
refatorar orçamento
+ financeiro
+ menu
+ upload
+ autenticação
```

no mesmo PR.

## 5.3 Estratégia de compatibilidade

Sempre que o backend introduzir um contrato novo:

```text
Backend compatível com antigo e novo
  ↓
Mobile migra
  ↓
Telemetria/testes confirmam uso
  ↓
Backend remove contrato legado
```

---

# 6. ETAPA 1 — Corrigir fluxo Aprovar Orçamento → Serviço

## 6.1 Dependência

Executar depois da **Etapa 1 do backend**, quando `POST /quotes/:id/approve` devolver o serviço criado/existente.

## 6.2 Comportamento atual a remover

Hoje:

```text
Usuário toca Aprovar
  ↓
quotesService.approve()
  ↓
modal "Deseja iniciar o planejamento?"
  ↓
quotesService.convertToService()
```

Esse fluxo não deve continuar.

## 6.3 Novo fluxo

```text
Usuário toca Aprovar
  ↓
confirmação
  ↓
POST /quotes/:id/approve
  ↓
API retorna quote + serviceOrder
  ↓
Snackbar: "Orçamento aprovado e serviço criado"
  ↓
Modal opcional:
  [Continuar no orçamento]
  [Abrir serviço]
```

Não deve existir nova chamada de conversão.

## 6.4 Arquivos a modificar

Principal:

```text
app/(app)/orcamentos/[id].tsx
```

Services/types:

```text
src/services/api/quotes.ts
src/types/quote.ts
```

Possivelmente:

```text
src/types/serviceOrder.ts
```

## 6.5 Response type recomendado

```ts
export interface ApproveQuoteResponse {
  quote: Quote;
  serviceOrder: {
    id: string;
    code: number;
    status: ServiceOrderStatus;
  };
  serviceOrderCreated: boolean;
}
```

## 6.6 Invalidações React Query

Após sucesso:

```text
['company', companyId, 'quotes']
['company', companyId, 'quotes', quoteId]
['company', companyId, 'service-orders']
```

## 6.7 UX de repetição

Se `serviceOrderCreated = false`, mensagem:

```text
"Orçamento já aprovado. O serviço existente foi localizado."
```

Botão:

```text
Abrir serviço
```

## 6.8 Critério de aceite

- [ ] aprovação não chama `convert-to-service`.
- [ ] serviço abre pelo ID retornado pela API.
- [ ] duplo toque não gera erro visual confuso.
- [ ] listas de orçamento e serviço atualizam.
- [ ] orçamento já aprovado continua navegável.

### Prompt de implementação — Etapa 1

```text
Atue como engenheiro React Native/Expo sênior no SmartGesso-Mobile.

Objetivo: migrar o fluxo de aprovação de orçamento para o novo contrato da API.

Leia:
- app/(app)/orcamentos/[id].tsx
- src/services/api/quotes.ts
- src/types/quote.ts
- src/types/serviceOrder.ts
- docs/PLANO_REFATORACAO_FRONTEND_V4.md, Etapa 1
- contrato atual do endpoint POST /quotes/:id/approve no SmartGesso-API

Regras:
1. Uma única chamada approve deve aprovar e obter o serviço.
2. Remover do fluxo normal qualquer chamada posterior a convert-to-service.
3. Não remover suporte legado do service sem confirmar que nenhum outro código usa.
4. Atualizar tipos para o response real.
5. Invalidar queries de quote e service-orders.
6. Mostrar feedback claro.
7. Navegar para /servicos/[id] usando o ID retornado pela API.
8. Manter o design system atual.
9. Não alterar telas não relacionadas.
10. Adicionar testes para sucesso, serviço já existente e erro.
11. Executar lint, typecheck e testes.
```

---

# 7. ETAPA 2 — Remover criação manual de Serviço do fluxo normal

## 7.1 Objetivo

A tela Serviços deve administrar serviços derivados de orçamentos aprovados.

## 7.2 Modificações

Arquivo:

```text
app/(app)/(tabs)/servicos.tsx
```

Remover ou ocultar:

```text
+
Nova ordem de serviço
```

Alterar empty state atual.

Em vez de:

```text
"Comece criando sua primeira ordem de serviço"
```

usar:

```text
"Nenhum serviço em andamento"
"Quando um orçamento for aprovado, o serviço aparecerá aqui."
```

CTA opcional:

```text
Ver orçamentos
```

## 7.3 Exceção futura

Se o produto precisar de serviço avulso/emergencial, criar recurso separado:

```text
Serviço avulso
```

com feature/permissão explícita. Não usar a criação livre atual como regra implícita.

## 7.4 Critério de aceite

Um usuário comum não cria OS acidentalmente sem orçamento.

---

# 8. ETAPA 3 — Retirar "Obra" do wizard e introduzir Ambientes

## 8.1 Dependência

Backend precisa disponibilizar `QuoteEnvironment` e medições vinculadas ao orçamento/ambiente.

## 8.2 Fluxo alvo

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

Não apresentar seleção de Obra.

## 8.3 Novo modelo de UX

Exemplo:

```text
Ambientes

Sala
15,96 m²
Drywall
[Editar] [Fotos]

Quarto 1
10,85 m²
Forro
[Editar] [Fotos]

+ Adicionar ambiente
```

Dentro de ambiente:

```text
Nome
Tipo de aplicação
Comprimento
Largura
Altura
Área
Perímetro
Portas
Janelas
Recortes
Observações
Fotos
```

## 8.4 Mudanças de estado

Remover do `QuoteDraft`:

```ts
workId
selectedMeasurementIds // substituir conforme novo desenho
```

Introduzir estrutura local semelhante a:

```ts
interface QuoteEnvironmentDraft {
  localId: string;
  serverId?: string;
  name: string;
  applicationType: MeasurementApplicationType;
  measurement: MeasurementDraft;
}
```

`localId` pode usar UUID local para suportar edição antes de persistir.

## 8.5 Persistência

Escolher uma das estratégias:

### Estratégia A — draft local e persistência no final

Boa para simplicidade, mas exige payload composto.

### Estratégia B — criar orçamento rascunho cedo

```text
Cliente selecionado
  ↓
cria Quote RASCUNHO
  ↓
ambientes/medições persistidos progressivamente
```

É mais robusta para recuperação de rascunho e uploads.

**Recomendação:** evoluir para Estratégia B em fase posterior, principalmente se o wizard ficar longo e precisar recuperar progresso.

## 8.6 Migração temporária

Durante transição, manter tipos/services de `Work` somente para telas históricas, sem usá-los no novo orçamento.

---

# 9. ETAPA 4 — Refatorar `novo.tsx` do orçamento

## 9.1 Problema

`app/(app)/orcamentos/novo.tsx` concentra dezenas de responsabilidades e está excessivamente grande.

## 9.2 Arquitetura alvo

Manter a rota fina:

```text
app/(app)/orcamentos/novo.tsx
```

Exemplo:

```tsx
export default function NovoOrcamentoRoute() {
  return <CreateQuoteScreen />;
}
```

Criar:

```text
src/features/quotes/create/
├── CreateQuoteScreen.tsx
├── types.ts
├── constants.ts
├── utils.ts
├── validation.ts
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

## 9.3 Responsabilidades

### `CreateQuoteScreen`

Somente:

- coordena step atual;
- renderiza step;
- chama handlers de navegação;
- exibe snackbar/loading global.

### `useQuoteDraft`

- estado do draft;
- ações de update;
- reset;
- derivação de totais.

### `useQuoteWizard`

- step atual;
- validação para avançar;
- voltar;
- regras de fluxo.

### `useMaterialCalculation`

- chama API de composição;
- controla loading/error;
- aplica resultado ao draft.

### `useQuoteSubmit`

- monta payload final;
- mutation;
- invalida queries;
- trata response.

## 9.4 Regra de tamanho

Não usar número rígido como qualidade absoluta, porém manter telas e componentes com uma responsabilidade clara. Se um step ultrapassa muito o necessário, extrair componentes/hook.

## 9.5 Testes facilitados

Após separação deve ser possível testar:

```text
ClientStep isolado
PricingStep isolado
validation isolada
useQuoteDraft isolado
```

sem montar todo o wizard.

### Prompt de implementação — Refatoração estrutural

```text
Refatore app/(app)/orcamentos/novo.tsx sem alterar comportamento funcional nesta etapa.

Objetivo:
- transformar a rota Expo Router em um wrapper fino;
- mover a implementação para src/features/quotes/create;
- separar steps, modais, hooks, validações e helpers;
- preservar exatamente o contrato atual com a API enquanto a refatoração estrutural ocorre.

Regras:
1. Não misture esta refatoração com remoção de Obra ou mudança de API.
2. Faça em commits lógicos se possível.
3. Não duplicar estado entre steps.
4. Não usar contexto global para tudo; estado do wizard deve permanecer local à feature.
5. React Query continua responsável por server state.
6. Zustand não deve virar storage de formulário.
7. Manter design system e acessibilidade.
8. Atualizar imports sem criar ciclos.
9. Criar testes de helpers/validation/hooks extraídos.
10. Garantir lint, typecheck e testes verdes.
```

---

# 10. ETAPA 5 — Padronizar integração com API e eliminar normalizadores improvisados

## 10.1 Problema

Há telas com helper:

```ts
function toArray<T>(result: unknown): T[]
```

porque os tipos esperam `{ data, total }`, mas a API retorna array puro em alguns endpoints.

Isso é sintoma de contrato divergente.

## 10.2 Curto prazo

Centralizar adaptação no service, nunca na tela.

Exemplo:

```text
src/services/api/serviceOrders.ts
```

deve devolver sempre o tipo que a tela espera.

A UI não deve saber que a API possui formatos inconsistentes.

## 10.3 Médio prazo

Gerar client/tipos via OpenAPI.

`package.json` já possui:

```text
api:generate
```

como TODO.

Objetivo:

```text
Swagger/OpenAPI da API
  ↓
client/types gerados
  ↓
services finos
  ↓
React Query
```

## 10.4 Paginação

Quando o backend padronizar:

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

Remover `toArray` espalhados.

---

# 11. ETAPA 6 — Tratar corretamente acesso suspenso e erros da API

## 11.1 Problema

O Axios possui `accessDeniedHandler`, mas atualmente reage principalmente ao status 403. A API pode responder:

```text
402
COMPANY_ACCESS_SUSPENDED
```

## 11.2 Regra nova

O comportamento deve ser orientado ao `code`.

Exemplo no interceptor:

```text
response error
  ↓
toApiError(error)
  ↓
code === COMPANY_ACCESS_SUSPENDED
  ↓
accessDeniedHandler(details)
```

Independente de 402/403.

## 11.3 Tela dedicada

Criar rota/tela:

```text
app/(app)/access-suspended.tsx
```

ou equivalente fora do grupo operacional.

Mostrar:

```text
Acesso temporariamente suspenso
Empresa: X
Situação: ...
Contato de suporte: ...

[Atualizar situação]
[Trocar empresa]
[Sair]
```

Não permitir que o usuário permaneça em looping de requests falhando.

## 11.4 Outros códigos recomendados

Preparar tratamento centralizado para:

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

## 11.5 Grace period

Se `SUBSCRIPTION_GRACE_PERIOD`, não necessariamente bloquear. Exibir aviso discreto dependendo da regra do produto.

---

# 12. ETAPA 7 — Simplificar o menu "Mais"

## 12.1 Problemas atuais

- Orçamentos já estão na tab e aparecem novamente em Mais.
- Serviços já estão na tab e aparecem novamente.
- Pagamentos e Cobranças apontam para o mesmo lugar.
- Produção e Estoque aparecem para todos.

## 12.2 Estrutura recomendada

```text
MAIS

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
  Ajuda e suporte
  Trocar empresa
  Sair
```

`*` condicionado a feature/role.

## 12.3 Não duplicar tabs

Não listar normalmente:

```text
Orçamentos
Serviços
```

em Mais, salvo necessidade específica de acessibilidade/navegação comprovada.

## 12.4 Financeiro como módulo consolidado

Em vez de duas entradas quase iguais:

```text
Pagamentos
Cobranças
```

usar:

```text
Financeiro
```

com subáreas internas:

```text
Visão geral
A receber
Recebimentos
Despesas
```

---

# 13. ETAPA 8 — Feature flags e menu por capacidade

## 13.1 Dependência

Backend deve retornar features efetivas da empresa.

## 13.2 Store/cache

Não precisa armazenar permanentemente em Zustand se React Query puder gerenciar como server state.

Exemplo:

```text
useCompanyFeatures()
```

query key:

```text
['company', companyId, 'features']
```

## 13.3 Uso

```tsx
{features.production && can('production.read') ? (
  <MenuItem ... />
) : null}
```

## 13.4 Regra

Feature define se a empresa pode usar o módulo.

Permission define se o usuário pode usar o módulo.

```text
visible = featureEnabled && permissionGranted
```

Nunca confundir os dois conceitos.

---

# 14. ETAPA 9 — Financeiro orientado ao Serviço

## 14.1 Objetivo

Depois de aprovado, o usuário deve enxergar o serviço como centro financeiro.

## 14.2 Detalhe do Serviço

Criar seção:

```text
Financeiro

Valor contratado      R$ 10.000
Aditivos aprovados     R$  1.200
Total contratado       R$ 11.200

Recebido               R$  7.000
A receber               R$  4.200

Custo realizado        R$  5.300
Resultado projetado    R$  5.900
Margem                  52,68%
```

Não usar somente:

```text
Lucro: R$ X
```

sem explicar origem.

## 14.3 Subtelas

```text
/servicos/[id]/financeiro
/servicos/[id]/recebimentos
/servicos/[id]/despesas
```

ou tabs/seções internas conforme UX final.

## 14.4 Registrar despesa

Ao entrar a partir do serviço:

```text
serviceOrderId
```

deverá ser inferido pelo contexto da rota, não pedido ao usuário.

## 14.5 Registrar recebimento

Mostrar:

- parcela;
- vencimento;
- status;
- valor;
- recebido em;
- meio de pagamento;
- comprovante.

## 14.6 Permissões

Installer não deve ver custos/margem se não tiver permissão.

Usar `PermissionGate`/equivalente para UX, com backend reforçando a regra.

---

# 15. ETAPA 10 — Anexos e fotos privados

## 15.1 Dependência

Backend deve fornecer `Attachment` autenticado ou URLs assinadas.

## 15.2 Serviço de anexos

Criar:

```text
src/services/api/attachments.ts
```

Operações:

```text
upload
listByEntity
delete
getDownloadUrl/open
```

## 15.3 Componente reutilizável

```text
src/components/domain/attachments/
├── AttachmentPicker.tsx
├── AttachmentGrid.tsx
├── AttachmentCard.tsx
└── PhotoCaptureButton.tsx
```

## 15.4 Contextos de foto

```text
Orçamento / ambiente
Serviço — antes
Serviço — durante
Serviço — depois
Despesa — comprovante
Compra — nota
Garantia — evidência
```

## 15.5 Compressão

Antes de enviar imagem:

- limitar dimensão quando apropriado;
- comprimir JPEG/WebP;
- manter qualidade suficiente para documentação;
- não destruir original se requisito exigir resolução plena.

`expo-image-manipulator` já existe nas dependências e pode ser aproveitado conforme necessidade.

## 15.6 Offline

Foto capturada offline pode entrar em fila de upload, mas o usuário deve enxergar claramente:

```text
Pendente de envio
Enviando
Enviado
Falhou
```

---

# 16. ETAPA 11 — Aditivos no Serviço

## 16.1 UX

Detalhe do serviço:

```text
Aditivos

#1 Parede adicional
R$ 1.200
Aprovado

#2 Sanca adicional
R$ 600
Aguardando aprovação

+ Novo aditivo
```

## 16.2 Fluxo

```text
Novo aditivo
  ↓
descrição + valor + custo estimado opcional
  ↓
Salvar rascunho
  ↓
Enviar/Apresentar ao cliente
  ↓
Aprovar ou rejeitar
```

A UI nunca deve editar o total do orçamento original para representar mudança de escopo.

## 16.3 Financeiro

Ao aprovar aditivo, atualizar summary pela API/refetch, não somar manualmente no frontend como fonte da verdade.

---

# 17. ETAPA 12 — Fornecedores e Compras

## 17.1 Menu

Dentro de Estoque/Financeiro conforme posicionamento:

```text
Fornecedores
Compras
```

Não colocar tudo como tab principal.

## 17.2 Compra vinculada ao serviço

A partir do serviço:

```text
Comprar materiais
```

abre formulário com `serviceOrderId` implícito.

## 17.3 Recebimento de compra

Mostrar status:

```text
Rascunho
Pedido
Recebido
Cancelado
```

Após receber, refetch de estoque.

---

# 18. ETAPA 13 — Garantia e Retorno

## 18.1 Pós-serviço

Ao concluir serviço, mostrar:

```text
Concluído em 20/08/2026
Garantia até 20/08/2027
```

## 18.2 Retornos

Na tela do serviço:

```text
Retornos e garantia

Nenhum retorno registrado
+ Registrar retorno
```

Formulário:

```text
Tipo
Motivo
Descrição
Data
Agendamento
Fotos
Custo
Situação
```

## 18.3 Não reabrir silenciosamente

Um retorno não deve mudar o serviço original de `CONCLUIDA` para `EM_ANDAMENTO` sem regra explícita. Manter histórico separado.

---

# 19. ETAPA 14 — Follow-up comercial

## 19.1 Lista de orçamentos

Acrescentar indicadores:

```text
Enviado há 4 dias
Follow-up hoje
Vence em 2 dias
```

## 19.2 Ações

No orçamento:

```text
Registrar contato
Agendar follow-up
Marcar como não aprovado
```

## 19.3 Motivo de perda estruturado

Ao rejeitar:

```text
Motivo
  Preço
  Prazo
  Concorrente
  Adiado
  Sem resposta
  Mudança de escopo
  Outro

Observação opcional
```

Isso alimenta relatórios reais.

---

# 20. ETAPA 15 — Dashboard mais útil

## 20.1 Evitar dashboard decorativo

Priorizar informação acionável.

### Cards recomendados

```text
Orçamentos aguardando resposta
Serviços em andamento
Serviços atrasados
A receber
Despesas do mês
Follow-ups de hoje
```

### Lista "Hoje"

```text
09:00 Medição — Cliente X
13:00 Início — Cliente Y
16:00 Follow-up — Cliente Z
```

### Alertas

```text
3 orçamentos vencendo
2 parcelas vencidas
1 material abaixo do mínimo
```

Mostrar apenas cards permitidos pelo role/features.

---

# 21. ETAPA 16 — Offline: definir o que pode e não pode sincronizar automaticamente

O projeto já possui documentação de offline. A evolução deve manter regras de risco.

## 21.1 Bom candidato a offline

- rascunho de orçamento;
- formulário de medição;
- observação;
- checklist;
- fotos pendentes;
- atualização operacional não financeira quando conflict-safe.

## 21.2 Não sincronizar cegamente

- aprovar orçamento;
- receber pagamento;
- cancelar recebimento;
- alterar permissão;
- concluir compra;
- atualizar estoque sensível com conflito;
- ações que criam números sequenciais.

Essas ações devem preferir confirmação online ou estratégia específica de idempotency key.

## 21.3 Estado visual

Todo item offline precisa mostrar estado:

```text
Somente neste aparelho
Pendente de sincronização
Sincronizado
Conflito
Falha
```

---

# 22. ETAPA 17 — Performance e renderização

## 22.1 React Query

Manter React Query para server state.

Revisar:

- `staleTime` por domínio;
- invalidações excessivamente amplas;
- queries duplicadas;
- cancelamento de requests em busca;
- `enabled` por companyId.

## 22.2 Listas

Continuar com `FlatList` enquanto volume for aceitável.

Antes de adicionar biblioteca como FlashList, medir.

Aplicar:

- paginação;
- `keyExtractor` estável;
- componentes memoizados quando houver evidência;
- não renderizar grandes listas dentro de ScrollView.

## 22.3 Busca

Para clientes/orçamentos grandes:

```text
debounce
→ busca server-side
→ paginação
```

em vez de carregar milhares de itens e filtrar tudo localmente.

---

# 23. ETAPA 18 — Acessibilidade e consistência visual

## 23.1 Preservar

O projeto já usa vários `accessibilityLabel` e touch targets.

Manter padrão:

- touch target mínimo adequado;
- labels em ícones;
- contraste;
- estado disabled claro;
- loading sem duplo submit;
- erros próximos do campo;
- foco no primeiro erro quando possível.

## 23.2 Status não pode depender apenas de cor

Sempre combinar:

```text
cor + texto/ícone
```

## 23.3 Formulários

Padronizar:

```text
Label
Campo
Ajuda opcional
Erro
```

Não criar novos estilos ad hoc fora do design system sem justificativa.

---

# 24. ETAPA 19 — Tipagem, forms e validação

## 24.1 React Hook Form

Já está instalado. Avaliar usar de forma consistente em novos formulários e na refatoração de formulários grandes.

Não é necessário migrar todos os formulários de uma vez.

## 24.2 Zod

Centralizar schemas por feature.

Exemplo:

```text
src/features/quotes/create/validation.ts
```

Não repetir regra equivalente no UI e no service.

## 24.3 Backend continua sendo autoridade

Validação frontend melhora UX, mas não substitui DTO/ValidationPipe do backend.

---

# 25. ETAPA 20 — Testes do frontend

## 25.1 Testes unitários

Priorizar:

- masks;
- formatters;
- validações;
- cálculo apenas visual;
- mapeamento de status;
- error mapper;
- feature/permission visibility.

## 25.2 Componentes

Testar:

```text
QuoteCard
ServiceOrderCard
FinancialSummary
QuickClientModal
EnvironmentStep
StatusBadge
PermissionGate
```

## 25.3 Fluxos de integração

Com API mockada:

```text
criar orçamento
aprovar
abrir serviço
```

```text
empresa suspensa
→ redireciona para tela apropriada
```

```text
finance user
→ vê financeiro
→ não vê edição comercial
```

## 25.4 E2E

O Playwright existente é útil principalmente para web.

Para Android/iOS, avaliar futuramente:

```text
Maestro
```

ou ferramenta equivalente, sem adicionar antes de definir fluxo crítico a proteger.

Casos E2E prioritários:

```text
login
seleção de empresa
novo cliente rápido
novo orçamento
aprovação
serviço
logout
```

---

# 26. ETAPA 21 — Segurança mobile

## 26.1 Native

Manter access/refresh tokens em SecureStore.

## 26.2 Web

Hoje há fallback para `localStorage`.

Se o build web virar canal produtivo relevante, migrar autenticação web para arquitetura com cookie `HttpOnly`, `Secure`, `SameSite`, coordenada com backend.

## 26.3 Não logar

Nunca imprimir:

- access token;
- refresh token;
- senha;
- dados sensíveis de cliente;
- resposta financeira inteira em logs de produção.

## 26.4 Screenshots/clipboard

Para dados altamente sensíveis no futuro, avaliar política específica por tela. Não bloquear screenshots indiscriminadamente sem necessidade de produto.

---

# 27. ETAPA 22 — Estrutura de features recomendada

O projeto atualmente combina `app`, `screens`, `services`, `types`, `components` etc. Não é necessário migrar tudo imediatamente.

Para novas áreas complexas, adotar feature folders progressivamente:

```text
src/features/
├── quotes/
├── service-orders/
├── finance/
├── attachments/
├── purchases/
├── warranty/
└── follow-up/
```

Cada feature pode conter:

```text
components/
hooks/
validation/
types/
utils/
```

Services API podem continuar centralizados em `src/services/api` ou migrar gradualmente, mas escolher um padrão e documentar.

Não criar duas arquiteturas concorrentes permanentemente.

---

# 28. Ordem recomendada de execução

```text
FASE 1 — Correções P0
  1. Aprovação → Serviço sem convert duplicado
  2. Refatoração estrutural do wizard sem mudar regra
  3. Centralizar contratos de API nas services

FASE 2 — Fluxo simplificado
  4. Backend cria QuoteEnvironment
  5. Mobile remove Work/Obra do novo orçamento
  6. Serviços deixam de ser criados manualmente

FASE 3 — Segurança e navegação
  7. Error code / suspensão
  8. Menu Mais simplificado
  9. Feature flags + permissions

FASE 4 — Financeiro
 10. Financeiro no Serviço
 11. Recebíveis
 12. Despesas vinculadas
 13. Comprovantes

FASE 5 — Arquivos e operação
 14. Attachments privados
 15. Fotos antes/durante/depois
 16. fila offline de fotos

FASE 6 — Produto avançado
 17. Aditivos
 18. Compras/Fornecedores
 19. Garantia/Retorno
 20. Follow-up

FASE 7 — Consolidação
 21. OpenAPI client
 22. Dashboard acionável
 23. testes E2E
 24. performance e observabilidade de erros
```

---

# 29. Mapa de telas alvo

```text
(auth)
  Login
  Convite/ativação

(company)
  Selecionar empresa
  Acesso suspenso

(app)
  (tabs)
    Início
    Orçamentos
    Novo
    Serviços
    Mais

  clientes/
    index
    novo
    [id]

  orcamentos/
    novo
    [id]
    [id]/ambientes
    [id]/follow-ups

  servicos/
    [id]
    [id]/execucao
    [id]/financeiro
    [id]/aditivos
    [id]/anexos
    [id]/garantia

  financeiro/
    index
    a-receber
    recebimentos
    despesas

  compras/
    index
    novo
    [id]

  fornecedores/
    index
    [id]

  agenda/
  notificacoes/
  relatorios/
  configuracoes/
```

Não é obrigatório criar todas as rotas imediatamente. É o mapa de direção.

---

# 30. Checklist de definição de pronto por etapa

Uma etapa está pronta somente quando:

- [ ] contrato de API correspondente está confirmado;
- [ ] tipos TypeScript representam o response real;
- [ ] tela não contém adapters improvisados para formatos desconhecidos;
- [ ] loading/success/error estão tratados;
- [ ] botão não permite submit duplicado;
- [ ] React Query é invalidado corretamente;
- [ ] permissão/feature está refletida na UX quando aplicável;
- [ ] acessibilidade básica preservada;
- [ ] comportamento offline definido;
- [ ] testes relevantes criados;
- [ ] lint verde;
- [ ] typecheck verde;
- [ ] testes verdes;
- [ ] não houve alteração visual/regra fora do escopo sem documentação;
- [ ] fluxo foi testado em pelo menos um dispositivo/plataforma alvo.

---

# 31. PROMPT MESTRE — Implementação segura do frontend/mobile

Use este prompt para executar **uma etapa de cada vez**.

```text
Você é o engenheiro React Native/Expo sênior responsável pelo SmartGesso-Mobile.

CONTEXTO
- Stack: Expo 57, React Native, Expo Router, React Query, Zustand, Axios, Zod e React Hook Form.
- O backend é NestJS + Prisma e o produto é SaaS multiempresa.
- O fluxo alvo é Cliente → Orçamento → Serviço → Execução/Financeiro → Resultado → Garantia.
- A bottom navigation principal deve continuar simples: Início | Orçamentos | Novo | Serviços | Mais.
- O aplicativo possui design system próprio; preserve-o.

DOCUMENTO OBRIGATÓRIO
Leia integralmente docs/PLANO_REFATORACAO_FRONTEND_V4.md.
Leia também a etapa correspondente de PLANO_REFATORACAO_BACKEND_V4.md quando houver dependência de API.
Implemente SOMENTE a etapa que eu indicar.

ANTES DE ALTERAR
1. Inspecione a rota/tela atual e os services/types relacionados.
2. Confirme o contrato real da API; não programe contra suposição.
3. Identifique dependências de React Query, Zustand, navigation e permissions.
4. Liste resumidamente os arquivos que pretende alterar.
5. Se o backend ainda não suportar a etapa, não simule uma API definitiva; implemente apenas compatibilidade segura ou pare a parte dependente.

REGRAS DE ARQUITETURA
1. Rotas do Expo Router devem ser finas sempre que a feature for complexa.
2. React Query é a fonte de server state.
3. Zustand deve permanecer focado em estado global real, principalmente sessão/contexto, e não virar store de formulário.
4. Não duplicar regras de negócio do backend.
5. Não calcular como fonte da verdade valores financeiros que a API deve fornecer.
6. Tipos devem representar responses reais.
7. Adapters de contrato devem ficar na camada de service, não espalhados nas telas.
8. Não criar dependências novas sem necessidade demonstrada.
9. Preservar componentes e tokens do design system.
10. Não remover acessibilidade existente.
11. Features e permissions são conceitos diferentes: visibilidade = feature habilitada + permissão.
12. Ocultar UI não substitui segurança de backend.
13. Não expor tokens ou dados sensíveis em logs.
14. Evitar setTimeout como regra de navegação quando o sucesso da mutation já permite navegar deterministicamente, salvo razão de UX documentada.
15. Operações críticas devem impedir duplo submit.

FORMULÁRIOS
- Preferir schemas Zod centralizados por feature.
- Usar React Hook Form quando isso reduzir estado repetitivo e melhorar validação.
- Backend continua sendo autoridade de validação.

REACT QUERY
- query keys devem incluir companyId quando tenant-scoped.
- invalidar somente o necessário.
- tratar loading, refreshing, empty e error.
- não buscar dados se companyId/dependência necessária estiver ausente.

ERROS
- mapear erro pelo code retornado pela API.
- COMPANY_ACCESS_SUSPENDED deve ir para fluxo de acesso suspenso.
- 401 com refresh falho deve limpar sessão.
- erros de validação devem ser apresentados de forma útil.

OFFLINE
Não coloque em fila automaticamente ações financeiras ou de aprovação sem estratégia explícita de idempotência/conflito.

TESTES
Para cada etapa, adicione testes para:
- caminho feliz;
- erro da API;
- loading/disabled quando aplicável;
- permission/feature quando aplicável;
- resposta já existente/idempotência quando aplicável.

VALIDAÇÃO FINAL
Execute:
- npm run lint
- npm run typecheck
- npm test
- npm run doctor quando relevante

Se a alteração tocar rota crítica, faça validação manual da navegação.

SAÍDA FINAL
1. Resumo.
2. Arquivos alterados.
3. Contrato de API utilizado.
4. Comportamento visual alterado.
5. Testes criados.
6. Compatibilidade/offline.
7. Riscos residuais.
8. Próxima etapa recomendada.

IMPORTANTE
Não execute automaticamente a próxima etapa. Estabilize a atual primeiro.
```

---

# 32. Prompts específicos recomendados por macrofase

## 32.1 Remover Obra do wizard

```text
Implemente a migração do novo orçamento de Work/Obra para QuoteEnvironment conforme docs/PLANO_REFATORACAO_FRONTEND_V4.md.

Antes de alterar, confirme que a API possui endpoints e tipos de QuoteEnvironment/Measurement.

Requisitos:
- remover WorkPicker do novo orçamento;
- remover worksService do novo fluxo;
- criar gerenciamento de ambientes dentro do orçamento;
- cada ambiente deve ter nome, tipo de aplicação e medição;
- preservar cálculo de materiais usando as medições dos ambientes;
- não apagar telas históricas de Obra nesta etapa;
- manter compatibilidade com orçamento existente;
- extrair implementação para src/features/quotes/create;
- criar testes dos novos steps e payload.
```

## 32.2 Financeiro do Serviço

```text
Implemente a UI financeira do detalhe de Serviço usando exclusivamente o endpoint de financial-summary e endpoints de receivables/expenses fornecidos pelo backend.

Não calcule lucro como fonte da verdade no frontend.
Exiba separadamente:
- valor contratado;
- aditivos aprovados;
- total contratado;
- recebido;
- a receber;
- custo realizado;
- resultado projetado/realizado conforme contrato;
- margem.

Respeite COST_VIEW_ROLES/permissions e não renderize valores restritos para perfis sem acesso.
Crie componentes reutilizáveis e testes de permission visibility.
```

## 32.3 Feature flags

```text
Implemente capabilities da empresa no SmartGesso-Mobile.

Consuma GET /companies/current/features via React Query.
Não persistir manualmente em Zustand salvo necessidade comprovada.
Crie hook useCompanyFeatures.
Atualize o menu Mais para mostrar Produção, Estoque, Compras, Equipe etc. somente quando feature habilitada e usuário possuir permissão.
Não duplicar Orçamentos/Serviços no Mais.
Pagamentos/Cobranças devem ser consolidados em Financeiro.
Crie testes da matriz de visibilidade.
```

---

# 33. Sugestões finais de produto e UX

## 33.1 Não transformar o app em ERP visualmente pesado

O backend pode ter modelos sofisticados, mas a interface deve continuar orientada à tarefa.

O gesseiro não precisa navegar por quinze módulos para executar o trabalho.

## 33.2 "Novo" deve ser contextual e curto

A tab central `Novo` deve oferecer apenas ações frequentes:

```text
Novo orçamento
Novo cliente
Registrar despesa
Registrar recebimento
Agendar visita
```

E filtrar conforme role/feature.

Não colocar todas as entidades do banco nessa tela.

## 33.3 Serviço deve virar "hub" de execução

Detalhe do serviço ideal:

```text
Cliente + local
Status
Próxima atividade

Execução
  Checklist
  Fotos
  Materiais
  Equipe

Comercial
  Orçamento origem
  Aditivos

Financeiro
  Recebimentos
  Despesas
  Resultado

Pós-serviço
  Garantia
  Retornos
```

Isso reduz navegação fragmentada.

## 33.4 Home deve responder "o que preciso fazer hoje?"

Evitar excesso de gráficos na home mobile.

Priorizar:

```text
Ações pendentes
Agenda do dia
Orçamentos esperando resposta
Serviços atrasados
Parcelas vencidas
Alertas de estoque
```

Relatórios detalhados podem ficar em módulo próprio.

## 33.5 Reduzir cliques na medição

No campo, o usuário deve conseguir:

```text
+ Ambiente
nome
medidas
salvar
+ próximo ambiente
```

sem navegar por Obra → Medição → voltar → Orçamento.

## 33.6 Fotos devem estar contextualizadas

Uma grade genérica de imagens perde valor.

Cada foto deve saber:

```text
qual empresa
qual orçamento/serviço
qual ambiente
qual fase
quando
quem enviou
```

## 33.7 Não misturar previsão e realizado

No mobile:

```text
Previsto
Realizado
```

devem ter labels visuais claros.

## 33.8 Preservar histórico comercial

Depois de aprovado, não permitir que o usuário simplesmente edite o orçamento original e destrua o registro do que o cliente aceitou.

Use nova versão antes da aprovação e aditivo após aprovação.

## 33.9 Permissões também melhoram UX

Não mostrar botões que o usuário nunca poderá executar.

Exemplo Installer:

```text
vê execução
vê agenda
adiciona fotos
marca checklist
```

mas não precisa enxergar:

```text
margem
custo
administração de assinatura
```

## 33.10 Melhorias adicionais futuras

Depois das fases principais, avaliar:

- assinatura/aceite digital do orçamento;
- envio direto por WhatsApp usando compartilhamento/deep link apropriado;
- lembretes automáticos de follow-up;
- mapa/rota para agenda de visitas;
- leitura de QR/etiqueta para estoque;
- duplicação de ambientes em medições repetitivas;
- templates de orçamento por tipo de serviço;
- favoritos de serviços/materiais mais usados;
- timeline completa do cliente;
- indicadores de conversão comercial;
- notificações de parcela vencida;
- pesquisa global por cliente/orçamento/serviço.

Não implementar todas simultaneamente. Validar uso real antes de aumentar escopo.

---

# 34. Resultado esperado depois da refatoração

O usuário final deve conseguir executar o ciclo principal sem compreender a estrutura interna do banco:

```text
1. Cadastrar/selecionar cliente
2. Criar orçamento
3. Informar local
4. Adicionar ambientes e medições
5. Obter materiais/serviços
6. Definir preço, prazo e pagamento
7. Gerar/enviar PDF
8. Registrar aprovação
9. Serviço aparece automaticamente
10. Executar com checklist/fotos/materiais
11. Registrar compras/despesas/recebimentos
12. Acompanhar resultado
13. Concluir
14. Registrar garantia/retorno quando necessário
```

A experiência deve parecer simples mesmo que a arquitetura interna seja robusta.

Esse é o critério principal de sucesso da refatoração do frontend.