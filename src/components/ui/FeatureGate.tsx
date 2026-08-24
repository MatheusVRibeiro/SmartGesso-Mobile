import React from 'react';
import { useCompanyFeatures } from '../../services/api/companyFeatures';

/**
 * Gate de feature para o SmartGesso Mobile.
 *
 * - Se a feature estiver habilitada, renderiza `children`.
 * - Caso contrário, renderiza `fallback` (ou null se não fornecido).
 *
 * Uso:
 * <FeatureGate feature="production">
 *   <BotaoProducao />
 * </FeatureGate>
 */
export interface FeatureGateProps {
  /** Nome da feature (ex.: 'production', 'inventory', 'purchases'). */
  feature: string;
  children: React.ReactNode;
  /** Conteúdo exibido quando a feature NÃO está habilitada. */
  fallback?: React.ReactNode;
}

function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  const { data: features, isLoading } = useCompanyFeatures();

  // Enquanto carrega, não renderiza nada (ou fallback)
  if (isLoading) {
    return <>{fallback}</>;
  }

  const isEnabled = features?.includes(feature) ?? false;

  return <>{isEnabled ? children : fallback}</>;
}

export default FeatureGate;
export { FeatureGate };