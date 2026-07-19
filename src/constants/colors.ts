export const colors = {
  primary: '#1A73E8',
  primaryDark: '#1557B0',
  primaryLight: '#4A90D9',

  secondary: '#34A853',
  secondaryDark: '#2D8F47',

  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  textOnPrimary: '#FFFFFF',

  border: '#E0E0E0',
  divider: '#EEEEEE',

  error: '#D32F2F',
  warning: '#F57C00',
  success: '#388E3C',
  info: '#1976D2',

  inputBackground: '#F5F5F5',
  inputBorder: '#E0E0E0',
  inputFocus: '#1A73E8',

  disabled: '#9E9E9E',
  disabledBackground: '#E0E0E0',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
