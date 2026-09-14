import React from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { COMPANY_PROFILE_ROLES } from '../../types/permissions';
import type { CompanyProfileRole } from '../../types/permissions';

/**
 * Gate de permissão (V5 — princípio 17: nunca assumir COMPANY_OWNER).
 *
 * Modos de uso (combináveis):
 * - `permission` — código explícito (ex.: 'users:manage'); verificada contra
 *   `permissions` do store (populadas por GET /company/permissions no
 *   bootstrap da sessão).
 * - `allow`/`deny` por role — compatibilidade V3. `allow` ausente = qualquer
 *   role autenticado tem acesso; `deny` tem precedência sobre `allow`.
 * - Sem `fallback`, renderiza `null` quando o usuário não tem acesso.
 *
 * Estado unknown (role null / permissions vazias / fetch falhou):
 * - Com `permission`: só renderiza children se a permissão estiver na lista.
 *   Lista vazia ⇒ fallback (nada liberado por padrão).
 * - Com `allow`: role null não pertence a nenhuma lista ⇒ fallback.
 * - Sem `permission` nem `allow` (sem `deny`): renderiza children.
 *
 * O mobile esconde recursos, mas o backend continua sendo a autoridade
 * definitiva das permissões.
 */
export interface PermissionGateProps {
  /** Código de permissão explícito (ex.: 'users:manage'). */
  permission?: string;
  /** Perfis com acesso. Ausente = qualquer perfil conhecido. */
  allow?: readonly CompanyProfileRole[];
  /** Perfis sem acesso (tem precedência sobre `allow`). */
  deny?: readonly CompanyProfileRole[];
  children: React.ReactNode;
  /** Conteúdo exibido quando o usuário NÃO tem acesso (padrão: nada). */
  fallback?: React.ReactNode;
}

/**
 * Perfil do usuário atual (null = unknown — NUNCA assume COMPANY_OWNER).
 * Fontes: store.role (GET /company/permissions) e, como legado,
 * currentUser.role. String fora dos roles conhecidos ⇒ null (unknown ⇒ deny).
 * Útil para ajustes de layout condicionais além do gate declarativo.
 */
export function useCompanyRole(): CompanyProfileRole | null {
  const currentUser = useSessionStore((s) => s.currentUser);
  const role = useSessionStore((s) => s.role);
  const candidate = role ?? currentUser?.role ?? null;
  return COMPANY_PROFILE_ROLES.includes(candidate as CompanyProfileRole)
    ? (candidate as CompanyProfileRole)
    : null;
}

export function PermissionGate({
  permission,
  allow,
  deny,
  children,
  fallback = null,
}: PermissionGateProps) {
  const role = useCompanyRole();
  const permissions = useSessionStore((s) => s.permissions);

  if (permission != null) {
    const hasPermission = permissions.includes(permission);
    return <>{hasPermission ? children : fallback}</>;
  }

  const allowed = allow ? (role != null && allow.includes(role)) : true;
  // Role unknown não escapa de uma blocklist (deny): fail-closed (V5).
  const denied = deny ? (role == null || deny.includes(role)) : false;

  return <>{allowed && !denied ? children : fallback}</>;
}

export default PermissionGate;
