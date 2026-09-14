# SmartGesso Mobile — Specs de Design Tela a Tela

> **Base:** `design-system/smartgesso/MASTER.md` (gerado por ui-ux-pro-max)
> **Data:** 2026-08-25
> **Escopo:** 38 rotas principais — specs de UI/UX antes da implementação

---

## 🎨 Design Tokens (aplicar em TODAS as telas)

### Cores
| Token | Hex | Uso |
|-------|-----|-----|
| `colors.primary` | `#1E40AF` | Ações principais, tabs ativas, links |
| `colors.secondary` | `#3B82F6` | Elementos secundários, botões outline |
| `colors.accent` | `#059669` | CTA de sucesso, valores positivos, confirmação |
| `colors.destructive` | `#DC2626` | Exclusão, erros, valores negativos |
| `colors.background` | `#F8FAFC` (light) / `#0F172A` (dark) | Fundo da tela |
| `colors.card` | `#FFFFFF` / `#101A34` | Cards, superfícies |
| `colors.border` | `#E2E8F0` | Bordas de inputs/cards |
| `colors.warning` | `#D97706` | Alertas, pendências |

### Tipografia — Plus Jakarta Sans
| Token | Tamanho | Peso | Uso |
|-------|---------|------|-----|
| `display` | 28px | 800 | Tela vazia, números grandes |
| `h1` | 22px | 700 | Título de tela |
| `h2` | 18px | 700 | Título de seção/card |
| `body` | 16px | 400 | Texto padrão |
| `label` | 14px | 600 | Rótulos de campo |
| `caption` | 12px | 400 | Legendas, timestamps |

### Espaçamento
- `xs` 4 · `sm` 8 · `md` 16 · `lg` 24 · `xl` 32 · `2xl` 48

### Efeitos
- **Gradiente** primário → secundário nos CTAs principais e tab ativa
- **Sombra de card** `rgba(79,70,229,0.08)` (indigo tint)
- **Spring press** `scale 0.97` em botões (150ms)
- **Skeletal loading** em telas de lista (pulso indigo/slate)
- **Bottom sheets** com drag-dismiss para seletores
- **Focus ring** `#1E40AF20` (3px) em inputs

---

## 📱 SPECS POR TELA

### 1. LOGIN (app/(auth)/login)
- **Layout:** Centralizado, logo + gradiente de fundo suave (indigo→slate 5%)
- **Form:** Floating-label inputs (email, senha com toggle) — validação onBlur
- **CTA:** Botão primário full-width com gradiente, spring press, loading spinner
- **Extras:** "Esqueci a senha" link, mensagem de erro inline (não toast)
- **Anti:** Não usar emoji como ícone — ícones Lucide (mail, lock)

### 2. SELECT-COMPANY (app/(company)/select-company)
- **Lista:** Cards de empresa com logo/avatar inicial, nome + CNPJ
- **Seleção:** Card ativo com border primária + check accent
- **Empty:** "Nenhuma empresa" + CTA convite (se aplicável)

### 3. HOME / DASHBOARD (app/(app)/(tabs)/index)
- **Header:** Saudação "Olá, {nome} 👋" (texto, não emoji-ícone) + badge de período
- **Ações rápidas:** 4-5 ícones circulares com gradiente (Orçamento, Nova OS, Pagamento, Despesa, Produção) — touch 44px+
- **KPIs:** Cards com métricas (A receber, Serviços hoje, Orçamentos abertos, Despesas) — clique navega
- **Gráfico:** Área mensal (receita vs despesa) com legendas coloridas acessíveis (não só cor)
- **Follow-ups:** Cards com botão WhatsApp (accent), swipe-to-action
- **Alerta estoque:** Badge vermelho quando `stockLowCount > 0`
- **Loading:** Skeletal pulsing (não spinner)

### 4. ORÇAMENTOS LISTA (app/(app)/(tabs)/orcamentos)
- **Filtros:** Chips de status (Todos, Rascunho, Enviado, Aprovado) — seleção com border primária
- **Cards:** Nº orçamento + cliente + total + status badge colorido
- **Pull-to-refresh + empty state** ("Nenhum orçamento. Toque + para criar")

### 5. NOVO ORÇAMENTO / WIZARD (app/(app)/orcamentos/novo)
- **Progresso:** Barra de etapas 8 passos com indicador visual (não só número)
- **Steps:** Cliente → Local → Ambientes → Itens → Valores → Prazo → Pagamento → Revisão
- **Validação:** Inline por campo (onBlur), erro perto do campo
- **Botão continuar:** Full-width no bottom com gradiente
- **Revisão:** Resumo consolidado em cards, editar volta ao step
- **Anti:** Não validar só no submit; não esconder erros

### 6. ORÇAMENTO DETALHE (app/(app)/orcamentos/[id])
- **Header:** Status badge + ações (PDF, Compartilhar link, Nova versão)
- **Conteúdo:** Informações do cliente, ambientes, itens, valores em seções com títulos
- **Ações contextuais:** Aprovar (accent), Rejeitar (destructive) conforme status
- **ConfirmDialog** para ações destrutivas (backdrop blur)

### 7. SERVIÇOS LISTA (app/(app)/(tabs)/servicos)
- **Cards:** Código OS + cliente + status + valor — status badge (Pendente amber, Em andamento blue, Concluído green, Cancelado red)
- **Empty state:** "Orçamentos aprovados aparecem aqui automaticamente"

### 8. SERVIÇO DETALHE (app/(app)/servicos/[id])
- **Seções:** Resumo, Financeiro (recebíveis/despesas), Aditivos, Garantia, Follow-ups
- **Tabs internas** ou seções colapsáveis
- **Ações:** Registrar pagamento, Adicionar aditivo, Iniciar garantia

### 9. FINANCEIRO / PAGAMENTOS (app/(app)/pagamentos)
- **Resumo:** Card "A receber" com valor total + badge pendências
- **Lista:** Pagamentos com status (Pendente amber, Confirmado green, Vencido red)
- **Filtros:** Chips por status
- **Empty:** "Nenhum pagamento registrado"

### 10. DESPESAS (app/(app)/despesas)
- **Cards:** Categoria + descrição + valor + data
- **Resumo mensal:** Total do mês no header
- **Empty:** "Nenhuma despesa. Registre a primeira"

### 11. COMPRAS (app/(app)/compras)
- **Cards:** Pedido + fornecedor + status badge (DRAFT gray, ORDERED blue, RECEIVED green, CANCELLED red)
- **FAB/CTA:** "+ Novo pedido"
- **Empty:** "Nenhum pedido de compra"

### 12. CLIENTES (app/(app)/clientes)
- **Busca:** Input com ícone de lupa, debounce 300ms
- **Cards:** Avatar inicial + nome + telefone/whatsapp
- **FAB:** "+ Novo cliente"

### 13. AGENDA (app/(app)/agenda)
- **Lista:** Compromissos/visitas com horário, cliente, tipo
- **Hoje:** Seção destacada "Hoje" com accent

### 14. ESTOQUE / MATERIAIS (app/(app)/catalogo/materiais)
- **Grid ou lista:** Material + unidade + quantidade
- **Alerta:** Item com `stockQty <= minStockQty` → badge vermelho + sugestão de reposição
- **FAB:** "+ Material"

### 15. RELATÓRIOS (app/(app)/relatorios)
- **Menu de relatórios:** Cards (Visão geral, Fluxo de caixa, Meta vs Realizado, Comparativo)
- **Gráficos:** Barras/linhas com legendas + tooltips (não só cor)

### 16. METAS & PERFORMANCE (app/(app)/metas)
- **Seletor mês/ano:** Chips horizontais
- **Progresso:** Barras com % (receita, orçamentos, aprovação) — accent quando >= 100%
- **Ranking:** Lista por vendedor com posição + métricas
- **CTA:** "Definir metas" → bottom sheet com 3 inputs moeda

### 17. NOTIFICAÇÕES (app/(app)/notificacoes)
- **Lista:** Ícone por tipo (colorido), título + corpo + tempo relativo
- **Não-lida:** Ponto accent à esquerda
- **Tap:** Marca lida + navega (data.route)
- **Empty:** "Você está em dia"

### 18. USUÁRIOS (app/(app)/usuarios)
- **Cards:** Avatar + nome + role + status (Ativo/Convite pendente)
- **FAB:** "Convidar usuário"

### 19. PERFIL (app/(app)/profile)
- **Header:** Avatar grande + nome + email
- **Seções:** Conta, Empresa, Sobre o app (versão)

### 20. CONFIGURAÇÕES (app/(app)/configuracoes)
- **Lista:** Cards por seção (Empresa, Orçamento) com chevron
- **Toggle:** Dark mode (futuro), preferências

### 21. AJUDA (app/(app)/ajuda)
- **Cards:** FAQ, Contato, WhatsApp suporte

---

## 📐 COMPONENTES BASE (aplicar globalmente)

### AppButton
- Primary: gradiente `#1E40AF→#3B82F6`, texto branco, radius 12, peso 600
- Secondary: transparente + border primary
- Danger: `#DC2626` solid
- Loading: spinner + desabilitado
- Press: scale 0.97, 150ms

### AppInput
- Floating label (sobe ao focar/preencher)
- Focus: border `#1E40AF` + ring 3px `#1E40AF20`
- Erro: border `#DC2626` + mensagem inline abaixo
- Máscaras: currency/CPF/phone com prefixo visual

### AppCard
- Fundo card, radius 12-16, sombra `rgba(79,70,229,0.08)`
- Press: translateY -2px + sombra maior

### StatusBadge
- Map: PENDENTE/RASCUNHO → amber, CONFIRMADO/APROVADO → green, CANCELADO/REJEITADO → red, EM_ANDAMENTO → blue

### EmptyState
- Ícone Lucide grande (48px) cinza + mensagem + CTA

### LoadingState
- Skeletal pulse (indigo/slate 10%) em vez de spinner (telas de lista)

---

## ✅ CHECKLIST DE ACESSIBILIDADE (todas as telas)
- [ ] Touch targets ≥ 44×44px
- [ ] Contraste texto ≥ 4.5:1
- [ ] `accessibilityLabel` em todos os botões de ícone
- [ ] `accessibilityRole` correto (button, tab, header)
- [ ] Focus visível (não remover outline)
- [ ] Erros inline perto do campo
- [ ] Ícones SVG/Lucide — **nunca emoji como ícone**

---

## 🚫 ANTI-PADRÕES (não fazer)
- Gradientes rosa/roxo "AI"
- Emojis como ícones funcionais
- Validar formulário só no submit
- Empty state em branco sem ação
- Spinner infinito sem skeleton
- Texto < 12px em body
