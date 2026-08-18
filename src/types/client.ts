// ─── Clientes (Fase 2) ─────────────────────────────────────────────────────

export type ClientType = 'FISICA' | 'JURIDICA';

export interface Client {
  id: string;
  companyId: string;
  type: ClientType;
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  observations?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListResponse {
  data: Client[];
  total: number;
}

export interface CreateClientInput {
  type: ClientType;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  observations?: string;
}

export type UpdateClientInput = Partial<CreateClientInput>;