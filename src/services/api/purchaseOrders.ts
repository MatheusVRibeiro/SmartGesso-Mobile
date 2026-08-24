import { getApiClient } from './client';
import type {
  PurchaseOrder,
  PurchaseOrderListResponse,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderStatusInput,
} from '../../types/purchaseOrder';

function api() {
  return getApiClient();
}

/** Módulo tipado de pedidos de compra (B10). */
export const purchaseOrdersService = {
  /** GET /purchase-orders?search=&page=&limit= */
  async list(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PurchaseOrderListResponse> {
    const response = await api().get<PurchaseOrderListResponse>(
      '/purchase-orders',
      { params },
    );
    return response.data;
  },

  /** POST /purchase-orders */
  async create(data: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const response = await api().post<PurchaseOrder>('/purchase-orders', data);
    return response.data;
  },

  /** PATCH /purchase-orders/:id/status (RECEIVED) */
  async updateStatus(
    id: string,
    data: UpdatePurchaseOrderStatusInput,
  ): Promise<PurchaseOrder> {
    const response = await api().patch<PurchaseOrder>(
      `/purchase-orders/${id}/status`,
      data,
    );
    return response.data;
  },
};
