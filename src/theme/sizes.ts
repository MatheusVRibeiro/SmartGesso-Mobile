/**
 * SmartGesso Mobile — Tokens de tamanho (dimensões fixas de UI).
 */
export const sizes = {
  /** Área de toque mínima recomendada (WCAG / diretrizes mobile). */
  touchTarget: 44,
  /** Altura padrão de inputs. */
  inputHeight: 48,
  /** Alturas de botão por tamanho. */
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  /** Tamanhos de ícone. */
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  /** Padding horizontal padrão de telas. */
  screenPadding: 16,
  /** Largura máxima de conteúdo em telas largas (tablets). */
  maxContentWidth: 600,
} as const;

export type Sizes = typeof sizes;