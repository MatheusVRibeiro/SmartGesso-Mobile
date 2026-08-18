import { getApiClient } from './client';
import type {
  ServiceOrder,
  ServiceOrderListResponse,
  CreateServiceOrderInput,
  UpdateServiceOrderInput,
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

  async remove(id: string): Promise<void> {
    await api().delete(`/service-orders/${id}`);
  },
};