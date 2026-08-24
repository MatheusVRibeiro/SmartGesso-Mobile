import { useQuery } from '@tanstack/react-query';
import { getApiClient } from './client';

export type EffectiveFeatures = string[];

/**
 * GET /companies/features
 * Returns the list of active feature keys for the current user's company.
 */
export async function getEffectiveFeatures(): Promise<EffectiveFeatures> {
  const client = getApiClient();
  const { data } = await client.get<EffectiveFeatures>('/companies/features');
  return data;
}

/**
 * React Query hook for company features.
 * Caches aggressively — features rarely change during a session.
 */
export function useCompanyFeatures() {
  return useQuery({
    queryKey: ['companyFeatures'],
    queryFn: getEffectiveFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
