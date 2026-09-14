import { getApiClient } from './client';
import type {
  QuoteFollowUp,
  QuoteFollowUpCreateRequest,
  QuoteFollowUpUpdateRequest,
  QuoteFollowUpListResponse,
} from '../../types/followUp';

function api() {
  return getApiClient();
}

/** Módulo de follow-ups de orçamento. */
export const quoteFollowUpsService = {
  /** GET /quotes/:quoteId/follow-ups — lista follow-ups de um orçamento */
  async listByQuote(quoteId: string): Promise<QuoteFollowUpListResponse> {
    const response = await api().get<QuoteFollowUpListResponse>(`/quotes/${quoteId}/follow-ups`);
    return response.data;
  },

  /** GET /follow-ups/today — lista follow-ups pendentes do dia */
  async listToday(): Promise<QuoteFollowUp[]> {
    const response = await api().get<QuoteFollowUp[]>('/follow-ups/today');
    return response.data;
  },

  /** POST /quotes/:quoteId/follow-ups — cria novo follow-up */
  async create(quoteId: string, data: QuoteFollowUpCreateRequest): Promise<QuoteFollowUp> {
    const response = await api().post<QuoteFollowUp>(`/quotes/${quoteId}/follow-ups`, data);
    return response.data;
  },

  /** PATCH /quote-follow-ups/:id — atualiza follow-up (status, notas) */
  async update(id: string, data: QuoteFollowUpUpdateRequest): Promise<QuoteFollowUp> {
    const response = await api().patch<QuoteFollowUp>(`/quote-follow-ups/${id}`, data);
    return response.data;
  },
};