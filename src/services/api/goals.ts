import { getApiClient } from './client';
import { toArray } from '../../types/api';
import type {
  CompanyGoal,
  PerformanceReport,
  SetGoalInput,
} from '../../types/goal';

function api() {
  return getApiClient();
}

/**
 * Normaliza a meta do período: a API pode retornar `null` (sem meta) ou um
 * CompanyGoal com `targetQuoteAmount`/`targetRevenue` como string (Decimal
 * Prisma). Converte para number para o consumo direto na UI.
 */
function normalizeGoal(raw: unknown): CompanyGoal | null {
  if (!raw || typeof raw !== 'object') return null;
  const goal = raw as CompanyGoal;
  return {
    ...goal,
    targetQuoteAmount: Number(goal.targetQuoteAmount ?? 0),
    targetRevenue: Number(goal.targetRevenue ?? 0),
    targetApprovedQuotes: Number(goal.targetApprovedQuotes ?? 0),
  };
}

/**
 * Normaliza o relatório de performance: garante `byMember` como array e
 * converte os Decimals (string) da meta para number.
 */
function normalizePerformance(raw: unknown): PerformanceReport {
  const report = (raw ?? {}) as Partial<PerformanceReport>;
  const goals = report.goals
    ? {
        targetQuoteAmount:
          report.goals.targetQuoteAmount != null
            ? Number(report.goals.targetQuoteAmount)
            : null,
        targetRevenue:
          report.goals.targetRevenue != null
            ? Number(report.goals.targetRevenue)
            : null,
        targetApprovedQuotes:
          report.goals.targetApprovedQuotes != null
            ? Number(report.goals.targetApprovedQuotes)
            : null,
        quoteAmountPct: report.goals.quoteAmountPct,
        revenuePct: report.goals.revenuePct,
        approvedQuotesPct: report.goals.approvedQuotesPct,
      }
    : null;

  return {
    period: report.period ?? { year: new Date().getFullYear(), month: 1 },
    totals: report.totals ?? {
      quotesCreated: 0,
      quotesApproved: 0,
      approvalRate: null,
      revenue: 0,
      followUpsDone: 0,
    },
    goals,
    byMember: toArray(report.byMember),
  };
}

/** Módulo tipado de metas mensais e performance (Feature #8 mobile). */
export const goalsService = {
  /**
   * GET /goals?year=&month= — meta do período.
   * Retorna `null` quando não existe meta para o período (a API responde 200 com null).
   */
  async getGoal(year: number, month: number): Promise<CompanyGoal | null> {
    const response = await api().get<CompanyGoal | null>('/goals', {
      params: { year, month },
    });
    return normalizeGoal(response.data);
  },

  /**
   * PUT /goals — cria/atualiza a meta do período (upsert).
   * Exige permissão `company_goals.manage` (OWNER/MANAGER).
   */
  async setGoal(data: SetGoalInput): Promise<CompanyGoal> {
    const response = await api().put<CompanyGoal>('/goals', data);
    return normalizeGoal(response.data) as CompanyGoal;
  },

  /** GET /goals/list — todas as metas da empresa (mais recente primeiro). */
  async listGoals(): Promise<CompanyGoal[]> {
    const response = await api().get<unknown>('/goals/list');
    return toArray<CompanyGoal>(response.data).map((goal) =>
      normalizeGoal(goal) as CompanyGoal,
    );
  },

  /**
   * GET /company/dashboard/performance?year=&month= — performance mensal
   * por vendedor: totais, % vs meta e divisão por membro.
   */
  async getPerformance(year: number, month: number): Promise<PerformanceReport> {
    const response = await api().get<unknown>(
      '/company/dashboard/performance',
      { params: { year, month } },
    );
    return normalizePerformance(response.data);
  },
};
