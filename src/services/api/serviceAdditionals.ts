import { getApiClient } from './client';
import type {
  ServiceAdditional,
  ServiceAdditionalListResponse,
  CreateAdditionalInput,
  ServiceAdditionalStatus,
} from '../../types/serviceAdditional';

function api() {
  return getApiClient();
}

/** Módulo tipado de aditivos de serviço (B9). */
export const serviceAdditionalsService = {
  /** GET /service-orders/:serviceOrderId/additionals — lista aditivos de uma OS. */
  async listAdditionals(
    serviceOrderId: string,
  ): Promise<ServiceAdditionalListResponse> {
    const response = await api().get<ServiceAdditionalListResponse>(
      `/service-orders/${serviceOrderId}/additionals`,
    );
    return response.data;
  },

  /** POST /service-orders/:serviceOrderId/additionals — cria um aditivo. */
  async createAdditional(
    serviceOrderId: string,
    data: CreateAdditionalInput,
  ): Promise<ServiceAdditional> {
    const response = await api().post<ServiceAdditional>(
      `/service-orders/${serviceOrderId}/additionals`,
      data,
    );
    return response.data;
  },

  /** PATCH /service-orders/:serviceOrderId/additionals/:id/status — atualiza status. */
  async updateAdditionalStatus(
    serviceOrderId: string,
    id: string,
    status: ServiceAdditionalStatus,
  ): Promise<ServiceAdditional> {
    const response = await api().patch<ServiceAdditional>(
      `/service-orders/${serviceOrderId}/additionals/${id}/status`,
      { status },
    );
    return response.data;
  },
};
