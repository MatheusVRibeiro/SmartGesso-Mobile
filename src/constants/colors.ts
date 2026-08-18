/**
 * Paleta de cores — compatibilidade.
 *
 * A fonte canônica agora é `src/theme/colors.ts` (design system).
 * Este arquivo re-exporta os tokens do tema para não quebrar imports existentes.
 */
export { colors } from '../theme/colors';
export type { Colors } from '../theme/colors';