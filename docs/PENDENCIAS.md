# PENDÊNCIAS — SmartGesso Mobile (SmartGesso-Mobile)

> Lista viva de pendências, priorizadas 🔴🟠🟡🔵. Atualizar a cada fase. A IA lê este arquivo para saber O QUE FAZER EM SEGUIDA sem perguntar.
> Última atualização: 2026-08-27

## 🔴 Refactor V4 em andamento (branch `docs-smartgesso-refactor-2026-08-24`)

- [ ] **116 arquivos modificados não commitados** — refactor massivo em curso: `app/(app)/**` (telas/tabs), `app.json`, componentes
  - **IMPORTANTE:** NUNCA commitar código quebrado. Rodar typecheck + testes ANTES de qualquer commit.
  - **IMPORTANTE:** NUNCA pular etapa — ler `docs/PLANO_REFATORACAO_FRONTEND_V4.md` (seção 'Alterações obrigatórias' + 'Testes') antes de despachar subagents
- [ ] **Fase por fase até 100%** — seguir o plano de refatoração; cada fase: implementar → testar → revisar → commitar → só então próxima

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
