// ─── Ambientes de Orçamento (M3 — service layer) ──────────────────────────────

/**
 * Representa um ambiente (cômodo/ambiente físico) associado a um orçamento.
 * Cada ambiente pode ter medições associadas para cálculo de materiais.
 */
export interface QuoteEnvironment {
  id: string;
  companyId: string;
  quoteId: string;
  name: string;
  description?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Medição associada a um ambiente de orçamento.
 * Contém as dimensões e cálculos relacionados ao ambiente.
 */
export interface QuoteEnvironmentMeasurement {
  id: string;
  environmentId: string;
  area?: number | null;
  perimeter?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  observations?: string | null;
  createdAt: string;
}

/** Payload para criação de um ambiente de orçamento. */
export interface CreateEnvironmentInput {
  name: string;
  description?: string;
  order?: number;
}

/** Payload para atualização de um ambiente de orçamento. */
export type UpdateEnvironmentInput = Partial<CreateEnvironmentInput>;

/** Payload para criação de uma medição de ambiente. */
export interface CreateEnvironmentMeasurementInput {
  area?: number;
  perimeter?: number;
  length?: number;
  width?: number;
  height?: number;
  observations?: string;
}

/** Payload para atualização de uma medição de ambiente. */
export type UpdateEnvironmentMeasurementInput = Partial<CreateEnvironmentMeasurementInput>;
