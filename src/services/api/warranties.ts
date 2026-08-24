import { getApiClient } from './client';
import type {
  ServiceWarranty,
  ServiceWarrantyListResponse,
  CreateWarrantyInput,
  UpdateWarrantyStatusInput,
  ServiceReturn,
  ServiceReturnListResponse,
  CreateReturnInput,
  UpdateReturnStatusInput,
} from '../../types/warranty';

function api() {
  return getApiClient();
}

/** Módulo tipado de Garantia/Retorno (ETAPA 13). */
export const warrantiesService = {
  /** GET /service-warranties/service-orders/:id/warranty — lista garantias. */
  async listWarranties(serviceOrderId: string): Promise<ServiceWarrantyListResponse> {
    const response = await api().get<ServiceWarrantyListResponse>(
      `/service-warranties/service-orders/${serviceOrderId}/warranty`,
    );
    return response.data;
  },

  /** POST /service-warranties/service-orders/:id/warranty — cria garantia. */
  async createWarranty(serviceOrderId: string, data: CreateWarrantyInput): Promise<ServiceWarranty> {
    const response = await api().post<ServiceWarranty>(
      `/service-warranties/service-orders/${serviceOrderId}/warranty`,
      data,
    );
    return response.data;
  },

  /** PATCH /service-warranties/service-warranties/:id/status — atualiza status. */
  async updateWarrantyStatus(id: string, status: UpdateWarrantyStatusInput['status']): Promise<ServiceWarranty> {
    const response = await api().patch<ServiceWarranty>(
      `/service-warranties/service-warranties/${id}/status`,
      { status },
    );
    return response.data;
  },

  /** GET /service-warranties/service-orders/:id/returns — lista retornos. */
  async listReturns(serviceOrderId: string): Promise<ServiceReturnListResponse> {
    const response = await api().get<ServiceReturnListResponse>(
      `/service-warranties/service-orders/${serviceOrderId}/returns`,
    );
    return response.data;
  },

  /** POST /service-warranties/service-orders/:id/returns — cria retorno. */
  async createReturn(serviceOrderId: string, data: CreateReturnInput): Promise<ServiceReturn> {
    const response = await api().post<ServiceReturn>(
      `/service-warranties/service-orders/${serviceOrderId}/returns`,
      data,
    );
    return response.data;
  },

  /** PATCH /service-warranties/service-returns/:id/status — atualiza status retorno. */
  async updateReturnStatus(
    id: string,
    status: UpdateReturnStatusInput['status'],
    resolutionNote?: string,
  ): Promise<ServiceReturn> {
    const response = await api().patch<ServiceReturn>(
      `/service-warranties/service-returns/${id}/status`,
      { status, resolutionNote },
    );
    return response.data;
  },
};
