import { getApiClient } from './client';
import type {
  ProductionOrder,
  ProductionOrderListResponse,
  CreateProductionOrderInput,
  UpdateProductionOrderInput,
} from '../../types/serviceOrder';

function api() {
  return getApiClient();
}

/** Módulo tipado de ordens de produção (Fase 5). */
export const productionOrdersService = {
  async list(params?: { search?: string; page?: number; limit?: number }): Promise<ProductionOrderListResponse> {
    const response = await api().get<ProductionOrderListResponse>('/production-orders', { params });
    return response.data;
  },

  async getById(id: string): Promise<ProductionOrder> {
    const response = await api().get<ProductionOrder>(`/production-orders/${id}`);
    return response.data;
  },

  async create(data: CreateProductionOrderInput): Promise<ProductionOrder> {
    const response = await api().post<ProductionOrder>('/production-orders', data);
    return response.data;
  },

  async update(id: string, data: UpdateProductionOrderInput): Promise<ProductionOrder> {
    const response = await api().patch<ProductionOrder>(`/production-orders/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api().delete(`/production-orders/${id}`);
  },
};