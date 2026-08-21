import { useEffect, useState } from 'react';
import { getPendingCount } from '../services/offline/syncQueue';

/**
 * Hook que retorna a contagem de mutações pendentes na fila de sincronização.
 * Atualiza automaticamente quando a fila é modificada.
 */
export function usePendingMutationsCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadCount = async () => {
      try {
        const pendingCount = await getPendingCount();
        if (mounted) {
          setCount(pendingCount);
        }
      } catch (error) {
        console.error('[usePendingMutationsCount] Erro ao carregar contagem:', error);
      }
    };

    loadCount();

    // Verificar periodicamente a cada 5 segundos
    const interval = setInterval(loadCount, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return count;
}
