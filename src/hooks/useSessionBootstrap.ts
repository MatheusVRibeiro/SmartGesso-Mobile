import { useEffect } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { SecureTokenStorage } from '../services/auth/SecureTokenStorage';
import { authService } from '../services/api/auth';
import { companyMembersService } from '../services/api/companyMembers';

/**
 * Bootstrap da sessão: roda uma vez no mount.
 *
 * - Sem token → clearSession (unauthenticated → login)
 * - Com token → GET /auth/me → setSession (authenticated → tabs)
 * - Com activeCompanyId → GET /company/permissions → setPermissions + setRole
 *   (V5: falha ⇒ permissions=[] e role=null — estado unknown, NUNCA owner)
 * - me() falha (401/expirado) → clearSession (login)
 */
export function useSessionBootstrap() {
  const setSession = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const setPermissions = useSessionStore((s) => s.setPermissions);
  const setRole = useSessionStore((s) => s.setRole);

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
        if (cancelled) return;

        // Se temCompanyId ativo, buscar empresas e setar a empresa ativa
        if (user.activeCompanyId) {
          try {
            const companies = await authService.companies();
            if (cancelled) return;
            const matched = companies.find(
              (c) => c.company.id === user.activeCompanyId,
            );
            setSession(user, matched ?? null);
          } catch {
            setSession(user);
          }

          // Permissões reais da empresa ativa (V5 — sem fallback COMPANY_OWNER)
          try {
            const { role, permissions } =
              await companyMembersService.getPermissions();
            if (cancelled) return;
            setPermissions(permissions);
            setRole(role);
          } catch {
            if (cancelled) return;
            // Falha ⇒ estado unknown: nada liberado por permissão/role
            setPermissions([]);
            setRole(null);
          }
        } else {
          setSession(user);
        }
      } catch {
        // Token inválido/expirado ou rede — limpa e vai para login
        await SecureTokenStorage.clearTokens().catch(() => {});
        if (!cancelled) clearSession();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSession, clearSession, setPermissions, setRole]);
}
