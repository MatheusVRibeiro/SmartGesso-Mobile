# SmartGesso Mobile — Relatório de QA Tela a Tela

> **Data:** 2026-08-24
> **Autor:** Auditoria de navegação (rotas referenciadas × rotas existentes)
> **Método:** grep de rotas em `app/` + `src/` + inspeção de menu/FeatureGate

---

## 🔴 BUGS CRÍTICOS ENCONTRADOS

### BUG-1: Menu Mais esconde Financeiro, Gestão, Conta e Suporte (RAIZ DE TUDO)
**Sintoma:** Usuário não consegue ver as seções Financeiro, Gestão, Conta, Suporte no menu Mais.
**Causa raiz:** `FeatureGate` com `feature=''` (string vazia) → `featureList.includes('')` = `false` → renderiza `fallback=null`. O menu passa `feature={item.feature ?? ''}` — itens SEM feature (Financeiro, Despesas, Relatórios, Configurações, Usuários, Empresa, Perfil, Ajuda) recebem `''` e são **escondidos**.
**Correção aplicada:** `FeatureGate` agora retorna `children` imediatamente quando `feature` é vazio/undefined + menu passou `feature={item.feature}` sem `?? ''`.
**Status:** ✅ CORRIGIDO (commit pendente)

### BUG-2: Rota /compras não existe → "Not Found"
**Sintoma:** Tocar em "Compras" no menu → tela not found.
**Causa:** Menu referencia `router.push('/compras')` mas não há `app/(app)/compras/` no projeto.
**Correção:** Criando tela de Compras (listagem + novo pedido) usando services prontos (`purchaseOrdersService`, `suppliersService`).
**Status:** ⏳ EM CORREÇÃO (subagent)

### BUG-3 (POTENCIAL): Tela de Compras criada mas sem endpoint no backend?
**Verificação:** Backend tem `GET/POST /purchase-orders` + `GET/POST/PATCH /suppliers` (B10 completo). ✅ Sem bloqueio.

---

## 🟡 PROBLEMAS MENORES IDENTIFICADOS

### P-1: Rota `servicos/novo.tsx` ainda existe (criação manual)
- `app/(app)/servicos/novo.tsx` existe mas a tela de Serviços não tem mais botão "Nova OS" (M2). Rota órfã — não quebra nada, mas pode ser confusa. Manter por compatibilidade.

### P-2: Rota `obras/` (legado Work)
- Módulo Works ainda no menu? Verificar se `obras` aparece no menu Mais — é legado (V4 removeu Work do fluxo novo). Se aparecer, marcar como legado ou esconder.

### P-3: Telas com FeatureGate que dependem de `useCompanyFeatures` loading
- Enquanto features carregam (isLoading), itens com feature SÃO escondidos (fallback). Se a API de features demorar, menu parece vazio por alguns segundos. Considerar mostrar skeleton.

---

## ✅ TELAS VERIFICADAS (rotas existentes × referenciadas)

| Rota | Existe? | Referenciada? | Status |
|------|---------|---------------|--------|
| /agenda | ✅ | ✅ menu | OK |
| /ajuda | ✅ | ✅ menu | OK |
| /catalogo/materiais | ✅ | ✅ menu (Estoque) | OK |
| /clientes | ✅ | ✅ menu | OK |
| /compras | ❌ | ✅ menu | **BUG-2** |
| /configuracoes | ✅ | ✅ menu | OK |
| /configuracoes/empresa | ✅ | ✅ | OK |
| /configuracoes/orcamento | ✅ | ✅ | OK |
| /despesas | ✅ | ✅ menu | OK |
| /notificacoes | ✅ | ✅ menu | OK |
| /pagamentos | ✅ | ✅ menu (Financeiro) | OK |
| /producao | ✅ | ✅ menu | OK |
| /relatorios | ✅ | ✅ menu | OK |
| /usuarios | ✅ | ✅ menu | OK |
| /profile | ✅ | ✅ menu | OK |
| /orcamentos | ✅ | tab | OK |
| /servicos | ✅ | tab | OK |

## ❌ SEÇÕES DO MENU (antes do fix BUG-1)
| Seção | Itens | Visível antes? | Visível depois? |
|-------|-------|----------------|-----------------|
| Operação | Clientes, Agenda, Notificações, Produção, Estoque, Compras | ✅ (feature-gated) | ✅ |
| Financeiro | Financeiro, Despesas | ❌ (feature='') | ✅ |
| Gestão | Relatórios, Configurações, Usuários | ❌ | ✅ |
| Conta | Empresa, Perfil | ❌ | ✅ |
| Suporte | Ajuda e suporte, Trocar empresa | ❌ | ✅ |

---

## PRÓXIMOS PASSOS (QA tela a tela no navegador)

1. ✅ Corrigir BUG-1 (FeatureGate) — feito
2. ⏳ Corrigir BUG-2 (rota compras) — subagent
3. Subir API + Mobile web → testar tela por tela:
   - Login → selecionar empresa
   - Tabs: Home, Orçamentos, Serviços, Novo, Mais
   - Menu Mais: todas as seções visíveis?
   - Financeiro → pagamentos, despesas
   - Gestão → relatórios, configurações, usuários
   - Conta → empresa, perfil
   - Suporte → ajuda
   - Compras → listagem, novo
4. Registrar erros por tela + corrigir

---

## RELATÓRIO DAS 3 FEATURES (#5 Push, #6 Deep Links, #8 Metas)

### Feature #5 — Push Notifications
| Etapa | Backend | Mobile | Status |
|-------|---------|--------|--------|
| PushService | subagent rodando | — | ⏳ |
| Eventos (approve/reject) | subagent rodando | — | ⏳ |
| Cron follow-ups | subagent rodando | — | ⏳ |
| Registro token | — | subagent rodando | ⏳ |
| Handler notificação | — | subagent rodando | ⏳ |
| Badge não-lidas | pendente | pendente | — |

### Feature #6 — Deep Links
| Etapa | Backend | Mobile | Status |
|-------|---------|--------|--------|
| publicToken schema | subagent rodando | — | ⏳ |
| Endpoints públicos | subagent rodando | — | ⏳ |
| Compartilhar link | — | pendente | — |
| Deep link handler | — | pendente | — |

### Feature #8 — Metas/Performance
| Etapa | Backend | Mobile | Status |
|-------|---------|--------|--------|
| CompanyGoal schema | subagent rodando | — | ⏳ |
| Endpoint performance | subagent rodando | — | ⏳ |
| Tela Metas | — | pendente | — |
| Menu/integração | — | pendente | — |
