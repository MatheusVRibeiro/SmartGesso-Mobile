import { authService } from './auth';
import type { CompanyResult } from '../../types/company';

/**
 * Company convenience module.
 *
 * The real NestJS API only exposes company data through /auth/companies
 * (auth.service.ts → companies()). There is no standalone /companies
 * endpoint. This module wraps that endpoint with a familiar interface.
 */
export const companyService = {
  /**
   * GET /auth/companies — list all companies the user belongs to.
   * Delegates to authService.companies() since the API has no
   * dedicated /companies route.
   */
  async list(): Promise<CompanyResult[]> {
    return authService.companies();
  },

  /**
   * Get a specific company by ID.
   * Since the API does not expose a GET /companies/:id endpoint,
   * this fetches the full list and filters client-side.
   *
   * TODO: If a dedicated GET /companies/:id endpoint is added later,
   *       replace this implementation with a direct call.
   */
  async getById(id: string): Promise<CompanyResult | undefined> {
    const companies = await authService.companies();
    return companies.find((c) => c.company.id === id);
  },
};
