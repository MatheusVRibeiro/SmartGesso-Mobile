# Análise de Requisitos — SmartGesso Mobile

> **Propósito deste arquivo:** dar à IA (ou qualquer dev novo) o contexto COMPLETO do produto antes de tocar no código. Leia antes de qualquer tarefa. Foco em PRODUTO + REQUISITOS.
> Última atualização: 28/08/2026
> Fonte principal: código real (app/, src/) + package.json + docs existentes.

---

## 1. Visão Geral

**Objetivo do projeto:** O **SmartGesso Mobile** é o app de campo do SaaS SmartGesso para empresas de gesso e drywall (1–10 funcionários). É onde o gesseiro opera o dia a dia: orçamentos (wizard de 8 etapas), ordens de serviço, agenda, clientes, obras, catálogo, financeiro, estoque, compras e metas — com suporte offline (fila de sync) e notificações push. Este repositório é o app **Expo/React Native** em desenvolvimento ATIVO (fase por fase até 100%).

**Público-alvo / usuários:** Gesseiros, vendedores, instaladores, produção e financeiro das empresas clientes.

**Tipo:** App mobile (Expo/React Native), multi-tenant via API.

**Status:** EM DESENVOLVIMENTO ATIVO — fase 8 (offline) parcial, ~84% do roadmap. Branch `docs-smartgesso-refactor-2026-08-24`.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Runtime | Expo | ~57.0.14 |
| Native | React Native | 0.86.2 |
| UI | React | 19.2.3 |
| Roteamento | expo-router | |
| Estado | Zustand (sessão) + TanStack Query (server state) | ^5 |
| HTTP | Axios | |
| Armazenamento seguro | SecureStore | |
| Push | expo-notifications | |
| Validação | Zod | ^3.25 |
| Testes | Jest + Playwright | ^29 |

*Versões reais do package.json.*

---

## 3. Atores / Papéis

| Ator | Descrição | Permissões principais |
|------|-----------|----------------------|
| Gesseiro (dono) | Operação completa | Tudo |
| Vendedor | Orçamentos, clientes, obras | SALES |
| Instalador | OS no campo | INSTALLER |
| Produção | Ordens de produção | PRODUCTION |
| Financeiro | Pagamentos, despesas, relatórios | FINANCE |

*Feature gates no menu "Mais": production, inventory, purchases, team (metas).*

---

## 4. Requisitos Funcionais (RF)

### Módulo: Autenticação
- **RF-01** — Login — com JWT + refresh (SecureStore)
- **RF-02** — Forgot/reset senha — fluxo de recuperação
- **RF-03** — Convite — aceite de convite de membro
- **RF-04** — Seleção de empresa — troca de empresa/tenant
- **RF-05** — Empresa suspensa — estado de suspensão tratado na UI

### Módulo: Tabs principais
- **RF-06** — Home — dashboard do app
- **RF-07** — Orçamentos — listagem e acesso ao wizard
- **RF-08** — Serviços — ordens de serviço
- **RF-09** — Novo — acesso rápido a criação
- **RF-10** — Mais — menu com feature gates

### Módulo: Orçamentos (wizard 8 etapas)
- **RF-11** — Wizard completo — Cliente → Local → Ambientes → Serviço/Materiais → Valores → Prazo → Pagamento → Revisão
- **RF-12** — Envio e compartilhamento — deep link público para aprovação do cliente

### Módulo: Operações
- **RF-13** — Agenda — agendamentos
- **RF-14** — Catálogo — serviços, materiais, composições, medições
- **RF-15** — Clientes — CRUD + detalhe
- **RF-16** — Obras/medições — acompanhamento
- **RF-17** — Compras — pedidos de compra (feature inventory)
- **RF-18** — Despesas — lançamentos (feature advancedFinance)
- **RF-19** — Metas — metas da equipe (feature team)

### Módulo: Financeiro
- **RF-20** — Pagamentos — recebimentos de clientes
- **RF-21** — Relatórios — fluxo de caixa, comparativo, meta-realizado

### Módulo: Serviços
- **RF-22** — OS no campo — ciclo completo (EM_DESLOCAMENTO → CONCLUIDA)
- **RF-23** — Garantia/retorno — serviço em garantia

### Módulo: Offline
- **RF-24** — Fila de sync — AsyncStorage + processor FIFO, banner offline
- **RF-25** — Configurações — empresa, orçamento, preferências

### Módulo: Notificações
- **RF-26** — Push notifications — expo-notifications (feature pushNotifications)

---

## 5. Requisitos Não-Funcionais (RNF)

| Código | Categoria | Requisito |
|--------|-----------|-----------|
| RNF-01 | Offline | Fila de sync FIFO em AsyncStorage; sem SQLite/rascunhos locais (fase 8 parcial) |
| RNF-02 | Segurança | Tokens em SecureStore (nunca AsyncStorage) |
| RNF-03 | Multi-tenant | Toda chamada escopada por companyId do contexto |
| RNF-04 | Deep link | `smartgesso://` configurado |
| RNF-05 | Idioma | UI em PT-BR |
| RNF-06 | Build | EAS configurado; Play Store pendente |

---

## 6. Regras de Negócio

1. **RN-01** — Orçamento → Aprovação → Serviço: não criar OS manual sem orçamento aprovado
2. **RN-02** — Feature gates: módulos aparecem conforme features do plano da empresa
3. **RN-03** — Dinheiro em Decimal(15,2) BRL — nunca float na exibição
4. **RN-04** — Offline: operações entram na fila e sync quando volta a conexão

---

## 7. Integrações Externas

| Integração | Para quê | Como |
|------------|----------|------|
| SmartGesso-API | Todos os dados | Axios + TanStack Query |
| Expo Push | Notificações | expo-notifications |

---

## 8. Fluxos Principais (User Stories resumidas)

- **Como vendedor, eu quero criar um orçamento no app e enviar para o cliente aprovar, para fechar o serviço.**
  - Fluxo: Novo → wizard 8 etapas → enviar (deep link) → cliente aprova → OS criada.
- **Como instalador, eu quero operar minhas OS no campo mesmo sem internet, para não parar o trabalho.**
  - Fluxo: OS carregada → modo offline → fila de sync → sincroniza quando volta.

---

## 9. Fora de Escopo / Restrições

- Offline parcial: sem SQLite/rascunhos locais (fase 8 ~84%)
- Play Store ainda não publicada
- EAS build falha com espaço em 'Projetos SaaS' (path) — usar clone/path sem espaço
- `app.config.ts→app.json` (Node 20 não transpila TS no loader Expo)

---

## 10. Referências

- `docs/PLANO_REFATORACAO_FRONTEND_V4.md` — **plano do refactor V4 (OBRIGATÓRIO — ler 'Alterações obrigatórias' + 'Testes' antes de despachar)**
- `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/NAVIGATION.md`, `docs/OFFLINE.md`, `docs/FASE8-OFFLINE.md`
- `docs/API_INTEGRATION.md`, `docs/SECURITY.md`, `docs/TESTING.md`, `docs/PUSH_SETUP.md`, `docs/DESIGN_SYSTEM.md`, `docs/RELATORIO_QA_APP.md`
- Backend: `../SmartGesso-API` (NestJS)
- Admin: `../SmartGesso-Adm` (Next.js)
