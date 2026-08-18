// ─── Obras (Fase 2) ────────────────────────────────────────────────────────

export type WorkStatus = 'PLANEJADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export interface WorkClientSummary {
  id: string;
  name: string;
}

export interface Work {
  id: string;
  companyId: string;
  clientId: string;
  name: string;
  reference?: string | null;
  postalCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  status: WorkStatus;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: WorkClientSummary;
}

export interface WorkListResponse {
  data: Work[];
  total: number;
}

export interface CreateWorkInput {
  clientId: string;
  name: string;
  reference?: string;
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  status?: WorkStatus;
  observations?: string;
}

export type UpdateWorkInput = Partial<CreateWorkInput>;