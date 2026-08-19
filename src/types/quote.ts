// ─── Orçamentos (Fase 4) ───────────────────────────────────────────────────

export type QuoteStatus = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';

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
  client?: { id: string; name: string; document?: string | null };
  work?: { id: string; name: string };
  items: QuoteItemSummary[];
}

/** Endereço/local onde o serviço será realizado (contexto do orçamento). */
export interface QuoteLocalAddress {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  reference?: string;
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