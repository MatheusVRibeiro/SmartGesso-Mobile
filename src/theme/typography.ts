import { Platform } from 'react-native';

/**
 * SmartGesso Mobile — Tokens de tipografia.
 * UI/UX Pro Max — Plus Jakarta Sans (enterprise, moderna, legível).
 * Sem fonte custom instalada → fallback System/sans-serif com pesos corretos.
 * TODO: instalar Plus Jakarta Sans via @expo-google-fonts/plus-jakarta-sans
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
    extraBold: '800',
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