import { ViewStyle } from 'react-native';
import { colors } from './colors';

/**
 * SmartGesso Mobile — Tokens de sombra.
 *
 * RN 0.86 (New Architecture): as props `shadow*` foram deprecadas em favor
 * de `boxShadow` (string CSS-like). `elevation` continua para Android.
 */
type ShadowStyle = Pick<ViewStyle, 'boxShadow' | 'elevation'>;

export const shadows: Record<'light' | 'medium' | 'strong', ShadowStyle> = {
  light: {
    boxShadow: '0px 1px 4px rgba(23, 32, 51, 0.08)',
    elevation: 2,
  },
  medium: {
    boxShadow: '0px 2px 8px rgba(23, 32, 51, 0.12)',
    elevation: 4,
  },
  strong: {
    boxShadow: '0px 4px 16px rgba(23, 32, 51, 0.2)',
    elevation: 8,
  },
};

export type ShadowName = keyof typeof shadows;