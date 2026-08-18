/**
 * SmartGesso Mobile — Tokens de borda (larguras).
 */
export const borders = {
  width: {
    thin: 1,
    regular: 2,
  },
} as const;

export type Borders = typeof borders;