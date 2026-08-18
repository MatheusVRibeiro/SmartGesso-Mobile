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

**Status:** ✅ Em andamento

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

- [ ] Login/logout funcionando
- [ ] Refresh token automático
- [ ] Troca de empresa sem vazamento de dados
- [ ] Tokens armazenados no SecureStore
- [ ] Todos os componentes UI funcionando
- [ ] Testes passando (80%+ cobertura)
- [ ] Documentação completa

---

## Fase 2: Clientes e Catálogo

**Status:** ⏳ Pendente

### Objetivo

Implementar gerenciamento de clientes e catálogo de produtos/serviços.

### Itens

- [ ] Lista de clientes
- [ ] Detalhes do cliente
- [ ] Criar/editar cliente
- [ ] Busca e filtros
- [ ] Lista de obras por cliente
- [ ] Criar/editar obra
- [ ] Lista de produtos
- [ ] Detalhes do produto
- [ ] Lista de serviços
- [ ] Detalhes do serviço
- [ ] Lista de materiais
- [ ] Integração com API (clients, products, services, materials)

### Entregáveis

1. CRUD completo de clientes
2. Gerenciamento de obras
3. Catálogo de produtos e serviços
4. Busca e filtros funcionais
5. Integração com API

### Critérios de Aceite

- [ ] Criar cliente com validação
- [ ] Editar cliente
- [ ] Excluir cliente (com confirmação)
- [ ] Listar obras do cliente
- [ ] Criar obra vinculada ao cliente
- [ ] Listar produtos/serviços
- [ ] Busca funcionando
- [ ] Filtros aplicados
- [ ] Testes unitários
- [ ] Testes de integração

---

## Fase 3: Medições e Cálculo

**Status:** ⏳ Pendente

### Objetivo

Implementar sistema de medições em imóveis e cálculo automático de materiais.

### Itens

- [ ] Lista de ambientes por obra
- [ ] Criar/editar ambiente
- [ ] Registrar medições (área, perímetro, etc.)
- [ ] Upload de fotos
- [ ] Integração com composições
- [ ] Cálculo automático de materiais
- [ ] Resultado de materiais
- [ ] Relatório de materiais

### Entregáveis

1. Cadastro de ambientes
2. Registro de medições
3. Upload de fotos
4. Cálculo automático
5. Relatório de materiais

### Critérios de Aceite

- [ ] Criar ambiente com medições
- [ ] Registrar múltiplas medições
- [ ] Upload de fotos funcionando
- [ ] Cálculo de materiais correto
- [ ] Relatório gerado
- [ ] Testes de cálculos
- [ ] Integração com API

---

## Fase 4: Orçamentos

**Status:** ⏳ Pendente

### Objetivo

Implementar criação de orçamentos com itens, custos, margens e PDF.

### Itens

- [ ] Lista de orçamentos
- [ ] Criar orçamento
- [ ] Adicionar itens (materiais + serviços)
- [ ] Calcular custos
- [ ] Definir margem
- [ ] Calcular total
- [ ] Condições de pagamento
- [ ] Gerar PDF
- [ ] Compartilhar PDF
- [ ] Status do orçamento (rascunho, enviado, aprovado, rejeitado)

### Entregáveis

1. CRUD de orçamentos
2. Cálculo de custos e margens
3. Geração de PDF
4. Compartilhamento
5. Gerenciamento de status

### Critérios de Aceite

- [ ] Criar orçamento completo
- [ ] Adicionar/remover itens
- [ ] Calcular custos corretamente
- [ ] Aplicar margem
- [ ] Gerar PDF
- [ ] Compartilhar via WhatsApp/email
- [ ] Atualizar status
- [ ] Testes de cálculos
- [ ] Integração com API

---

## Fase 5: Produção e Serviços

**Status:** ⏳ Pendente

### Objetivo

Implementar ordens de produção e serviço com checklist e acompanhamento.

### Itens

- [ ] Lista de ordens de produção
- [ ] Criar ordem de produção
- [ ] Lista de ordens de serviço
- [ ] Criar ordem de serviço
- [ ] Checklist de instalação
- [ ] Acompanhamento de status
- [ ] Fotos de antes/depois
- [ ] Observações
- [ ] Agenda de serviços

### Entregáveis

1. Ordens de produção
2. Ordens de serviço
3. Checklists
4. Acompanhamento
5. Agenda

### Critérios de Aceite

- [ ] Criar ordem de produção
- [ ] Criar ordem de serviço
- [ ] Preencher checklist
- [ ] Atualizar status
- [ ] Adicionar fotos
- [ ] Agendar serviço
- [ ] Testes de fluxo
- [ ] Integração com API

---

## Fase 6: Financeiro

**Status:** ⏳ Pendente

### Objetivo

Implementar controle financeiro com recebimentos, cobranças e despesas.

### Itens

- [ ] Lista de recebimentos
- [ ] Registrar recebimento
- [ ] Pagamento parcial
- [ ] Lista de cobranças
- [ ] Criar cobrança
- [ ] Lista de despesas
- [ ] Registrar despesa
- [ ] Anexar comprovantes
- [ ] Resumo financeiro
- [ ] Fluxo de caixa

### Entregáveis

1. Gerenciamento de recebimentos
2. Controle de cobranças
3. Registro de despesas
4. Anexo de comprovantes
5. Relatórios financeiros

### Critérios de Aceite

- [ ] Registrar recebimento
- [ ] Criar cobrança
- [ ] Registrar despesa
- [ ] Anexar comprovante
- [ ] Visualizar resumo
- [ ] Testes de valores
- [ ] Integração com API
- [ ] Offline first para financeiro (com ressalvas)

---

## Fase 7: Estoque e Indicadores

**Status:** ⏳ Pendente

### Objetivo

Implementar controle de estoque e indicadores de desempenho.

### Itens

- [ ] Lista de itens em estoque
- [ ] Movimentações de entrada
- [ ] Movimentações de saída
- [ ] Alertas de estoque baixo
- [ ] Dashboard com indicadores
- [ ] Relatórios de desempenho
- [ ] Meta vs realizado
- [ ] Comparativo entre períodos

### Entregáveis

1. Controle de estoque
2. Movimentações
3. Alertas
4. Indicadores
5. Relatórios

### Critérios de Aceite

- [ ] Visualizar estoque
- [ ] Registrar entrada/saída
- [ ] Alertas funcionando
- [ ] Dashboard com indicadores
- [ ] Relatórios gerados
- [ ] Testes de estoque
- [ ] Integração com API

---

## Fase 8: Offline e Publicação

**Status:** ⏳ Pendente

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

### Progresso Geral

| Fase | Status | Progresso |
|------|--------|-----------|
| Fase 1: Fundação | 🔄 Em andamento | 85% |
| Fase 2: Clientes e Catálogo | ⏳ Pendente | 0% |
| Fase 3: Medições e Cálculo | ⏳ Pendente | 0% |
| Fase 4: Orçamentos | ⏳ Pendente | 0% |
| Fase 5: Produção e Serviços | ⏳ Pendente | 0% |
| Fase 6: Financeiro | ⏳ Pendente | 0% |
| Fase 7: Estoque e Indicadores | ⏳ Pendente | 0% |
| Fase 8: Offline e Publicação | ⏳ Pendente | 0% |

### Fase 1: Detalhamento

**Concluído:**
- ✅ Projeto Expo configurado
- ✅ TypeScript strict
- ✅ Expo Router
- ✅ Tema e design system
- ✅ Componentes UI (12 componentes)
- ✅ Cliente HTTP com refresh
- ✅ SecureStore
- ✅ Login/logout
- ✅ Convite
- ✅ Recuperação de senha
- ✅ Seleção de empresa
- ✅ Troca de empresa
- ✅ Dashboard vazio
- ✅ Perfil
- ✅ Offline banner

**Em andamento:**
- 🔄 Testes unitários
- 🔄 Documentação

**Pendente:**
- ⏳ Testes de integração
- ⏳ Testes E2E
- ⏳ CI/CD

### Próximos Passos Imediatos

1. Completar testes unitários da Fase 1
2. Finalizar documentação
3. Iniciar Fase 2 (Clientes)
4. Configurar CI/CD
5. Planejar piloto

---

## Marcos Importantes

| Marco | Data Alvo | Descrição |
|-------|-----------|-----------|
| MVP Fundação | [PENDENTE] | Fase 1 completa |
| Beta Interno | [PENDENTE] | Fases 1-4 |
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
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile