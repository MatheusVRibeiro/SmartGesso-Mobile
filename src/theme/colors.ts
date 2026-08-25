/**
 * SmartGesso Mobile — Tokens de cor.
 *
 * Design System Moderno & Limpo (Clean Slate + Tech Blue).
 * Alta legibilidade, contraste WCAG AA+, visual profissional para SaaS de Construção.
 */
export const colors = {
  // Marca — Tech Blue moderno
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  primarySoft: '#EFF6FF',

  // Secundária — Sky Blue
  secondary: '#0EA5E9',
  secondaryDark: '#0284C7',
  secondaryLight: '#38BDF8',

  // Semânticos
  success: '#10B981',
  successSoft: '#ECFDF5',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  /** Alias de compatibilidade */
  error: '#EF4444',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',

  // Fundos e superfícies (Clean Slate - Neutro e elegante)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Texto (Slate Escuro - Excelente contraste)
  text: '#0F172A',
  textSecondary: '#475569',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Bordas e divisores
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Inputs
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputFocus: '#2563EB',

  // Estados desabilitados
  disabled: '#94A3B8',
  disabledBackground: '#F1F5F9',
  disabledText: '#64748B',

  // Utilitários
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  focusRing: 'rgba(37, 99, 235, 0.12)',
  overlay: 'rgba(15, 23, 42, 0.55)',
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;
