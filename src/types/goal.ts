// ─── Metas mensais por empresa (CompanyGoal) ─────────────────────────────────

/**
 * Meta mensal da empresa (Prisma `CompanyGoal`).
 *
 * A meta é única por (companyId, year, month) — PUT /goals faz upsert.
 * `targetQuoteAmount`/`targetRevenue` são Decimal(15,2) no banco e chegam
 * como string na API (Prisma Decimal) — normalizar com `Number()` no consumo.
 */
export interface CompanyGoal {
  id: string;
  companyId: string;
  year: number;
  month: number;
  targetQuoteAmount: number | string;
  targetRevenue: number | string;
  targetApprovedQuotes: number;
  createdById?: string | null;
  createdAt?: string;
  updatedAt?: string;
  /** Relacionados opcionais (include leve da API). */
  company?: { id: string; tradeName: string } | null;
  createdBy?: { id: string; name: string } | null;
}

// ─── Performance mensal por vendedor (GET /company/dashboard/performance) ───

/**
 * Linha de performance por membro (byMember).
 *
 * ⚠️ O modelo `Quote` NÃO possui `createdById` no schema atual — orçamentos
 * e receita não são atribuíveis a um vendedor individual. Por isso
 * `quotesCreated`/`quotesApproved`/`revenue` por membro ficam 0/null e
 * apenas `followUpsDone` é preenchido (via QuoteFollowUp.createdById).
 */
export interface PerformanceRow {
  memberId: string;
  memberName: string;
  role: string;
  quotesCreated: number;
  quotesApproved: number;
  /** 0-100 (2 casas) ou null quando não há orçamentos criados. */
  approvalRate: number | null;
  revenue: number;
  followUpsDone: number;
}

/** Totais da empresa no período. */
export interface PerformanceTotals {
  quotesCreated: number;
  quotesApproved: number;
  /** 0-100 (2 casas) ou null quando não há orçamentos criados. */
  approvalRate: number | null;
  /** Soma de `saleValue` das OS do mês (status != CANCELADA). */
  revenue: number;
  /** Follow-ups com doneAt no mês. */
  followUpsDone: number;
}

/**
 * Meta do período + percentuais de atingimento.
 * Todos os campos são null quando não existe meta para o período
 * (ou quando a meta é 0, no caso dos pct).
 */
export interface PerformanceGoals {
  targetQuoteAmount: number | null;
  targetRevenue: number | null;
  targetApprovedQuotes: number | null;
  /** (valor de orçamentos do mês / targetQuoteAmount) * 100, 2 casas. */
  quoteAmountPct: number | null;
  /** (receita do mês / targetRevenue) * 100, 2 casas. */
  revenuePct: number | null;
  /** (orçamentos aprovados / targetApprovedQuotes) * 100, 2 casas. */
  approvedQuotesPct: number | null;
}

/**
 * Relatório de performance mensal (GET /company/dashboard/performance).
 * `goals` é o objeto com campos null quando não há meta definida.
 */
export interface PerformanceReport {
  period: { year: number; month: number };
  totals: PerformanceTotals;
  goals: PerformanceGoals | null;
  byMember: PerformanceRow[];
}

// ─── Input ───────────────────────────────────────────────────────────────────

/** Payload de PUT /goals (upsert da meta do período). */
export interface SetGoalInput {
  year: number;
  month: number;
  targetQuoteAmount: number;
  targetRevenue: number;
  targetApprovedQuotes: number;
}
