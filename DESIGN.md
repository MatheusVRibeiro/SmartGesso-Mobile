# SmartGesso — Design System

## Palette (OKLCH → hex)

| Role | OKLCH | Hex | Uso |
|---|---|---|---|
| primary | oklch(0.45 0.18 270) | `#4338CA` | Ações, links, foco, tab ativa |
| primary-strong | oklch(0.38 0.16 270) | `#3730A3` | Pressed/hover de ações |
| primary-soft | oklch(0.95 0.03 270) | `#EEF0FF` | Fundo de ícones/badges |
| bg | oklch(0.97 0 0) | `#F7F7F8` | Fundo do app (neutro, NÃO cream) |
| surface | oklch(1 0 0) | `#FFFFFF` | Cards, inputs, headers |
| ink | oklch(0.22 0.02 270) | `#1E2230` | Texto principal |
| text-secondary | oklch(0.45 0.02 270) | `#5A6172` | Texto secundário (≥4.5:1) |
| border | oklch(0.90 0.01 270) | `#E2E4EA` | Bordas de cards/inputs |
| success | oklch(0.60 0.15 160) | `#059669` | Pagamentos, ativo, concluído |
| warning | oklch(0.65 0.15 70) | `#D97706` | Pendente, alerta, em andamento |
| danger | oklch(0.55 0.20 25) | `#DC2626` | Erro, cancelado, excluir |
| info | oklch(0.55 0.15 255) | `#2563EB` | Informativo |

## Typography

- **Display/Heading**: Inter Bold 24–28 (telas de título)
- **Body**: Inter Regular 15–16 (conteúdo)
- **Caption**: Inter Regular 13 (labels, metadados)
- **Números/Valores**: Inter SemiBold 20–24 (destaque financeiro)
- Line-height: 1.4–1.5 · Letter-spacing: -0.01em (headings)

## Spacing (escala 4)

xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32 · 4xl 40 · 5xl 48

## Radius

sm 8 · md 12 · lg 16 · xl 24 · full 999 (cards ≤16, pills/badges full)

## Shadows (RN 0.86 boxShadow)

- light: `0px 1px 2px rgba(30,34,48,0.06)` + elevation 1
- medium: `0px 2px 8px rgba(30,34,48,0.10)` + elevation 3
- strong: `0px 4px 16px rgba(30,34,48,0.14)` + elevation 6

## Componentes

- **AppButton**: primary (indigo), secondary (borda), danger, ghost. Height 48–52. Radius 12. Loading spinner.
- **AppInput**: borda 1px `border`, foco `primary`, label `text-secondary` 13, erro `danger`.
- **AppCard**: surface, radius 12, borda 1px `border` + shadow light. NUNCA gradiente.
- **StatusBadge**: pill, fundo soft + texto forte (success/warning/danger/info).
- **EmptyState**: ícone em círculo soft + título bold + descrição + ação.
- **ScreenContainer**: bg `#F7F7F8`, SafeArea, padding 16.

## Regras

1. Contraste: texto ≥4.5:1 (nunca cinza-claro sobre branco)
2. 1 ação primária por tela
3. Touch target ≥44px
4. NUNCA gradiente em cards/botões
5. NUNCA "em desenvolvimento" — empty state instrutivo
6. Status = badge com cor + texto
7. R$ via Intl.NumberFormat pt-BR