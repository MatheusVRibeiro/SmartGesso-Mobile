import { useEffect } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { SecureTokenStorage } from '../services/auth/SecureTokenStorage';
import { authService } from '../services/api/auth';

/**
 * Bootstrap da sessão: roda uma vez no mount.
 *
 * - Sem token → clearSession (unauthenticated → login)
 * - Com token → GET /auth/me → setSession (authenticated → tabs)
 * - me() falha (401/expirado) → clearSession (login)
 */
export function useSessionBootstrap() {
  const setSession = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const accessToken = await SecureTokenStorage.getAccessToken();
        if (!accessToken) {
          if (!cancelled) clearSession();
          return;
        }

        const user = await authService.me();
        if (!cancelled) setSession(user);
      } catch {
        // Token inválido/expirado ou rede — limpa e vai para login
        await SecureTokenStorage.clearTokens().catch(() => {});
        if (!cancelled) clearSession();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSession, clearSession]);
}