import { getApiClient } from './client';
import type {
  ServiceOrder,
  ServiceOrderListResponse,
  ServiceOrderResult,
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
  RegisterServiceOrderResultInput,
} from '../../types/serviceOrder';

function api() {
  return getApiClient();
}

/** Módulo tipado de ordens de serviço (Fase 5). */
export const serviceOrdersService = {
  async list(params?: { search?: string; page?: number; limit?: number }): Promise<ServiceOrderListResponse> {
    const response = await api().get<ServiceOrderListResponse>('/service-orders', { params });
    return response.data;
  },

  async getById(id: string): Promise<ServiceOrder> {
    const response = await api().get<ServiceOrder>(`/service-orders/${id}`);
    return response.data;
  },

  async create(data: CreateServiceOrderInput): Promise<ServiceOrder> {
    const response = await api().post<ServiceOrder>('/service-orders', data);
    return response.data;
  },

  async update(id: string, data: UpdateServiceOrderInput): Promise<ServiceOrder> {
    const response = await api().patch<ServiceOrder>(`/service-orders/${id}`, data);
    return response.data;
  },

  /** Atualiza as etapas do serviço (V3 §33) — PATCH /service-orders/:id com etapas Json. */
  async updateEtapas(id: string, etapas: Record<string, boolean>): Promise<ServiceOrder> {
    const response = await api().patch<ServiceOrder>(`/service-orders/${id}`, { etapas });
    return response.data;
  },

  /** Define se o serviço exige produção (V3 §44) — PATCH /service-orders/:id. */
  async updateNeedsProduction(id: string, needsProduction: boolean): Promise<ServiceOrder> {
    const response = await api().patch<ServiceOrder>(`/service-orders/${id}`, { needsProduction });
    return response.data;
  },

  /** Registra o resultado financeiro (custo/venda) de uma OS — lucro/margem calculados pela API. */
  async registerResult(id: string, data: RegisterServiceOrderResultInput): Promise<ServiceOrder> {
    const response = await api().post<ServiceOrder>(`/service-orders/${id}/result`, data);
    return response.data;
  },

  /** Busca o resultado financeiro registrado de uma OS. */
  async getResult(id: string): Promise<ServiceOrderResult> {
    const response = await api().get<ServiceOrderResult>(`/service-orders/${id}/result`);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api().delete(`/service-orders/${id}`);
  },
};