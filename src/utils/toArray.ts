/**
 * Normalizes API list responses into a guaranteed array.
 *
 * Legacy contract inconsistency: some endpoints return a raw array while
 * others wrap the list in `{ data: [...] }`. `toArray` accepts either shape
 * and always returns a safe array.
 */
export function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}
