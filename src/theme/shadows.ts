import { ViewStyle } from 'react-native';

/**
 * SmartGesso Mobile — Tokens de sombra.
 *
 * RN 0.86 (New Architecture): as props `shadow*` foram deprecadas em favor
 * de `boxShadow` (string CSS-like). `elevation` continua para Android.
 * Referência: DESIGN.md.
 */
type ShadowStyle = Pick<ViewStyle, 'boxShadow' | 'elevation'>;

export const shadows: Record<'light' | 'medium' | 'strong', ShadowStyle> = {
  light: {
    boxShadow: '0px 1px 2px rgba(30, 34, 48, 0.06)',
    elevation: 1,
  },
  medium: {
    boxShadow: '0px 2px 8px rgba(30, 34, 48, 0.10)',
    elevation: 3,
  },
  strong: {
    boxShadow: '0px 4px 16px rgba(30, 34, 48, 0.14)',
    elevation: 6,
  },
} as const;
export type ShadowName = keyof typeof shadows;
