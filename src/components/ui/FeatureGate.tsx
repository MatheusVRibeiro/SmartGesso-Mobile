import React from 'react';
import { useCompanyFeatures } from '../../services/api/companyFeatures';

/**
 * Gate de feature para o SmartGesso Mobile.
 *
 * - Se a feature estiver habilitada, renderiza `children`.
 * - Caso contrário, renderiza `fallback` (ou null se não fornecido).
 * - Se `feature` for vazio/undefined, SEMPRE renderiza children
 *   (feature não é obrigatória — itens comuns não são gated).
 *
 * Uso:
 * <FeatureGate feature="production">
 *   <BotaoProducao />
 * </FeatureGate>
 * <FeatureGate>  (sem feature = sempre visível)
 *   <ItemComum />
 * </FeatureGate>
 */
export interface FeatureGateProps {
  /** Nome da feature (ex.: 'production', 'inventory', 'purchases'). Vazio = sem gate. */
  feature?: string;
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
  // Sem feature definida → sempre visível (não é um item feature-gated)
  if (!feature) {
    return <>{children}</>;
  }

  const { data: features, isLoading } = useCompanyFeatures();

  // Enquanto carrega, não renderiza nada (ou fallback)
  if (isLoading) {
    return <>{fallback}</>;
  }

  const featureList = Array.isArray(features)
    ? features
    : (features && Array.isArray((features as any).features))
    ? (features as any).features
    : (features && Array.isArray((features as any).data))
    ? (features as any).data
    : [];

  const isEnabled = featureList.includes(feature);
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
