import React from 'react';
import { useCompanyFeatures } from '../../../services/api/companyFeatures';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the availability of a feature.
 * If the feature is not in the company's feature list, it renders the fallback (default: null).
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { data: features, isLoading } = useCompanyFeatures();

  // While loading, we might want to show nothing to avoid flickering,
  // or we could show the content optimistically if we expect features to be enabled.
  // Here we choose to hide content while loading to be safe.
  if (isLoading) {
    return <>{null}</>;
  }

  if (!features || !features.includes(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
