// ─── Financeiro (Fase 6) ───────────────────────────────────────────────────

export type PaymentStatus = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO';

export type PaymentMethod =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'BOLETO'
  | 'TRANSFERENCIA'
  | 'CHEQUE'
  | 'OUTRO';

export type PaymentInstallmentStatus = 'PENDENTE' | 'CONFIRMADO';

export interface PaymentInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  status: PaymentInstallmentStatus;
}

export interface Payment {
  id: string;
  companyId: string;
  clientId: string;
  quoteId?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  dueDate?: string | null;
  status: PaymentStatus;
  notes?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string };
  /** Pagamento parcelado — lista de parcelas retornada pela API (Fase 6+). */
  installmentCount?: number | null;
  installments?: PaymentInstallment[] | null;
}

export interface PaymentListResponse {
  data: Payment[];
  total: number;
}

export interface CreatePaymentInput {
  clientId: string;
  quoteId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  dueDate?: string;
  status?: PaymentStatus;
  notes?: string;
  /** Número de parcelas (1-12). Omitido/1 = pagamento à vista. */
  installmentCount?: number;
  /** Parcelas geradas (amount + dueDate por parcela) — opcional; a API pode gerar a partir do installmentCount. */
  installments?: { amount: number; dueDate: string }[];
}

export interface UpdatePaymentInput {
  /** URL do comprovante. */
  receiptUrl?: string | null;
  /** Status do pagamento. */
  status?: PaymentStatus;
  /** Data do pagamento. */
  paymentDate?: string;
  /** Data de vencimento. */
  dueDate?: string;
  /** Observações. */
  notes?: string;
}

// ─── Despesas ──────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'MATERIAL'
  | 'MAO_DE_OBRA'
  | 'TRANSPORTE'
  | 'ALUGUEL'
  | 'ENERGIA'
  | 'AGUA'
  | 'INTERNET'
  | 'TELEFONE'
  | 'MARKETING'
  | 'IMPOSTOS'
  | 'OUTROS';

export interface Expense {
  id: string;
  companyId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  receiptUrl?: string | null;
  observations?: string | null;
  /** Ordem de serviço vinculada (V3 — despesa contextual dentro do serviço). */
  serviceOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseListResponse {
  data: Expense[];
  total: number;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate?: string;
  observations?: string;
  /** Ordem de serviço vinculada (V3 — despesa contextual dentro do serviço). */
  serviceOrderId?: string;
}

export interface UpdateExpenseInput {
  /** URL do comprovante. */
  receiptUrl?: string | null;
  /** Categoria da despesa. */
  category?: ExpenseCategory;
  /** Descrição da despesa. */
  description?: string;
  /** Valor da despesa. */
  amount?: number;
  /** Data da despesa. */
  expenseDate?: string;
  /** Observações. */
  observations?: string;
  /** Ordem de serviço vinculada. */
  serviceOrderId?: string;
}