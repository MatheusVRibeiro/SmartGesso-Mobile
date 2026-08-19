/**
 * SmartGesso Mobile — Tokens de raio (cantos arredondados).
 * Referência: DESIGN.md (cards ≤16, pills/badges full).
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
