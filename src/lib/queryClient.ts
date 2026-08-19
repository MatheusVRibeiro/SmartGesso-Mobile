import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient compartilhado entre toda a aplicação.
 * Usado no QueryClientProvider (app/_layout.tsx) e no logout
 * para limpar o cache de queries entre sessões.
 *
 * V3 — seção 66 (offline): `retry: 2` garante que queries falhas
 * por instabilidade de rede são reexecutadas automaticamente antes
 * de exibir erro ao usuário.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
    },
  },
});