import React from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { DEFAULT_COMPANY_PROFILE_ROLE } from '../../types/permissions';
import type { CompanyProfileRole } from '../../types/permissions';

/**
 * Gate de permissão por perfil (V3 — Usuários e Permissões).
 *
 * - `allow` ausente = qualquer perfil autenticado tem acesso.
 * - `deny` tem precedência sobre `allow`.
 * - Sem `fallback`, renderiza `null` quando o usuário não tem acesso.
 * - Se o usuário ainda não tem `role` (API ainda não expõe), usa
 *   COMPANY_OWNER como padrão — não quebra o fluxo atual.
 *
 * O mobile esconde recursos, mas o backend continua sendo a autoridade
 * definitiva das permissões.
 */
export interface PermissionGateProps {
  /** Perfis com acesso. Ausente = qualquer perfil. */
  allow?: readonly CompanyProfileRole[];
  /** Perfis sem acesso (tem precedência sobre `allow`). */
  deny?: readonly CompanyProfileRole[];
  children: React.ReactNode;
  /** Conteúdo exibido quando o usuário NÃO tem acesso (padrão: nada). */
  fallback?: React.ReactNode;
}

/**
 * Perfil do usuário atual (com fallback COMPANY_OWNER).
 * Útil para ajustes de layout condicionais além do gate declarativo.
 */
export function useCompanyRole(): CompanyProfileRole {
  const currentUser = useSessionStore((s) => s.currentUser);
  return currentUser?.role ?? DEFAULT_COMPANY_PROFILE_ROLE;
}

export function PermissionGate({
  allow,
  deny,
  children,
  fallback = null,
}: PermissionGateProps) {
  const role = useCompanyRole();

  const allowed = allow ? allow.includes(role) : true;
  const denied = deny ? deny.includes(role) : false;

  return <>{allowed && !denied ? children : fallback}</>;
}

export default PermissionGate;