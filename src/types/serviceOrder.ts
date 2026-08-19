// ─── Ordens de Serviço (Fase 5) ────────────────────────────────────────────

export type ServiceOrderStatus =
  | 'PENDENTE'
  | 'EM_DESLOCAMENTO'
  | 'EM_ANDAMENTO'
  | 'PAUSADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export interface ServiceOrderMaterial {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  usedAt?: string | null;
}

export interface ServiceOrder {
  id: string;
  companyId: string;
  clientId: string;
  workId: string;
  code: number;
  status: ServiceOrderStatus;
  scheduledDate?: string | null;
  completedDate?: string | null;
  cost?: number | null;
  saleValue?: number | null;
  profit?: number | null;
  observations?: string | null;
  /** Motivo da pausa/atraso (V3 §35): motivo + observação + data em texto livre. */
  pauseReason?: string | null;
  checklist?: Record<string, boolean> | null;
  /** Etapas do serviço (V3 §33) — timeline interativa: `{ 'medicao': true, ... }`. */
  etapas?: Record<string, boolean> | null;
  /** Produção opcional (V3 §44) — se o serviço exige ordem de produção. */
  needsProduction?: boolean | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string };
  work?: { id: string; name: string };
  materials?: ServiceOrderMaterial[];
}

/** Resultado financeiro de uma ordem de serviço (custo × venda → lucro/margem). */
export interface ServiceOrderResult {
  cost: number;
  saleValue: number;
  profit: number;
  marginPct: number;
}

/** Entrada para registrar o resultado do serviço (lucro/margem calculados pela API). */
export interface RegisterServiceOrderResultInput {
  cost: number;
  saleValue: number;
}

export interface ServiceOrderListResponse {
  data: ServiceOrder[];
  total: number;
}

export interface CreateServiceOrderInput {
  clientId: string;
  workId: string;
  scheduledDate?: string;
  observations?: string;
  materials?: Array<{
    materialName: string;
    quantity: number;
    unit?: string;
  }>;
}

export type UpdateServiceOrderInput = Partial<Omit<CreateServiceOrderInput, 'clientId' | 'workId'>> & {
  status?: ServiceOrderStatus;
  completedDate?: string;
  pauseReason?: string;
  checklist?: Record<string, boolean>;
  etapas?: Record<string, boolean>;
  needsProduction?: boolean;
};

// ─── Ordens de Produção (Fase 5) ──────────────────────────────────────────

export type ProductionOrderStatus = 'PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDA' | 'CANCELADA';

export interface ProductionOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  producedQty: number;
  wastedQty: number;
  status: string;
}

export interface ProductionOrder {
  id: string;
  companyId: string;
  clientId?: string | null;
  workId?: string | null;
  code: number;
  status: ProductionOrderStatus;
  dueDate?: string | null;
  completedDate?: string | null;
  responsiblePerson?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string };
  work?: { id: string; name: string };
  items?: ProductionOrderItem[];
}

export interface ProductionOrderListResponse {
  data: ProductionOrder[];
  total: number;
}

export interface CreateProductionOrderInput {
  clientId?: string;
  workId?: string;
  dueDate?: string;
  responsiblePerson?: string;
  observations?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    unit?: string;
  }>;
}

export type UpdateProductionOrderInput = Partial<Omit<CreateProductionOrderInput, 'clientId' | 'workId'>> & {
  status?: ProductionOrderStatus;
  completedDate?: string;
};