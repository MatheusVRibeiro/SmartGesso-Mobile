import { useEffect, useState } from 'react';

/**
 * Retorna o valor atualizado somente após `delayMs` sem mudanças.
 * Usado para debounce de busca em listas (TanStack Query).
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}