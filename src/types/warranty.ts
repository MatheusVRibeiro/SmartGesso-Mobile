/**
 * Garantia de Serviço (ServiceWarranty) — ETAPA 13
 */

export type ServiceWarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export interface ServiceWarranty {
  id: string;
  companyId: string;
  serviceOrderId: string;
  startDate: string;
  endDate: string;
  notes?: string | null;
  status: ServiceWarrantyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceWarrantyListResponse {
  data: ServiceWarranty[];
  total: number;
}

export interface CreateWarrantyInput {
  warrantyDays: number;
  notes?: string;
}

export interface UpdateWarrantyStatusInput {
  status: ServiceWarrantyStatus;
}

/**
 * Retorno de Serviço (ServiceReturn) — ETAPA 13
 */

export type ServiceReturnStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';

export interface ServiceReturn {
  id: string;
  companyId: string;
  serviceOrderId: string;
  warrantyId?: string | null;
  reason: string;
  description?: string | null;
  status: ServiceReturnStatus;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReturnListResponse {
  data: ServiceReturn[];
  total: number;
}

export interface CreateReturnInput {
  warrantyId?: string;
  reason: string;
  description?: string;
  coveredByWarranty?: boolean;
}

export interface UpdateReturnStatusInput {
  status: ServiceReturnStatus;
  resolutionNote?: string;
}
