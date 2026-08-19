/**
 * SmartGesso Mobile — Tokens de raio (cantos arredondados).
 * Escala refinada do design system indigo.
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;
