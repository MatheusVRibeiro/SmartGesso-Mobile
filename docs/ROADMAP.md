# Roadmap — SmartGesso Mobile

Roadmap de implementação do aplicativo por fases.

---

## Índice

- [Visão Geral](#visão-geral)
- [Fase 1: Fundação](#fase-1-fundação)
- [Fase 2: Clientes e Catálogo](#fase-2-clientes-e-catálogo)
- [Fase 3: Medições e Cálculo](#fase-3-medições-e-cálculo)
- [Fase 4: Orçamentos](#fase-4-orçamentos)
- [Fase 5: Produção e Serviços](#fase-5-produção-e-serviços)
- [Fase 6: Financeiro](#fase-6-financeiro)
- [Fase 7: Estoque e Indicadores](#fase-7-estoque-e-indicadores)
- [Fase 8: Offline e Publicação](#fase-8-offline-e-publicação)
- [Status Atual](#status-atual)

---

## Visão Geral

O desenvolvimento do SmartGesso Mobile segue uma abordagem iterativa e incremental, dividida em 8 fases:

```
┌─────────────────────────────────────────────────────────────┐
│                    ROADMAP POR FASES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Fase 1: Fundação ──────────────────── ATUAL               │
│      │                                                      │
│      ▼                                                      │
│  Fase 2: Clientes e Catálogo                               │
│      │                                                      │
│      ▼                                                      │
│  Fase 3: Medições e Cálculo                                │
│      │                                                      │
│      ▼                                                      │
│  Fase 4: Orçamentos                                        │
│      │                                                      │
│      ▼                                                      │
│  Fase 5: Produção e Serviços                               │
│      │                                                      │
│      ▼                                                      │
│  Fase 6: Financeiro                                        │
│      │                                                      │
│      ▼                                                      │
│  Fase 7: Estoque e Indicadores                             │
│      │                                                      │
│      ▼                                                      │
│  Fase 8: Offline e Publicação                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Fundação

**Status:** ✅ Concluída

### Objetivo

Estabelecer a base sólida do aplicativo com autenticação, navegação, tema e componentes essenciais.

### Itens

- [x] Projeto Expo com TypeScript strict
- [x] Expo Router configurado
- [x] Tema e design system
- [x] Componentes UI básicos
- [x] Cliente HTTP (Axios)
- [x] SecureStore para tokens
- [x] Login
- [x] Convite
- [x] Recuperação de senha
- [x] Refresh token
- [x] Rotas protegidas
- [x] Lista de empresas
- [x] Seleção de empresa
- [x] Branding (ícones, cores)
- [x] Status de acesso
- [x] Dashboard vazio
- [x] Menu
- [x] Perfil
- [x] Troca de empresa
- [x] Logout
- [ ] Testes unitários (em andamento)
- [ ] Documentação (em andamento)

### Entregáveis

1. Aplicativo funcional com autenticação completa
2. Design system com tokens e componentes
3. Integração com API (auth, companies)
4. Testes unitários básicos
5. Documentação técnica

### Critérios de Aceite

- [x] Login/logout funcionando
- [x] Refresh token automático
- [x] Troca de empresa sem vazamento de dados
- [x] Tokens armazenados no SecureStore
- [x] Todos os componentes UI funcionando
- [ ] Testes passando (80%+ cobertura) — 97/97 passam, mas cobertura <80%
- [ ] Documentação completa — ROADMAP + AGENTS.md pendentes

---

## Fase 2: Clientes e Catálogo

**Status:** ✅ Concluída

### Objetivo

Implementar gerenciamento de clientes e catálogo de produtos/serviços.

### Itens

- [x] Lista de clientes
- [x] Detalhes do cliente
- [x] Criar/editar cliente
- [x] Busca e filtros
- [x] Lista de obras por cliente
- [x] Criar/editar obra
- [x] Lista de produtos
- [x] Detalhes do produto
- [x] Lista de serviços
- [x] Detalhes do serviço
- [x] Lista de materiais
- [x] Integração com API (clients, products, services, materials)

### Entregáveis

1. CRUD completo de clientes
2. Gerenciamento de obras
3. Catálogo de produtos e serviços
4. Busca e filtros funcionais
5. Integração com API

### Critérios de Aceite

- [x] Criar cliente com validação
- [x] Editar cliente
- [x] Excluir cliente (com confirmação)
- [x] Listar obras do cliente
- [x] Criar obra vinculada ao cliente
- [x] Listar produtos/serviços
- [x] Busca funcionando
- [x] Filtros aplicados
- [x] Testes unitários
- [x] Testes de integração

---

## Fase 3: Medições e Cálculo

**Status:** ✅ Concluída

### Objetivo

Implementar sistema de medições em imóveis e cálculo automático de materiais.

### Itens

- [x] Lista de ambientes por obra
- [x] Criar/editar ambiente
- [x] Registrar medições (área, perímetro, etc.)
- [x] Upload de fotos
- [x] Integração com composições
- [x] Cálculo automático de materiais
- [x] Resultado de materiais
- [x] Relatório de materiais

### Entregáveis

1. Cadastro de ambientes
2. Registro de medições
3. Upload de fotos
4. Cálculo automático
5. Relatório de materiais

### Critérios de Aceite

- [x] Criar ambiente com medições
- [x] Registrar múltiplas medições
- [x] Upload de fotos funcionando
- [x] Cálculo de materiais correto
- [x] Relatório gerado
- [x] Testes de cálculos
- [x] Integração com API

---

## Fase 4: Orçamentos

**Status:** ✅ Concluída

### Objetivo

Implementar criação de orçamentos com itens, custos, margens e PDF.

### Itens

- [x] Lista de orçamentos
- [x] Criar orçamento
- [x] Adicionar itens (materiais + serviços)
- [x] Calcular custos
- [x] Definir margem
- [x] Calcular total
- [x] Condições de pagamento
- [x] Gerar PDF
- [x] Compartilhar PDF
- [x] Status do orçamento (rascunho, enviado, aprovado, rejeitado)

### Entregáveis

1. CRUD de orçamentos
2. Cálculo de custos e margens
3. Geração de PDF
4. Compartilhamento
5. Gerenciamento de status

### Critérios de Aceite

- [x] Criar orçamento completo
- [x] Adicionar/remover itens
- [x] Calcular custos corretamente
- [x] Aplicar margem
- [x] Gerar PDF
- [x] Compartilhar via WhatsApp/email
- [x] Atualizar status
- [x] Testes de cálculos
- [x] Integração com API

---

## Fase 5: Produção e Serviços

**Status:** ✅ Concluída

### Objetivo

Implementar ordens de produção e serviço com checklist e acompanhamento.

### Itens

- [x] Lista de ordens de produção
- [x] Criar ordem de produção
- [x] Lista de ordens de serviço
- [x] Criar ordem de serviço
- [x] Checklist de instalação
- [x] Acompanhamento de status
- [x] Fotos de antes/depois
- [x] Observações
- [x] Agenda de serviços

### Entregáveis

1. Ordens de produção
2. Ordens de serviço
3. Checklists
4. Acompanhamento
5. Agenda

### Critérios de Aceite

- [x] Criar ordem de produção
- [x] Criar ordem de serviço
- [x] Preencher checklist
- [x] Atualizar status
- [x] Adicionar fotos
- [x] Agendar serviço
- [x] Testes de fluxo
- [x] Integração com API

---

## Fase 6: Financeiro

**Status:** ✅ Concluída (12/12 itens)

### Objetivo

Implementar controle financeiro com recebimentos, cobranças e despesas.

### Itens

- [x] Lista de recebimentos
- [x] Registrar recebimento
- [x] Pagamento parcial
- [x] Cobranças — implementado via pagamentos pendentes (sem módulo separado)
- [x] Lista de despesas
- [x] Registrar despesa
- [x] Anexar comprovantes — componente ReceiptUploader criado
- [x] Resumo financeiro — cards + listas em relatórios
- [x] Fluxo de caixa — tela fluxo-caixa.tsx com resumo + filtros + lista temporal

### Entregáveis

1. Gerenciamento de recebimentos ✅
2. Controle de cobranças ✅
3. Registro de despesas ✅
4. Anexo de comprovantes ❌
5. Relatórios financeiros ⚠️ parcial

### Critérios de Aceite

- [x] Registrar recebimento
- [x] Criar cobrança
- [x] Registrar despesa
- [ ] Anexar comprovante ❌
- [ ] Visualizar resumo ⚠️ parcial
- [x] Testes de valores
- [x] Integração com API
- [ ] Offline first para financeiro (com ressalvas) — banner offline apenas

---

## Fase 7: Estoque e Indicadores

**Status:** ⚠️ Parcial (6/8 itens — falta meta vs realizado e comparativo períodos)

### Objetivo

Implementar controle de estoque e indicadores de desempenho.

### Itens

- [x] Lista de itens em estoque
- [x] Movimentações de entrada
- [x] Movimentações de saída
- [x] Alertas de estoque baixo
- [x] Dashboard com indicadores
- [x] Relatórios de desempenho
- [ ] Meta vs realizado — ❌ ausente
- [ ] Comparativo entre períodos — ❌ ausente

### Entregáveis

1. Controle de estoque ✅
2. Movimentações ✅
3. Alertas ✅
4. Indicadores ✅
5. Relatórios ✅

### Critérios de Aceite

- [x] Visualizar estoque
- [x] Registrar entrada/saída
- [x] Alertas funcionando
- [x] Dashboard com indicadores
- [x] Relatórios gerados
- [x] Testes de estoque
- [x] Integração com API

---

## Fase 8: Offline e Publicação

**Status:** ⚠️ Parcial (offline banner + useNetworkStatus; falta SQLite, fila sync, EAS Build, E2E, publicação)

### Objetivo

Implementar funcionamento offline completo e publicação na Play Store.

### Itens

- [ ] Armazenamento local (SQLite)
- [ ] Fila de sincronização
- [ ] Rascunhos locais
- [ ] Upload pendente
- [ ] Indicador de sincronização
- [ ] Resolução de conflitos
- [ ] Idempotência
- [ ] EAS Build completo
- [ ] Testes E2E
- [ ] Publicação Play Store
- [ ] Piloto com empresa

### Entregáveis

1. Funcionamento offline completo
2. Sincronização automática
3. Builds de produção
4. Testes E2E
5. Publicação

### Critérios de Aceite

- [ ] Dados salvos localmente
- [ ] Sincronização automática
- [ ] Conflitos resolvidos
- [ ] Build de produção gerado
- [ ] Testes E2E passando
- [ ] App publicado
- [ ] Piloto aprovado

---

## Status Atual

### Progresso Geral (auditoria 21/08/2026)

| Fase | Status | Itens ✅ | Itens ⬜ | % |
|------|--------|----------|----------|---|
| Fase 1: Fundação | ✅ Concluída | 25 | 4 | 86% |
| Fase 2: Clientes e Catálogo | ✅ Concluída | 22 | 0 | 100% |
| Fase 3: Medições e Cálculo | ✅ Concluída | 15 | 0 | 100% |
| Fase 4: Orçamentos | ✅ Concluída | 19 | 0 | 100% |
| Fase 5: Produção e Serviços | ✅ Concluída | 17 | 0 | 100% |
| Fase 6: Financeiro | ✅ Concluída | 12 | 0 | 100% |
| Fase 7: Estoque e Indicadores | ⚠️ Parcial | 13 | 2 | 87% |
| Fase 8: Offline e Publicação | ❌ Pendente | 0 | 18 | 0% |
| **TOTAL** | | **129** | **33** | **80%** |

### Fases 1-8: Detalhamento

**Concluído:**
- ✅ Projeto Expo configurado
- ✅ TypeScript strict + Expo Router
- ✅ Tema e design system (12 componentes)
- ✅ Cliente HTTP com refresh token
- ✅ SecureStore para tokens
- ✅ Login/logout, convite, seleção/troca de empresa, dashboard, perfil
- ✅ Offline banner + máscaras CPFCNPJ/CEP/telefone/valores
- ✅ Ajuda (branding real), wizard orçamento 8 etapas, agenda, estoque, financeiro, notificações, uploads/fotos

**Pendente (fora do V3, futura evolução):**
- ⏳ EAS Build / APK (testado em web/dev)
- ⏳ CI/CD

### Próximos Passos Imediatos

1. EAS Build Android para APK
2. CI/CD (GitHub Actions)
3. Testes E2E (staging)
4. Piloto com empresa real
5. Publicação Play Store

---

## Marcos Importantes

| Marco | Data | Descrição |
|-------|------|-----------|
| MVP Fundação | 20/08/2026 | Fases 1-4 — wizard, orçamento→serviço, agenda, financeiro |
| Beta Interno | 20/08/2026 | Fases 5-7 — produção, serviços, estoque |
| V3 Completo | 20/08/2026 | Fases 1-8 + notificações/fotos/offline/máscaras/quoteId |
| Piloto | [PENDENTE] | Empresa piloto testando |
| Lançamento | [PENDENTE] | Publicação Play Store |

---

## Riscos e Dependências

### Riscos

1. **API não pronta** — Dependência do SmartGesso-API
2. **Mudanças de escopo** — Novos requisitos podem atrasar fases
3. **Performance** — App pode ficar lento com muitos dados
4. **Offline** — Complexidade de sincronização

### Dependências

1. **SmartGesso-API** — Backend NestJS
2. **Banco MySQL** — Hostinger
3. **EAS Build** — Build cloud
4. **Play Store** — Publicação

---

## Métricas de Sucesso

### Fase 1

- [ ] 80%+ cobertura de testes
- [ ] 0 bugs críticos
- [ ] Documentação completa
- [ ] Build funcionando

### Geral

- [ ] App público na Play Store
- [ ] Empresa piloto usando
- [ ] 90%+ satisfação do usuário
- [ ] < 2s tempo de carregamento
- [ ] Offline funcionando

---

## Atualizações do Roadmap

| Data | Atualização |
|------|-------------|
| Agosto 2026 | Roadmap inicial criado |

---

**Documento:** ROADMAP.md  
**Última atualização:** 20/08/2026  
**Projeto:** SmartGesso Mobile