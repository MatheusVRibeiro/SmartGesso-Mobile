import { getApiClient } from './client';
import type {
  ApproveQuoteResponse,
  ConvertToServiceResult,
  Quote,
  QuoteSummary,
  CreateQuoteInput,
  UpdateQuoteInput,
} from '../../types/quote';

function api() {
  return getApiClient();
}

/** Módulo tipado de orçamentos (Fase 4). */
export const quotesService = {
  /** GET /quotes */
  async list(): Promise<QuoteSummary[]> {
    const response = await api().get<QuoteSummary[]>('/quotes');
    return response.data;
  },

  /** GET /quotes/:id */
  async getById(id: string): Promise<Quote> {
    const response = await api().get<Quote>(`/quotes/${id}`);
    return response.data;
  },

  /** POST /quotes */
  async create(data: CreateQuoteInput): Promise<Quote> {
    const response = await api().post<Quote>('/quotes', data);
    return response.data;
  },

  /** PATCH /quotes/:id */
  async update(id: string, data: UpdateQuoteInput): Promise<Quote> {
    const response = await api().patch<Quote>(`/quotes/${id}`, data);
    return response.data;
  },

  /** DELETE /quotes/:id (soft delete) */
  async remove(id: string): Promise<void> {
    await api().delete(`/quotes/${id}`);
  },

  /** POST /quotes/:id/version — gera nova versão */
  async generateVersion(id: string): Promise<Quote> {
    const response = await api().post<Quote>(`/quotes/${id}/version`);
    return response.data;
  },

  /** POST /quotes/:id/approve — aprova o orçamento (status APROVADO) e retorna serviço. */
  async approve(id: string): Promise<ApproveQuoteResponse> {
    const response = await api().post<ApproveQuoteResponse>(`/quotes/${id}/approve`);
    return response.data;
  },

  /** POST /quotes/:id/reject — rejeita o orçamento, com nota opcional. */
  async reject(id: string, note?: string): Promise<Quote> {
    const response = await api().post<Quote>(`/quotes/${id}/reject`, { note });
    return response.data;
  },

  /** POST /quotes/:id/duplicate — duplica o orçamento (novo RASCUNHO). */
  async duplicate(id: string): Promise<Quote> {
    const response = await api().post<Quote>(`/quotes/${id}/duplicate`);
    return response.data;
  },

  /** POST /quotes/:id/convert-to-service — converte orçamento aprovado em OS. */
  async convertToService(id: string): Promise<ConvertToServiceResult> {
    const response = await api().post<ConvertToServiceResult>(
      `/quotes/${id}/convert-to-service`
    );
    return response.data;
  },

  /** POST /quotes/:id/pdf — retorna blob do PDF */
  async getPdf(id: string): Promise<Blob> {
    const response = await api().get<Blob>(`/quotes/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  /** POST /quotes/:id/share — gera link público de aprovação. */
  async share(id: string): Promise<{ publicToken: string; url: string }> {
    const response = await api().post<{ publicToken: string; url: string }>(
      `/quotes/${id}/share`,
    );
    return response.data;
  },
};