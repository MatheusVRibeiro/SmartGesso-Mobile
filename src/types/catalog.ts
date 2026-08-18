// ─── Catálogo (Produtos, Serviços, Materiais — Fase 2) ─────────────────────

export type CatalogItemStatus = 'ACTIVE' | 'INACTIVE';

export interface CatalogItem {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  unit: string;
  price?: number | null;
  cost?: number | null;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialItem extends CatalogItem {
  stockQty?: number | null;
  minStockQty?: number | null;
}

export interface Product extends CatalogItem {}

export interface ServiceItem extends CatalogItem {}

export interface CatalogListResponse<T extends CatalogItem = CatalogItem> {
  data: T[];
  total: number;
}

export interface CreateCatalogItemInput {
  name: string;
  description?: string;
  unit?: string;
  price?: number;
  cost?: number;
  status?: CatalogItemStatus;
}

export interface CreateMaterialInput extends CreateCatalogItemInput {
  stockQty?: number;
  minStockQty?: number;
}

export type UpdateCatalogItemInput = Partial<CreateCatalogItemInput>;