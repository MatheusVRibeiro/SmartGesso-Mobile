import { useState, useEffect, useCallback } from 'react';
import { getPendingCount, getPendingMutations } from '../services/offline/syncQueue';
import { startSyncListener } from '../services/offline/processor';
import { PendingMutation } from '../services/offline/syncQueue';

export interface PendingMutationsState {
  count: number;
  mutations: PendingMutation[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook para monitorar mutações pendentes na fila offline.
 * 
 * Retorna a contagem de pendências, a lista de mutações
 * e funções para atualizar os dados.
 */
export function usePendingMutations(): PendingMutationsState {
  const [count, setCount] = useState(0);
  const [mutations, setMutations] = useState<PendingMutation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pendingCount, pendingMutations] = await Promise.all([
        getPendingCount(),
        getPendingMutations(),
      ]);
      
      setCount(pendingCount);
      setMutations(pendingMutations);
    } catch (error) {
      console.error('[usePendingMutations] Erro ao buscar pendências:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega dados iniciais
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Inicia listener de sincronização
  useEffect(() => {
    const unsubscribe = startSyncListener();
    
    // Atualiza a contagem periodicamente
    const interval = setInterval(() => {
      refresh();
    }, 5000); // A cada 5 segundos
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refresh]);

  return {
    count,
    mutations,
    isLoading,
    refresh,
  };
}
