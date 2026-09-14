// ─── Fornecedores (B10) ──────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  cnpjCpf?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierListResponse {
  data: Supplier[];
  total: number;
}

export interface CreateSupplierInput {
  name: string;
  cnpjCpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export type UpdateSupplierInput = Partial<CreateSupplierInput>;
