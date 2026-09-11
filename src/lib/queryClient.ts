import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient compartilhado entre toda a aplicação.
 * Usado no QueryClientProvider (app/_layout.tsx) e no logout
 * para limpar o cache de queries entre sessões.
 *
 * V3 — seção 66 (offline): `retry: 2` garante que queries falhas
 * por instabilidade de rede são reexecutadas automaticamente antes
 * de exibir erro ao usuário.
 *
 * ETAPA 17a — Performance: `staleTime: 30_000` evita refetch desnecessário
 * ao alternar entre telas/abas (dados considerados frescos por 30s).
 * `gcTime` explícito (default do TanStack Query, 5min) documenta a política
 * de retenção de queries inativas em cache.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});