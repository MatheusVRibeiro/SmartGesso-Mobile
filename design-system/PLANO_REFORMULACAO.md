# SmartGesso — Reformulação de Design (Plano por Etapas)

> **Base:** ui-ux-pro-max design system (`design-system/smartgesso/MASTER.md` + `SPECS_TELAS.md`)
> **Regra:** cada etapa → implementar → typecheck + testes → commit PT-BR → próxima

---

## ETAPA 1 — Tokens de Tema (base) ✅ CONCLUÍDO
- [x] `colors.ts`: Indigo Enterprise light + Linear dark
- [x] `typography.ts`: Plus Jakarta Sans / Outfit (fallback System)
- [x] `radius.ts` e `shadows.ts`: cantos suaves e elevação Soft UI
- [x] Validação: typecheck + testes

## ETAPA 2 — Componentes Animados & Layout Base ✅ CONCLUÍDO
- [x] `FadeInView`: fade + slide-up 300ms ao montar
- [x] `AnimatedCounter`: contador crescente para KPIs
- [x] `Skeleton`: carregamento suave em listas
- [x] `ScreenContainer`: responsividade adaptativa para tablets e web (`maxWidth: 680`)
- [x] Testes + commit

## ETAPA 3 — Componentes Base Redesenhados ✅ CONCLUÍDO
- [x] `AppButton`: botões com altura mínima 48px, spring press e variantes
- [x] `AppInput` & `PasswordInput`: labels flutuantes, anéis de foco e mensagens de erro
- [x] `AppCard`: sombras indigo tint e bordas do tema
- [x] `StatusBadge`: cores semânticas completas
- [x] `ThemeSelector`: componente com opções Claro, Escuro e Sistema
- [x] Testes + commit

## ETAPA 4 — Dark Mode e Escolha de Temas no App ✅ CONCLUÍDO
- [x] `ThemeProvider`: suporte a `light`, `dark` e `system` com persistência no `AsyncStorage`
- [x] `ThemeSelector`: integrado em `Configuracoes` e no `Profile`
- [x] Alternador rápido de tema direto na tela de `Login`
- [x] Testes + commit: `e7e2ef9`

## ETAPA 5 — Telas Principais Redesenhadas ✅ CONCLUÍDO
- [x] **Dashboard / Início**: KPIs dinâmicos, gráfico mensal, follow-ups e layout responsivo (`e7e2ef9`)
- [x] **Login**: card centralizado em telas grandes, alternador de tema e microinterações (`b32999e`)
- [x] **Orçamentos**: busca com debounce, chips de filtro de status e cards estilizados (`e57050d`)
- [x] **Serviços / OS**: filtros operacionais, busca rápida por código/cliente e badges de status (`e57050d`)
- [x] **Menu Mais**: navegação por categorias, badges de contagem e suporte a tema escuro (`e57050d`)
- [x] **Clientes**: busca com debounce, cards PF/PJ, contatos rápidos WhatsApp (`241a61c`)
- [x] **Calculadora Drywall & Ações Rápidas**: estimativa instantânea de m², insumos e custos (`1951e1c`)
- [x] Testes + commit

---

## Status Consolidado
| Etapa | Status | Commits |
|-------|--------|---------|
| 1. Tokens | ✅ Concluído | `fb7099c`, `e85f060` |
| 2. Componentes animados | ✅ Concluído | `e85f060`, `e7e2ef9` |
| 3. Componentes base | ✅ Concluído | `e85f060`, `e7e2ef9` |
| 4. Dark mode & Escolha de temas | ✅ Concluído | `e7e2ef9` |
| 5. Telas principais responsivas | ✅ Concluído | `b32999e`, `e57050d`, `241a61c`, `1951e1c` |
