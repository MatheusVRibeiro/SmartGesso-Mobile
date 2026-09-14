import { getApiClient } from './client';
import type {
  Supplier,
  SupplierListResponse,
  CreateSupplierInput,
  UpdateSupplierInput,
} from '../../types/supplier';

function api() {
  return getApiClient();
}

/** Módulo tipado de fornecedores (B10). */
export const suppliersService = {
  /** GET /suppliers?search=&page=&limit= */
  async list(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<SupplierListResponse> {
    const response = await api().get<SupplierListResponse>('/suppliers', {
      params,
    });
    return response.data;
  },

  /** POST /suppliers */
  async create(data: CreateSupplierInput): Promise<Supplier> {
    const response = await api().post<Supplier>('/suppliers', data);
    return response.data;
  },

  /** PATCH /suppliers/:id */
  async update(id: string, data: UpdateSupplierInput): Promise<Supplier> {
    const response = await api().patch<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },
};
