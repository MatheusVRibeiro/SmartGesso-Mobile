// ─── Clientes (Fase 2) ─────────────────────────────────────────────────────

export type ClientType = 'FISICA' | 'JURIDICA';

/** Endereço do cliente no form (nomeclatura mobile). */
export interface ClientAddressInput {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface Client {
  id: string;
  companyId: string;
  type: ClientType;
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  /** Endereço (API retorna campos flat: postalCode/district/...). */
  postalCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
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
  address?: ClientAddressInput;
  observations?: string;
}

export type UpdateClientInput = Partial<CreateClientInput>;
