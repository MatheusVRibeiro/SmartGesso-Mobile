import { useWindowDimensions } from 'react-native';

/**
 * Classe de tamanho da janela, seguindo as janelas de breakpoint do Material 3:
 *
 * - `compact`: largura < 600 dp (ex.: smartphones em retrato)
 * - `medium`: 600 ≤ largura < 840 dp (ex.: smartphones em paisagem, tablets pequenos)
 * - `expanded`: largura ≥ 840 dp (ex.: tablets, desktops/resizables)
 *
 * @see https://m3.material.io/foundations/adaptive-design/large-screens/overview
 */
export type SizeClass = 'compact' | 'medium' | 'expanded';

/**
 * Limiar (em dp) entre `compact` e `medium`.
 */
export const COMPACT_MAX_WIDTH = 600;

/**
 * Limiar (em dp) entre `medium` e `expanded`.
 */
export const EXPANDED_MIN_WIDTH = 840;

/**
 * Função PURA que classifica uma largura de janela (em dp) em uma `SizeClass`.
 *
 * Exportada separadamente dos hooks para permitir teste unitário
 * sem renderização de componentes React.
 *
 * Breakpoints (Material 3):
 * - `compact`: width < 600
 * - `medium`: 600 ≤ width < 840
 * - `expanded`: width ≥ 840
 *
 * @param width - Largura da janela em dp (useWindowDimensions().width)
 * @returns A classe de tamanho correspondente à largura informada
 */
export function getSizeClass(width: number): SizeClass {
  if (width >= EXPANDED_MIN_WIDTH) return 'expanded';
  if (width >= COMPACT_MAX_WIDTH) return 'medium';
  return 'compact';
}

/**
 * Hook que retorna a `SizeClass` atual da janela.
 *
 * Usa `useWindowDimensions().width` (reativo: recalcula em rotação,
 * split-screen e resize) e classifica via {@link getSizeClass}.
 *
 * ⚠️ Sem memoização manual: `width` muda raramente e a classificação é O(1).
 *
 * @returns A classe de tamanho atual: `'compact' | 'medium' | 'expanded'`
 */
export function useSizeClass(): SizeClass {
  const { width } = useWindowDimensions();
  return getSizeClass(width);
}

/**
 * Hook que seleciona um valor por classe de tamanho.
 *
 * @example
 * const colunas = useSizeClassValue({ compact: 1, medium: 2, expanded: 3 });
 *
 * @param values - Objeto com um valor obrigatório para cada `SizeClass`
 * @returns O valor correspondente à classe de tamanho atual
 */
export function useSizeClassValue<T>(values: Record<SizeClass, T>): T {
  return values[useSizeClass()];
}
