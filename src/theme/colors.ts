/**
 * SmartGesso Mobile — Tokens de cor (fonte canônica do design system).
 *
 * Paleta obrigatória definida no prompt mestre (seção 14 — identidade visual).
 * Este arquivo é o superset de `src/constants/colors.ts` (que re-exporta daqui).
 */
export const colors = {
  // Marca
  primary: '#0B5ED7',
  primaryDark: '#084298',
  primaryLight: '#3D8BFD',

  // Secundária / destaque
  secondary: '#F59E0B',
  secondaryDark: '#B45309',
  secondaryLight: '#FBBF24',

  // Semânticos
  success: '#16A34A',
  danger: '#DC2626',
  /** Alias de compatibilidade — usa o mesmo valor que `danger`. */
  error: '#DC2626',
  warning: '#D97706',
  info: '#0B5ED7',

  // Fundos e superfícies
  background: '#F7F9FC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Texto
  text: '#172033',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Bordas e divisores
  border: '#E2E8F0',
  divider: '#EEF2F7',

  // Inputs
  inputBackground: '#F1F5F9',
  inputBorder: '#E2E8F0',
  inputFocus: '#0B5ED7',

  // Estados desabilitados
  disabled: '#CBD5E1',
  disabledBackground: '#E2E8F0',
  disabledText: '#94A3B8',

  // Utilitários
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(23, 32, 51, 0.55)',
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;