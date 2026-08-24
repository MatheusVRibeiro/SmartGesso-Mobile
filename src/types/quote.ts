import type { ServiceOrderStatus } from './serviceOrder';
// ─── Orçamentos (Fase 4) ───────────────────────────────────────────────────

export type QuoteStatus =
  | 'RASCUNHO'
  | 'PRONTO_PARA_ENVIAR'
  | 'ENVIADO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADO'
  | 'REJEITADO'
  | 'VENCIDO'
  | 'CANCELADO';

export type QuotePaymentMethod =
  | 'AVISTA'
  | 'AVISTA_DESCONTO'
  | 'ENTRADA_SALDO'
  | 'QUINZENAL_2X'
  | 'MENSAL'
  | 'PARCELADO'
  | 'PERSONALIZADO';

export type QuoteItemType = 'PRODUTO' | 'SERVICO' | 'MATERIAL' | 'MAO_DE_OBRA' | 'TRANSPORTE';

export interface QuoteItemSummary {
  id: string;
  itemType: QuoteItemType;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface QuoteSummary {
  id: string;
  quoteNumber: number;
  version: number;
  status: QuoteStatus;
  total: number;
  paymentMethod: QuotePaymentMethod;
  createdAt: string;
  /** Até quando o preço/condições são válidos (V3 — validade do orçamento). */
  validUntil?: string | null;
  /** Data agendada para visita técnica (V3 — Agenda). */
  visitDate?: string | null;
  /** Data agendada para medição (V3 — Agenda). */
  measurementDate?: string | null;
  client?: { id: string; name: string };
  work?: { id: string; name: string };
}

export interface Quote {
  id: string;
  companyId: string;
  clientId: string;
  workId?: string | null;
  quoteNumber: number;
  version: number;
  status: QuoteStatus;
  subtotal: number;
  discount: number;
  marginPct: number;
  total: number;
  paymentMethod: QuotePaymentMethod;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Até quando o preço/condições são válidos (V3 — validade do orçamento). */
  validUntil?: string | null;
  /** Previsão de conclusão (AAAA-MM-DD) — usado no planejado x realizado. */
  endDate?: string | null;
  /** Data-limite de entrega (AAAA-MM-DD) — Modo C. */
  deadlineDate?: string | null;
  /** Marcado quando o orçamento aprovado vira ordem de serviço (V3). */
  convertedAt?: string | null;
  client?: { id: string; name: string; document?: string | null };
  work?: { id: string; name: string };
  items: QuoteItemSummary[];
  /** Timeline de eventos (criação, versões, aprovação, rejeição...). */
  history?: QuoteHistoryItem[];
}

/** Evento do histórico do orçamento (QuoteHistory). */
export interface QuoteHistoryItem {
  id: string;
  status: QuoteStatus;
  changedAt: string;
  note?: string | null;
}

/** Resposta de POST /quotes/:id/convert-to-service (V3). */
export interface ConvertToServiceResult {
  serviceOrderId: string;
  code: number;
  status: string;
  clientId: string;
  workId?: string | null;
  scheduledDate?: string | null;
  saleValue: number;
  observations?: string | null;
}

/** Resposta de POST /quotes/:id/approve (V4 ETAPA 1). */
export interface ApproveQuoteResponse {
  quote: Quote;
  serviceOrder: {
    id: string;
    code: number;
    status: ServiceOrderStatus;
  };
  serviceOrderCreated: boolean;
}

/** Endereço/local onde o serviço será realizado (contexto do orçamento).
 * Campos em PT-BR — alinhados ao LocalAddressDto da API (create-quote.dto.ts). */
export interface QuoteLocalAddress {
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  referencia?: string;
}

export interface CreateQuoteInput {
  clientId: string;
  workId?: string;
  /** Endereço livre do local do serviço (V3 — não exige obra vinculada). */
  localAddress?: QuoteLocalAddress;
  /** Previsão de início (AAAA-MM-DD). */
  startDate?: string;
  /** Prazo estimado em dias (Modo A). */
  durationDays?: number;
  /** Previsão de conclusão (AAAA-MM-DD) — calculada no Modo A, informada no Modo B. */
  endDate?: string;
  /** Data-limite de entrega (AAAA-MM-DD) — Modo C. */
  deadlineDate?: string;
  discount?: number;
  marginPct?: number;
  paymentMethod?: QuotePaymentMethod;
  observations?: string;
  items: Array<{
    itemType: QuoteItemType;
    name: string;
    description?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
  }>;
}

export type UpdateQuoteInput = Partial<Omit<CreateQuoteInput, 'clientId' | 'items'>> & {
  items?: CreateQuoteInput['items'];
};