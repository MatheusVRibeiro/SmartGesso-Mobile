import { Platform } from 'react-native';

/**
 * SmartGesso Mobile — Tokens de tipografia.
 * Escala, pesos e família padrão do sistema.
 */
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
} as const;

export type Typography = typeof typography;
export type TypographySize = keyof Typography['sizes'];
export type TypographyWeight = keyof Typography['weights'];