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
 *
 * ETAPA 17a — Acessibilidade: `accessibilityLabel` opcional é repassado ao
 * filho renderizado quando ele é um único elemento (ex.: um TouchableOpacity),
 * permitindo rotular botões protegidos por feature sem duplicar o wrapper.
 */
export interface FeatureGateProps {
  /** Nome da feature (ex.: 'production', 'inventory', 'purchases'). */
  feature: string;
  children: React.ReactNode;
  /** Conteúdo exibido quando a feature NÃO está habilitada. */
  fallback?: React.ReactNode;
  /** Rótulo de acessibilidade repassado ao filho renderizado (elemento único). */
  accessibilityLabel?: string;
}

function FeatureGate({
  feature,
  children,
  fallback = null,
  accessibilityLabel,
}: FeatureGateProps) {
  const { data: features, isLoading } = useCompanyFeatures();

  // Enquanto carrega, não renderiza nada (ou fallback)
  if (isLoading) {
    return <>{fallback}</>;
  }

  const isEnabled = features?.includes(feature) ?? false;
  const content = isEnabled ? children : fallback;

  // Repassa o rótulo ao filho quando é um único elemento (não Fragment),
  // sem adicionar wrappers que quebram layout/estilos.
  if (
    accessibilityLabel &&
    React.isValidElement(content) &&
    content.type !== React.Fragment
  ) {
    return React.cloneElement(
      content as React.ReactElement<{ accessibilityLabel?: string }>,
      { accessibilityLabel },
    );
  }

  return <>{content}</>;
}

export default FeatureGate;
export { FeatureGate };