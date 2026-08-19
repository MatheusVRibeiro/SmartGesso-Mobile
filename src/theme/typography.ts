import { Platform } from 'react-native';

/**
 * SmartGesso Mobile — Tokens de tipografia.
 * UI/UX Pro Max — Outfit / Work Sans (geométrica, moderna).
 * Sem fonte custom instalada → fallback para System/sans-serif com pesos corretos.
 */
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 32,
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
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

export type Typography = typeof typography;
export type TypographySize = keyof Typography['sizes'];
export type TypographyWeight = keyof Typography['weights'];