import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient compartilhado entre toda a aplicação.
 * Usado no QueryClientProvider (app/_layout.tsx) e no logout
 * para limpar o cache de queries entre sessões.
 */
export const queryClient = new QueryClient();
