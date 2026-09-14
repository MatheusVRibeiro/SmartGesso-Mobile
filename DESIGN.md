# SmartGesso — Design System

## Identidade (UI/UX Pro Max — "Soft UI Evolution")

Indigo Enterprise sobre fundo neutro claro (com dark mode "Linear Dark"). Moderno, acessível (WCAG AA em light e dark), sombras aprimoradas.
Tipografia geométrica (Outfit/Work Sans — fallback System/sans-serif no RN).

## Palette

| Role | Hex (light / dark) | Uso |
|---|---|---|
| primary | `#1E40AF` / `#5E6AD2` | Ações, links, foco, tab ativa |
| primary-dark | `#1E3A8A` / `#4C55B0` | Pressed/hover de ações |
| primary-light | `#3B82F6` / `#8B93E6` | Ícones secundários |
| primary-soft | `#EFF6FF` / `rgba(94,106,210,0.12)` | Fundo de ícones/badges |
| secondary | `#3B82F6` / `#5E6AD2` | Destaques secundários |
| background | `#F8FAFC` / `#1A1B1E` | Fundo do app |
| surface | `#FFFFFF` / `#222326` | Cards, inputs, headers |
| text | `#0F172A` / `#F7F8F8` | Texto principal |
| text-secondary | `#64748B` / `#A6A8AC` | Texto secundário (≥4.5:1) |
| text-light | `#66707D` / `#9CA3AF` | Hints, metadados (contraste >=4.5:1 verificado — WCAG AA) |
| border | `#E2E8F0` / `#2E2F33` | Bordas de cards/inputs |
| success | `#059669` / `#5FA58C` | Pagamentos, ativo, concluído |
| warning | `#D97706` / `#F5C366` | Pendente, alerta |
| danger | `#DC2626` / `#F07171` | Erro, cancelado |
| info | `#3B82F6` / `#5E6AD2` | Informativo |

## Typography

- **Display/Heading**: bold 24–32, letterSpacing -0.5
- **Body**: regular 15–16
- **Caption**: regular 13
- **Valores**: semibold 20–24 (destaque financeiro)

## Spacing (escala 4)

xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32 · 4xl 40 · 5xl 48

## Radius

sm 8 · md 12 · lg 16 · xl 24 · full 999

## Shadows (soft evolution)

- light: `0px 1px 3px rgba(49,46,129,0.08)` + elevation 1
- medium: `0px 3px 10px rgba(49,46,129,0.12)` + elevation 3
- strong: `0px 6px 20px rgba(49,46,129,0.16)` + elevation 6

## Regras

1. Contraste ≥4.5:1 (text #0F172A sobre bg #F8FAFC / surface — dark: #F7F8F8 sobre #1A1B1E)
2. 1 ação primária por tela · touch target ≥44px
3. NUNCA gradiente em cards/botões
4. NUNCA "em desenvolvimento" — empty state instrutivo
5. Status = badge com cor + texto
6. R$ via Intl.NumberFormat pt-BR