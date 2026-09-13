# PENDÊNCIAS — SmartGesso Mobile (SmartGesso-Mobile)

> Lista viva de pendências, priorizadas 🔴🟠🟡🔵. Atualizar a cada fase. A IA lê este arquivo para saber O QUE FAZER EM SEGUIDA sem perguntar.
> Última atualização: 2026-09-12

## 🔴 Refactor V4 em andamento (branch `docs-smartgesso-refactor-2026-08-24`)

- [ ] **116 arquivos modificados não commitados** — refactor massivo em curso: `app/(app)/**` (telas/tabs), `app.json`, componentes
  - **IMPORTANTE:** NUNCA commitar código quebrado. Rodar typecheck + testes ANTES de qualquer commit.
  - **IMPORTANTE:** NUNCA pular etapa — ler `docs/PLANO_REFATORACAO_FRONTEND_V4.md` (seção 'Alterações obrigatórias' + 'Testes') antes de despachar subagents
- [ ] **Fase por fase até 100%** — seguir o plano de refatoração; cada fase: implementar → testar → revisar → commitar → só então próxima
- [ ] **ETAPA 15 — Home acionável: helpers ✅, integração final em andamento** — helpers `src/features/home/homeToday.ts`/`homeAlerts.ts` prontos (33 testes), estilos timeline prontos; falta: seção Hoje (timeline), card Serviços Atrasados, banner parcelas vencidas, FeatureGate inventory
- [x] **ETAPA 17 — a11y: ✅ CONCLUÍDA (2026-09-12)** — varredura a11y/theming/design finalizada via auditoria impeccable: contraste textLight AA corrigido, Home/Tabs/Orcamentos/Servicos/Clientes 100% tokens (0 hex), emojis→Ionicons, `tabBarAccessibilityLabel` ×5, labels em KPI cards e menu Mais, Reduce Motion em FadeInView/PressableScale, fonte dinâmica respeitada, skeleton nas 5 telas, `React.memo` nas 4 listas, `adjustResize` + prop `keyboardAvoiding` no ScreenContainer. Detalhes: reference `mobile-design-audit-2026-09.md` da skill smartgesso-development.
- [ ] **Auditoria impeccable: 19.5/20 (Excellent) — restam: keyboardAvoiding nas 5 telas de form (P2), debounce Servicos (P2), minHeight/flexShrink AppButton/AppInput/FinancialSummaryCard (P3)**

## 🟡 Testes

- [ ] **Rodar testes** — `NODE_ENV=test node node_modules/jest/bin/jest.js` (npm test falha no OneDrive)
- [ ] **Cobertura** — conferir que telas refatoradas têm testes (jest)

## 🟡 Pendências de infra

- [ ] **EAS build** — falha com espaço em 'Projetos SaaS' — usar clone GitHub/path sem espaço quando precisar buildar
- [ ] **app.config.ts→app.json** — Node 20 não transpila TS no loader Expo (config já em app.json)

## 🔵 Regras de verificação (obrigatórias antes de commit)

- [ ] `npx tsc --noEmit` — zero erros (ou `npm run typecheck`)
- [ ] Testes (jest via `NODE_ENV=test node node_modules/jest/bin/jest.js`)
- [ ] `git status` — só arquivos esperados

## Referências

- `docs/PLANO_REFATORACAO_FRONTEND_V4.md` — plano do refactor V4 (obrigatório)
- `docs/REQUISITOS.md` — análise de requisitos (produto)
- `docs/ARCHITECTURE.md`, `docs/ROADMAP.md` — arquitetura e evolução
- `docs/API_INTEGRATION.md` — contrato com a API
- Backend: `../SmartGesso-API`
