/**
 * SmartGesso Mobile — Tokens de cor.
 *
 * Paleta "Obra profissional": indigo de confiança sobre concreto claro.
 * Referência: DESIGN.md (oklch → hex).
 */
export const colors = {
  // Marca — indigo
  primary: '#4338CA',
  primaryDark: '#3730A3',
  primaryLight: '#6366F1',
  primarySoft: '#EEF0FF',

  // Secundária / destaque
  secondary: '#D97706',
  secondaryDark: '#B45309',
  secondaryLight: '#F59E0B',

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

  // Fundos e superfícies (neutro azulado, NÃO cream)
  background: '#F7F7F8',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Texto
  text: '#1E2230',
  textSecondary: '#5A6172',
  textLight: '#8A90A0',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Bordas e divisores
  border: '#E2E4EA',
  divider: '#EDEFF3',

  // Inputs
  inputBackground: '#FFFFFF',
  inputBorder: '#D8DBE2',
  inputFocus: '#4338CA',

  // Estados desabilitados
  disabled: '#C8CBD4',
  disabledBackground: '#EDEFF3',
  disabledText: '#9BA0AC',

  // Utilitários
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(30, 34, 48, 0.55)',
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;