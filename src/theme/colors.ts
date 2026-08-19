/**
 * SmartGesso Mobile — Tokens de cor.
 *
 * UI/UX Pro Max — "Soft UI Evolution" (indigo vibrante + fundo indigo claro).
 * WCAG AA+, melhor contraste, sombras aprimoradas.
 */
export const colors = {
  // Marca — indigo vibrante
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  primarySoft: '#EEF2FF',

  // Secundária / destaque
  secondary: '#818CF8',
  secondaryDark: '#6366F1',
  secondaryLight: '#A5B4FC',

  // Semânticos
  success: '#059669',
  successSoft: '#E7F6F0',
  danger: '#DC2626',
  dangerSoft: '#FDECEC',
  /** Alias de compatibilidade — usa o mesmo valor que `danger`. */
  error: '#DC2626',
  warning: '#D97706',
  warningSoft: '#FDF1E3',
  info: '#2563EB',
  infoSoft: '#E8F0FE',

  // Fundos e superfícies (indigo claro — Soft UI Evolution)
  background: '#F5F3FF',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Texto (indigo profundo)
  text: '#312E81',
  textSecondary: '#6D6A9E',
  textLight: '#9B98C4',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Bordas e divisores (indigo claro)
  border: '#E0E7FF',
  divider: '#EDF0FA',

  // Inputs
  inputBackground: '#FFFFFF',
  inputBorder: '#D4D9F5',
  inputFocus: '#6366F1',

  // Estados desabilitados
  disabled: '#C7C9E8',
  disabledBackground: '#EDF0FA',
  disabledText: '#9B98C4',

  // Utilitários
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  focusRing: 'rgba(99, 102, 241, 0.12)',
  overlay: 'rgba(49, 46, 129, 0.55)',
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;