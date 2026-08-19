// ─── Estoque / Movimentos de inventário (V3) ────────────────────────────────
import type { MaterialItem } from './catalog';

export type InventoryMovementType =
  | 'ENTRADA'
  | 'SAIDA'
  | 'RESERVA'
  | 'CONSUMO'
  | 'PERDA'
  | 'AJUSTE'
  | 'RETORNO';

/** Referência compacta do material incluída em listagens de movimentos. */
export interface InventoryMovementMaterialRef {
  id: string;
  name: string;
  unit: string;
}

/** Referência compacta da ordem de serviço vinculada (quando houver). */
export interface InventoryServiceOrderRef {
  id: string;
  code: number;
}

export interface InventoryMovement {
  id: string;
  companyId: string;
  materialId: string;
  serviceOrderId: string | null;
  type: InventoryMovementType;
  quantity: number;
  unitCost: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /** Incluído em GET /inventory/movements. */
  material?: InventoryMovementMaterialRef;
  /** Incluído quando há vínculo com ordem de serviço. */
  serviceOrder?: InventoryServiceOrderRef | null;
}

export interface CreateInventoryMovementInput {
  materialId: string;
  type: InventoryMovementType;
  /**
   * Quantidade do movimento.
   * Para AJUSTE, representa o valor FINAL do estoque (stockQty = quantity).
   */
  quantity: number;
  serviceOrderId?: string;
  unitCost?: number;
  notes?: string;
}

export interface AdjustStockInput {
  /** Valor FINAL do estoque após o ajuste. */
  quantity: number;
  notes?: string;
}

export interface InventoryMovementResult {
  movement: InventoryMovement;
  material: MaterialItem;
}
