# SmartGesso — Design System

## Identidade (UI/UX Pro Max — "Soft UI Evolution")

Indigo vibrante sobre fundo indigo claro. Moderno, acessível (WCAG AA+), sombras aprimoradas.
Tipografia geométrica (Outfit/Work Sans — fallback System/sans-serif no RN).

## Palette

| Role | Hex | Uso |
|---|---|---|
| primary | `#6366F1` | Ações, links, foco, tab ativa |
| primary-dark | `#4F46E5` | Pressed/hover de ações |
| primary-light | `#818CF8` | Ícones secundários |
| primary-soft | `#EEF2FF` | Fundo de ícones/badges |
| secondary | `#818CF8` | Destaques secundários |
| background | `#F5F3FF` | Fundo do app (indigo claro) |
| surface | `#FFFFFF` | Cards, inputs, headers |
| text | `#312E81` | Texto principal (indigo profundo) |
| text-secondary | `#6D6A9E` | Texto secundário (≥4.5:1) |
| border | `#E0E7FF` | Bordas de cards/inputs |
| success | `#059669` | Pagamentos, ativo, concluído |
| warning | `#D97706` | Pendente, alerta |
| danger | `#DC2626` | Erro, cancelado |
| info | `#2563EB` | Informativo |

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

1. Contraste ≥4.5:1 (text #312E81 sobre bg #F5F3FF / surface)
2. 1 ação primária por tela · touch target ≥44px
3. NUNCA gradiente em cards/botões
4. NUNCA "em desenvolvimento" — empty state instrutivo
5. Status = badge com cor + texto
6. R$ via Intl.NumberFormat pt-BR