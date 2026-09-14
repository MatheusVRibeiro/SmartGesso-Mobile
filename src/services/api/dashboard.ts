import { getApiClient } from './client';
import { paymentsService } from './payments';
import { quotesService } from './quotes';
import { expensesService } from './expenses';
import { serviceOrdersService } from './serviceOrders';
import { toArray } from '../../types/api';
import type { Expense, Payment } from '../../types/finance';
import type { QuoteSummary } from '../../types/quote';
import type { ServiceOrder } from '../../types/serviceOrder';

export interface DashboardTodayService {
  id: string;
  code: number;
  status: string;
  scheduledDate: string;
  client: { id: string; name: string };
  work?: { id: string; name: string } | null;
}

export interface DashboardPendingPayment {
  id: string;
  amount: number;
  dueDate?: string | null;
  client: { id: string; name: string };
}

export interface DashboardRecentQuote {
  id: string;
  quoteNumber: number;
  version: number;
  status: string;
  total: number;
  createdAt: string;
  client: { id: string; name: string };
}

export interface DashboardStockAlert {
  id: string;
  name: string;
  unit: string;
  stockQty: number;
  minStockQty: number;
  suggestedRestockQty?: number;
}

export interface DashboardOverviewData {
  company: {
    id: string;
    tradeName?: string;
  };
  period: {
    currentYear: number;
    currentMonth: number;
    formattedPeriod: string;
  };
  summary: {
    toReceive: {
      total: number;
      overdue: number;
      dueToday: number;
      pendingCount: number;
      overdueCount: number;
    };
    revenue: {
      monthRevenue: number;
      monthExpenses: number;
      monthProfit: number;
      profitMarginPct: number;
    };
    quotes: {
      openCount: number;
      openTotal: number;
      monthApprovedCount: number;
      conversionRatePct: number | null;
    };
  };
  goals: {
    hasGoal: boolean;
    targetRevenue: number | null;
    revenuePct: number | null;
    targetApprovedQuotes: number | null;
    approvedQuotesPct: number | null;
    targetQuoteAmount: number | null;
    quoteAmountPct: number | null;
  };
  charts: {
    monthlyEvolution: Array<{
      monthLabel: string;
      year: number;
      month: number;
      revenue: number;
      expenses: number;
      profit: number;
      approvedQuotes: number;
    }>;
  };
  operationalToday: {
    servicesCount: number;
    services: Array<{
      id: string;
      code: number;
      status: string;
      scheduledDate: string | null;
      saleValue: number;
      client: {
        id: string;
        name: string;
        phone: string | null;
        whatsapp: string | null;
      } | null;
      work: {
        id: string;
        name: string;
      } | null;
    }>;
    visitsCount: number;
    visits: Array<{
      id: string;
      type: string;
      title: string;
      time: string | null;
      quoteId: string | null;
      serviceOrderId: string | null;
      client: {
        id: string;
        name: string;
        phone: string | null;
        whatsapp: string | null;
      } | null;
      notes: string | null;
    }>;
    followUpsCount: number;
    followUps: Array<{
      id: string;
      quoteId: string;
      quoteNumber: number;
      type: string;
      notes: string | null;
      scheduledAt: string | null;
      status: string;
      client: {
        id: string;
        name: string;
        phone: string | null;
        whatsapp: string | null;
        whatsAppUrl: string | null;
      } | null;
    }>;
  };
  alerts: {
    stockLowCount: number;
    stockAlerts: Array<{
      id: string;
      name: string;
      unit: string;
      stockQty: number;
      minStockQty: number;
      suggestedRestockQty: number;
    }>;
    recentQuotes: Array<{
      id: string;
      quoteNumber: number;
      version: number;
      status: string;
      total: number;
      createdAt: string;
      client: {
        id: string;
        name: string;
      } | null;
    }>;
  };
}

export interface DashboardMetrics {
  toReceive: {
    total: number;
    count: number;
  };
  todayServices: {
    count: number;
    list: DashboardTodayService[];
  };
  openQuotes: {
    count: number;
  };
  monthExpenses: {
    total: number;
    count: number;
  };
  recentQuotes: DashboardRecentQuote[];
  pendingPayments: DashboardPendingPayment[];
  stockAlerts: DashboardStockAlert[];
}

function isSameLocalDay(iso?: string | null, ref = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
  );
}

function isSameLocalMonth(iso?: string | null, ref = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

async function resolveMissingMetrics(raw: DashboardMetrics): Promise<DashboardMetrics> {
  const now = new Date();

  const needsOpenQuotes = raw.openQuotes == null;
  const needsMonthExpenses = raw.monthExpenses == null;
  const needsPendingPayments = raw.pendingPayments == null;
  const needsTodayList = !Array.isArray(raw.todayServices?.list);

  const [paymentsResult, quotesResult, expensesResult, ordersResult] = await Promise.all([
    needsPendingPayments ? paymentsService.list({ status: 'PENDENTE' }) : null,
    needsOpenQuotes ? quotesService.list() : null,
    needsMonthExpenses ? expensesService.list() : null,
    needsTodayList ? serviceOrdersService.list() : null,
  ]);

  const pendingPayments: DashboardPendingPayment[] = needsPendingPayments
    ? toArray<Payment>(paymentsResult)
        .sort((a, b) => {
          const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          return da - db;
        })
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          amount: p.amount,
          dueDate: p.dueDate ?? null,
          client: p.client ?? { id: p.clientId, name: 'Cliente' },
        }))
    : (raw.pendingPayments ?? []);

  const openQuotes = needsOpenQuotes
    ? {
        count: toArray<QuoteSummary>(quotesResult).filter(
          (q) => q.status === 'RASCUNHO' || q.status === 'ENVIADO',
        ).length,
      }
    : (raw.openQuotes ?? { count: 0 });

  const monthExpenses = needsMonthExpenses
    ? (() => {
        const list = toArray<Expense>(expensesResult).filter((e) =>
          isSameLocalMonth(e.expenseDate, now),
        );
        return {
          total: list.reduce((sum, e) => sum + e.amount, 0),
          count: list.length,
        };
      })()
    : (raw.monthExpenses ?? { total: 0, count: 0 });

  const todayList: DashboardTodayService[] = needsTodayList
    ? toArray<ServiceOrder>(ordersResult)
        .filter(
          (o) =>
            isSameLocalDay(o.scheduledDate, now) &&
            (o.status === 'PENDENTE' || o.status === 'EM_ANDAMENTO'),
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledDate ?? 0).getTime() - new Date(b.scheduledDate ?? 0).getTime(),
        )
        .slice(0, 5)
        .map((o) => ({
          id: o.id,
          code: o.code,
          status: o.status,
          scheduledDate: o.scheduledDate ?? '',
          client: o.client ?? { id: o.clientId, name: 'Cliente' },
          work: o.work ?? null,
        }))
    : (raw.todayServices?.list ?? []);

  return {
    ...raw,
    toReceive: raw.toReceive ?? { total: 0, count: 0 },
    todayServices: {
      count: raw.todayServices?.count ?? todayList.length,
      list: todayList,
    },
    openQuotes,
    monthExpenses,
    recentQuotes: raw.recentQuotes ?? [],
    pendingPayments,
    stockAlerts: raw.stockAlerts ?? [],
  };
}

async function api() {
  return getApiClient();
}

export const dashboardService = {
  /** GET /company/dashboard/overview - Dados consolidados de alta performance */
  async getOverview(): Promise<DashboardOverviewData> {
    const client = await api();
    const { data } = await client.get<DashboardOverviewData>('/company/dashboard/overview');
    return data;
  },

  /** GET /company/dashboard/metrics */
  async getMetrics(): Promise<DashboardMetrics> {
    const client = await api();
    const { data } = await client.get<DashboardMetrics>('/company/dashboard/metrics');
    return resolveMissingMetrics(data);
  },
};
