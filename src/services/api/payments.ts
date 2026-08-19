import { getApiClient } from './client';
import type {
  Payment,
  PaymentListResponse,
  CreatePaymentInput,
  UpdatePaymentInput,
} from '../../types/finance';

function api() {
  return getApiClient();
}

/** Módulo tipado de pagamentos/recebimentos (Fase 6). */
export const paymentsService = {
  async list(params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<PaymentListResponse> {
    const response = await api().get<PaymentListResponse>('/payments', { params });
    return response.data;
  },

  async getById(id: string): Promise<Payment> {
    const response = await api().get<Payment>(`/payments/${id}`);
    return response.data;
  },

  async create(data: CreatePaymentInput): Promise<Payment> {
    const response = await api().post<Payment>('/payments', data);
    return response.data;
  },

  async update(id: string, data: UpdatePaymentInput): Promise<Payment> {
    const response = await api().patch<Payment>(`/payments/${id}`, data);
    return response.data;
  },

  /** Recebe (confirma) uma parcela específica de um pagamento parcelado. */
  async payInstallment(paymentId: string, installmentId: string): Promise<Payment> {
    const response = await api().post<Payment>(
      `/payments/${paymentId}/installments/${installmentId}/pay`,
    );
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api().delete(`/payments/${id}`);
  },
};