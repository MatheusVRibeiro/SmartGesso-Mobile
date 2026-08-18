import { ViewStyle } from 'react-native';
import { colors } from './colors';

/**
 * SmartGesso Mobile — Tokens de sombra.
 * Inclui shadow* (iOS) e elevation (Android) no mesmo objeto,
 * o que é seguro: cada plataforma ignora as props da outra.
 */
type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows: Record<'light' | 'medium' | 'strong', ShadowStyle> = {
  light: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export type ShadowName = keyof typeof shadows;