// ─── Composições e Cálculo de Materiais (Fase 3) ───────────────────────────

import type { MeasurementApplicationType } from './measurement';

export type CompositionStatus = 'ACTIVE' | 'INACTIVE';

export interface CompositionItem {
  id: string;
  compositionId: string;
  materialType: string;
  name: string;
  unit: string;
  formula: {
    factor: number;
    basedOn: 'area' | 'perimeter' | 'length' | 'unit';
  };
}

export interface Composition {
  id: string;
  companyId: string;
  code: string;
  name: string;
  version: number;
  applicationType: MeasurementApplicationType;
  status: CompositionStatus;
  items: CompositionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CalculateMaterialsInput {
  applicationType: MeasurementApplicationType;
  measurements: Array<{
    length?: number;
    width?: number;
    ceilingHeight?: number;
    area?: number;
    perimeter?: number;
  }>;
}

export interface CalculatedMaterialItem {
  materialType: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice?: number | null;
  total?: number | null;
}

export interface CalculateMaterialsResponse {
  composition: {
    code: string;
    name: string;
    version: number;
  };
  items: CalculatedMaterialItem[];
  totalArea: number;
  estimatedCost: number;
}