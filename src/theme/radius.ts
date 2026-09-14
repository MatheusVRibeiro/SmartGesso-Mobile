/**
 * SmartGesso Mobile — Tokens de raio (cantos arredondados).
 * Design system Enterprise SaaS Mobile: cards 12pt, modais 16pt,
 * pill buttons 12pt (MASTER.md — "pill buttons or 12pt radius").
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;
