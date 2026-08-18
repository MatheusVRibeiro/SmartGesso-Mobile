import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';

/**
 * Mapeamento simples de permissões por role.
 *
 * `admin` possui permissão universal ('*').
 * Para permissões granulares vindas da API, passe `hasPermission` diretamente.
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  admin: ['*'],
  company_admin: [
    'company:view',
    'company:manage',
    'users:view',
    'users:manage',
    'contracts:view',
    'contracts:manage',
    'installments:view',
    'installments:manage',
    'payments:view',
    'payments:manage',
    'reports:view',
  ],
  manager: [
    'company:view',
    'users:view',
    'contracts:view',
    'installments:view',
    'payments:view',
    'reports:view',
  ],
  employee: ['company:view', 'installments:view', 'payments:view'],
};

function roleHasPermission(role: UserRole, permission: string): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  if (allowed.includes('*')) {
    return true;
  }
  return allowed.includes(permission);
}

export interface PermissionGateProps {
  /** Nome da permissão (ex.: 'users:manage'). */
  permission: string;
  children: React.ReactNode;
  /**
   * Sobrescreve a checagem por role.
   * Se undefined, a checagem é feita pelo papel (role) do usuário autenticado.
   */
  hasPermission?: boolean;
  /** Conteúdo exibido quando o usuário NÃO possui a permissão. */
  fallback?: React.ReactNode;
}

/**
 * Gate de permissão baseado em papel (role) do usuário.
 *
 * - Se `hasPermission` for fornecido, seu valor é usado diretamente.
 * - Caso contrário, usa `useAuth()` para obter o `role` do usuário e verifica
 *   se a permissão está na lista de permissões do papel.
 *
 * ⚠️ Deve ser usado dentro de um `AuthProvider`.
 */
function PermissionGate({
  permission,
  children,
  hasPermission,
  fallback = null,
}: PermissionGateProps) {
  const { user } = useAuth();

  const allowed =
    hasPermission ?? (user ? roleHasPermission(user.role, permission) : false);

  return <>{allowed ? children : fallback}</>;
}

export default PermissionGate;
export { PermissionGate };