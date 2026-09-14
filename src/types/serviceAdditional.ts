// ─── Aditivos de Serviço (B9) ────────────────────────────────────────────────

/**
 * Status de um aditivo de serviço.
 * - DRAFT: rascunho (não enviado ao cliente)
 * - SENT: enviado ao cliente para aprovação
 * - APPROVED: aprovado pelo cliente
 * - REJECTED: rejeitado pelo cliente
 * - CANCELLED: cancelado
 */
export type ServiceAdditionalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

/**
 * Aditivo de serviço — valor adicional acordado após a contratação original.
 * Endpoints: GET/POST /service-orders/:serviceOrderId/additionals
 */
export interface ServiceAdditional {
  id: string;
  companyId: string;
  serviceOrderId: string;
  code: number;
  description: string;
  amount: number;
  /** Custo estimado do aditivo (opcional). */
  estimatedCost?: number | null;
  status: ServiceAdditionalStatus;
  /** Data/hora de aprovação pelo cliente. */
  approvedAt?: string | null;
  /** Data/hora de rejeição pelo cliente. */
  rejectedAt?: string | null;
  /** Observações livres sobre o aditivo. */
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Resposta paginada/lista de aditivos de serviço. */
export interface ServiceAdditionalListResponse {
  data: ServiceAdditional[];
  total: number;
}

/** Entrada para criar um aditivo de serviço. */
export interface CreateAdditionalInput {
  code: number;
  description: string;
  amount: number;
  estimatedCost?: number;
  notes?: string;
}

/** Entrada para atualizar um aditivo de serviço. */
export interface UpdateAdditionalInput {
  code?: number;
  description?: string;
  amount?: number;
  estimatedCost?: number | null;
  notes?: string | null;
}
