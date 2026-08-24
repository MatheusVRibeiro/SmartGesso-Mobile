// ─── Pedidos de Compra (B10) ─────────────────────────────────────────────────

export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  supplierId?: string | null;
  supplierName?: string | null;
  serviceOrderId?: string | null;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  total: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  total: number;
}

export interface CreatePurchaseOrderItemInput {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderInput {
  supplierId?: string;
  serviceOrderId?: string;
  items: CreatePurchaseOrderItemInput[];
  notes?: string;
}

export interface UpdatePurchaseOrderStatusInput {
  status: PurchaseOrderStatus;
}
