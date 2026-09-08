import React from 'react';
import { useCompanyFeatures } from '../../services/api/companyFeatures';

/**
 * Gate de feature para o SmartGesso Mobile.
 *
 * - Se a feature estiver habilitada, renderiza `children`.
 * - Caso contrário, renderiza `fallback` (ou null se não fornecido).
 * - Se `feature` for vazio/undefined, SEMPRE renderiza children
 *   (feature não é obrigatória — itens comuns não são gated).
 * - V5 ETAPA 7: enquanto carrega, em erro da query ou payload inesperado,
 *   renderiza children (fail-open — evita flicker de menu; o backend
 *   continua sendo a autoridade das features).
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
  // Hooks sempre executados (regra dos Hooks) — a decisão de gate é feita abaixo.
  const { data: features, isLoading, isError } = useCompanyFeatures();

  // Sem feature definida → sempre visível (não é um item feature-gated)
  if (!feature) {
    return <>{children}</>;
  }

  // V5 ETAPA 7 — fail-open: enquanto carrega OU em erro da query, mantém o
  // conteúdo visível (evita flicker; o backend segue sendo a autoridade).
  if (isLoading || isError) {
    return <>{children}</>;
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
