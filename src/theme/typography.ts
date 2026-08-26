import { Platform } from 'react-native';

/**
 * SmartGesso Mobile — Tokens de tipografia.
 * Design system Enterprise SaaS Mobile (ui-ux-pro-max) — Plus Jakarta Sans.
 * A fonte real (Plus Jakarta Sans) virá via expo-font (loadAsync + useFonts);
 * até lá usamos fallback System (iOS) / sans-serif (Android) com pesos corretos.
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
  // Fallback até a fonte Plus Jakarta Sans ser carregada via expo-font.
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
