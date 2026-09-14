import { getApiClient } from './client';
import type { FinancialSummary } from '../../types/financialSummary';

function api() {
  return getApiClient();
}

/** Módulo tipado de resumo financeiro por ordem de serviço (Fase 6). */
export const financialSummaryService = {
  /** GET /service-orders/:id/financial-summary — resumo financeiro de uma OS. */
  async getFinancialSummary(serviceOrderId: string): Promise<FinancialSummary> {
    const response = await api().get<FinancialSummary>(
      `/service-orders/${serviceOrderId}/financial-summary`,
    );
    return response.data;
  },
};
