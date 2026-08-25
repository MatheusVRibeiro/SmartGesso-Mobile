import React from 'react';
import { useCompanyFeatures } from '../../../services/api/companyFeatures';

interface FeatureGateProps {
  /** Nome da feature. Vazio/undefined = sem gate (sempre visível). */
  feature?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the availability of a feature.
 * If the feature is not in the company's feature list, it renders the fallback (default: null).
 * Feature vazio/undefined → sempre renderiza children (item não é feature-gated).
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  // Sem feature definida → sempre visível (itens comuns não são gated).
  if (!feature) {
    return <>{children}</>;
  }

  const { data: features, isLoading } = useCompanyFeatures();

  // While loading, we might want to show nothing to avoid flickering,
  // or we could show the content optimistically if we expect features to be enabled.
  // Here we choose to hide content while loading to be safe.
  if (isLoading) {
    return <>{null}</>;
  }

  const featureList = Array.isArray(features)
    ? features
    : (features && Array.isArray((features as any).features))
    ? (features as any).features
    : (features && Array.isArray((features as any).data))
    ? (features as any).data
    : [];

  if (!featureList.includes(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
