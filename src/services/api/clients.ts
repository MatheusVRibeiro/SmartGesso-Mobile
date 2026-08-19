import { getApiClient } from './client';
import type {
  Client,
  ClientListResponse,
  CreateClientInput,
  UpdateClientInput,
} from '../../types/client';

function api() {
  return getApiClient();
}

/** Mapeia address aninhado (mobile) → campos flat (API/Prisma). */
function flattenAddress(data: CreateClientInput) {
  const { address, ...rest } = data;
  if (!address) return rest;
  return {
    ...rest,
    postalCode: address.zipCode || undefined,
    street: address.street || undefined,
    number: address.number || undefined,
    complement: address.complement || undefined,
    district: address.neighborhood || undefined,
    city: address.city || undefined,
    state: address.state || undefined,
  };
}

/** Módulo tipado de clientes (Fase 2). */
export const clientsService = {
  /** GET /clients?search=&page=&limit= */
  async list(params?: { search?: string; page?: number; limit?: number }): Promise<ClientListResponse> {
    const response = await api().get<ClientListResponse>('/clients', { params });
    return response.data;
  },

  /** GET /clients/:id */
  async getById(id: string): Promise<Client> {
    const response = await api().get<Client>(`/clients/${id}`);
    return response.data;
  },

  /** POST /clients */
  async create(data: CreateClientInput): Promise<Client> {
    const body = flattenAddress(data);
    const response = await api().post<Client>('/clients', body);
    return response.data;
  },

  /** PATCH /clients/:id */
  async update(id: string, data: UpdateClientInput): Promise<Client> {
    const body = flattenAddress(data as CreateClientInput);
    const response = await api().patch<Client>(`/clients/${id}`, body);
    return response.data;
  },

  /** DELETE /clients/:id (soft delete) */
  async remove(id: string): Promise<void> {
    await api().delete(`/clients/${id}`);
  },
};
