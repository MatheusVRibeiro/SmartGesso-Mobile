/**
 * SmartGesso Mobile — Tokens de raio (cantos arredondados).
 */
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;