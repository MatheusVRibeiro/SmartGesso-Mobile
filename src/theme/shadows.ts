import { ViewStyle } from 'react-native';

/**
 * SmartGesso Mobile — Tokens de sombra.
 * UI/UX Pro Max "Soft UI Evolution": sombras aprimoradas (mais suaves que flat,
 * mais definidas que neumorphism). RN 0.86 boxShadow + elevation Android.
 */
type ShadowStyle = Pick<ViewStyle, 'boxShadow' | 'elevation'>;

export const shadows: Record<'light' | 'medium' | 'strong', ShadowStyle> = {
  light: {
    boxShadow: '0px 1px 3px rgba(49, 46, 129, 0.08)',
    elevation: 1,
  },
  medium: {
    boxShadow: '0px 3px 10px rgba(49, 46, 129, 0.12)',
    elevation: 3,
  },
  strong: {
    boxShadow: '0px 6px 20px rgba(49, 46, 129, 0.16)',
    elevation: 6,
  },
} as const;

export type ShadowName = keyof typeof shadows;