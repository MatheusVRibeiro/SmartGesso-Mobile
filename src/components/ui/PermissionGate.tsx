import React from 'react';
import { useSessionStore } from '../../store/useSessionStore';

/**
 * Gate de permissão para o SmartGesso Mobile.
 *
 * - Se `hasPermission` for fornecido, seu valor é usado diretamente.
 * - Caso contrário, permite acesso (a API é a autoridade definitiva das permissões).
 *
 * O mobile pode esconder ou desabilitar recursos, mas nunca substituir
 * a validação do backend.
 */
export interface PermissionGateProps {
  /** Nome da permissão (ex.: 'users:manage'). */
  permission: string;
  children: React.ReactNode;
  /**
   * Sobrescreve a checagem.
   * Se undefined, permite acesso (API valida no backend).
   */
  hasPermission?: boolean;
  /** Conteúdo exibido quando o usuário NÃO possui a permissão. */
  fallback?: React.ReactNode;
}

function PermissionGate({
  permission: _permission,
  children,
  hasPermission,
  fallback = null,
}: PermissionGateProps) {
  // A API é a autoridade definitiva. Se hasPermission não for fornecido,
  // permite acesso (o backend bloqueia se necessário).
  const currentUser = useSessionStore((s) => s.currentUser);
  const allowed = hasPermission ?? (currentUser != null);

  return <>{allowed ? children : fallback}</>;
}

export default PermissionGate;
export { PermissionGate };