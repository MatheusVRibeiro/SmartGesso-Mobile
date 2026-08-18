// ─── Medições (Fase 3) ─────────────────────────────────────────────────────

export type MeasurementApplicationType =
  | 'DRYWALL'
  | 'FORRO'
  | 'PAREDE'
  | 'SANCA'
  | 'REBAIXAMENTO'
  | 'OUTRO';

export interface Measurement {
  id: string;
  companyId: string;
  workId: string;
  environmentName: string;
  applicationType: MeasurementApplicationType;
  length?: number | null;
  width?: number | null;
  ceilingHeight?: number | null;
  area?: number | null;
  perimeter?: number | null;
  doors: number;
  windows: number;
  cutouts: number;
  fixtures: number;
  hasCove: boolean;
  hasDropCeiling: boolean;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementListResponse {
  data: Measurement[];
  total: number;
}

export interface CreateMeasurementInput {
  environmentName: string;
  applicationType?: MeasurementApplicationType;
  length?: number;
  width?: number;
  ceilingHeight?: number;
  area?: number;
  perimeter?: number;
  doors?: number;
  windows?: number;
  cutouts?: number;
  fixtures?: number;
  hasCove?: boolean;
  hasDropCeiling?: boolean;
  observations?: string;
}

export type UpdateMeasurementInput = Partial<CreateMeasurementInput>;