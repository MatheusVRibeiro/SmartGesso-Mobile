import { getApiClient } from './client';
import type { MaterialItem } from '../../types/catalog';
import type {
  AdjustStockInput,
  CreateInventoryMovementInput,
  InventoryMovement,
  InventoryMovementResult,
  InventoryMovementType,
} from '../../types/inventory';

function api() {
  return getApiClient();
}

/**
 * Módulo tipado de estoque (V3): movimentos reais de inventário.
 * Escopado por companyId no backend (guard ActiveCompany) — nunca enviar companyId no body.
 */
export const inventoryService = {
  /** Lista movimentos com filtros opcionais (material, OS, tipo). */
  async listMovements(params?: {
    materialId?: string;
    serviceOrderId?: string;
    type?: InventoryMovementType;
  }): Promise<InventoryMovement[]> {
    const response = await api().get<InventoryMovement[]>('/inventory/movements', { params });
    return response.data;
  },

  /**
   * Registra um movimento e atualiza o stockQty do material atomicamente.
   * ENTRADA/RETORNO incrementam · SAIDA/CONSUMO/PERDA decrementam ·
   * RESERVA não altera saldo · AJUSTE define o saldo para `quantity`.
   */
  async createMovement(data: CreateInventoryMovementInput): Promise<InventoryMovementResult> {
    const response = await api().post<InventoryMovementResult>('/inventory/movements', data);
    return response.data;
  },

  /** Lista materiais com saldo, estoque mínimo e custo (visão de estoque). */
  async listMaterials(params?: { search?: string }): Promise<MaterialItem[]> {
    const response = await api().get<MaterialItem[]>('/inventory/materials', { params });
    return response.data;
  },

  /** Histórico de movimentos de um material específico. */
  async getMaterialMovements(materialId: string): Promise<InventoryMovement[]> {
    const response = await api().get<InventoryMovement[]>(
      `/inventory/materials/${materialId}/movements`,
    );
    return response.data;
  },

  /** Ajuste manual: define o estoque do material para o valor informado. */
  async adjustStock(
    materialId: string,
    data: AdjustStockInput,
  ): Promise<InventoryMovementResult> {
    const response = await api().post<InventoryMovementResult>(
      `/inventory/materials/${materialId}/adjust`,
      data,
    );
    return response.data;
  },
};
