/**
 * SmartGesso Mobile — Tokens de cor.
 *
 * Design System gerado por ui-ux-pro-max (Enterprise SaaS Mobile):
 * - Light: Indigo Enterprise (#1E40AF primary) + Green profit accent
 * - Dark: Linear Dark (cinzas neutros #1A1B1E, indigo suave #5E6AD2)
 * Contraste WCAG AA+ em ambos os modos.
 */
export const colors = {
  // Marca — Indigo Enterprise (ui-ux-pro-max)
  primary: '#1E40AF',
  primaryDark: '#1E3A8A',
  primaryLight: '#3B82F6',
  primarySoft: '#EFF6FF',

  // Secundária — Blue
  secondary: '#3B82F6',
  secondaryDark: '#2563EB',
  secondaryLight: '#60A5FA',

  // Semânticos
  success: '#059669',
  successSoft: '#ECFDF5',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  /** Alias de compatibilidade */
  error: '#DC2626',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',

  // Fundos e superfícies (Light)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Texto (Slate Escuro — contraste 4.5:1+)
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Bordas e divisores
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Inputs
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputFocus: '#1E40AF',

  // Estados desabilitados
  disabled: '#94A3B8',
  disabledBackground: '#F1F5F9',
  disabledText: '#64748B',

  // Utilitários
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  focusRing: 'rgba(30, 64, 175, 0.15)',
  overlay: 'rgba(15, 23, 42, 0.55)',

  // ─── Dark Mode (Linear Dark — ui-ux-pro-max) ─────────────────────────
  dark: {
    primary: '#5E6AD2',
    primaryDark: '#4C55B0',
    primaryLight: '#8B93E6',
    primarySoft: 'rgba(94, 106, 210, 0.12)',
    secondary: '#5E6AD2',
    secondaryDark: '#4C55B0',
    secondaryLight: '#8B93E6',
    success: '#5FA58C',
    successSoft: 'rgba(95, 165, 140, 0.12)',
    danger: '#F07171',
    dangerSoft: 'rgba(240, 113, 113, 0.12)',
    error: '#F07171',
    warning: '#F5C366',
    warningSoft: 'rgba(245, 195, 102, 0.12)',
    info: '#5E6AD2',
    infoSoft: 'rgba(94, 106, 210, 0.12)',
    background: '#1A1B1E',
    surface: '#222326',
    card: '#222326',
    text: '#F7F8F8',
    textSecondary: '#A6A8AC',
    textLight: '#76787D',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    border: '#2E2F33',
    divider: '#2A2B2F',
    inputBackground: '#222326',
    inputBorder: '#3A3B3F',
    inputFocus: '#5E6AD2',
    disabled: '#76787D',
    disabledBackground: '#2A2B2F',
    disabledText: '#76787D',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    focusRing: 'rgba(94, 106, 210, 0.25)',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;
export type DarkColors = typeof colors.dark;
