import { getApiClient } from './client';
import type {
  Product,
  ServiceItem,
  MaterialItem,
  CatalogListResponse,
  CreateCatalogItemInput,
  CreateMaterialInput,
  UpdateCatalogItemInput,
} from '../../types/catalog';

function api() {
  return getApiClient();
}

/** Módulo tipado de catálogo: produtos, serviços e materiais (Fase 2). */
export const catalogService = {
  // ─── Produtos ────────────────────────────────────────────────────────────
  async listProducts(params?: { search?: string; page?: number; limit?: number }): Promise<CatalogListResponse<Product>> {
    const response = await api().get<CatalogListResponse<Product>>('/catalog/products', { params });
    return response.data;
  },
  async createProduct(data: CreateCatalogItemInput): Promise<Product> {
    const response = await api().post<Product>('/catalog/products', data);
    return response.data;
  },
  async updateProduct(id: string, data: UpdateCatalogItemInput): Promise<Product> {
    const response = await api().patch<Product>(`/catalog/products/${id}`, data);
    return response.data;
  },
  async removeProduct(id: string): Promise<void> {
    await api().delete(`/catalog/products/${id}`);
  },

  // ─── Serviços ────────────────────────────────────────────────────────────
  async listServices(params?: { search?: string; page?: number; limit?: number }): Promise<CatalogListResponse<ServiceItem>> {
    const response = await api().get<CatalogListResponse<ServiceItem>>('/catalog/services', { params });
    return response.data;
  },
  async createService(data: CreateCatalogItemInput): Promise<ServiceItem> {
    const response = await api().post<ServiceItem>('/catalog/services', data);
    return response.data;
  },
  async updateService(id: string, data: UpdateCatalogItemInput): Promise<ServiceItem> {
    const response = await api().patch<ServiceItem>(`/catalog/services/${id}`, data);
    return response.data;
  },
  async removeService(id: string): Promise<void> {
    await api().delete(`/catalog/services/${id}`);
  },

  // ─── Materiais ───────────────────────────────────────────────────────────
  async listMaterials(params?: { search?: string; page?: number; limit?: number }): Promise<CatalogListResponse<MaterialItem>> {
    const response = await api().get<CatalogListResponse<MaterialItem>>('/catalog/materials', { params });
    return response.data;
  },
  async getMaterial(id: string): Promise<MaterialItem> {
    const response = await api().get<MaterialItem>(`/catalog/materials/${id}`);
    return response.data;
  },
  async createMaterial(data: CreateMaterialInput): Promise<MaterialItem> {
    const response = await api().post<MaterialItem>('/catalog/materials', data);
    return response.data;
  },
  async updateMaterial(id: string, data: UpdateCatalogItemInput): Promise<MaterialItem> {
    const response = await api().patch<MaterialItem>(`/catalog/materials/${id}`, data);
    return response.data;
  },
  async removeMaterial(id: string): Promise<void> {
    await api().delete(`/catalog/materials/${id}`);
  },
};