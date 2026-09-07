import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock useQuery com implementação mutável
const mockUseQuery = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock('../../../../src/store/useSessionStore', () => ({
  useSessionStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      activeCompany: {
        company: {
          id: 'company-1',
          tradeName: 'SmartGesso Test',
        },
      },
      currentUser: {
        name: 'João da Silva',
      },
    };
    return selector(state);
  }),
}));

jest.mock('../../../../src/services/api/dashboard', () => ({
  dashboardService: {
    getOverview: jest.fn(),
    getMetrics: jest.fn(),
  },
}));

jest.mock('../../../../src/services/api/quoteFollowUps', () => ({
  quoteFollowUpsService: {
    listToday: jest.fn(),
  },
}));

jest.mock('../../../../src/services/api/client', () => ({
  toApiError: jest.fn(() => ({ message: 'Erro de teste' })),
}));

// Importar DEPOIS dos mocks
import HomeScreen from '../index';

const defaultOverview = {
  company: { id: 'company-1', tradeName: 'SmartGesso Test' },
  period: { currentYear: 2026, currentMonth: 8, formattedPeriod: 'Agosto 2026' },
  summary: {
    toReceive: {
      total: 0,
      overdue: 0,
      dueToday: 0,
      pendingCount: 0,
      overdueCount: 0,
    },
    revenue: {
      monthRevenue: 10000,
      monthExpenses: 4000,
      monthProfit: 6000,
      profitMarginPct: 60,
    },
    quotes: {
      openCount: 3,
      openTotal: 5000,
      monthApprovedCount: 1,
      conversionRatePct: 33,
    },
  },
  goals: {
    hasGoal: true,
    targetRevenue: 20000,
    revenuePct: 50,
    targetApprovedQuotes: 4,
    approvedQuotesPct: 25,
    targetQuoteAmount: 10000,
    quoteAmountPct: 50,
  },
  operationalToday: {
    servicesCount: 0,
    services: [],
    visitsCount: 0,
    visits: [],
    followUpsCount: 0,
    followUps: [],
  },
  charts: {
    monthlyEvolution: [
      { monthLabel: 'Jan', year: 2026, month: 1, revenue: 1000, expenses: 500, profit: 500, approvedQuotes: 1 },
    ],
  },
  alerts: {
    stockLowCount: 0,
    stockAlerts: [],
  },
};

const defaultQueryResult = {
  data: defaultOverview,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  isRefetching: false,
};

describe('HomeScreen (Dashboard)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockImplementation((opts?: { queryKey?: string[] }) => {
      if (opts?.queryKey?.[0] === 'quotes-expiring') {
        return { data: [], isLoading: false, isError: false, error: null, refetch: jest.fn(), isRefetching: false };
      }
      return defaultQueryResult;
    });
  });

  it('renderiza a saudação com o nome do usuário', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText(/Olá, João/)).toBeTruthy();
  });

  it('renderiza o nome da empresa', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('SmartGesso Test')).toBeTruthy();
  });

  it('renderiza as ações rápidas', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Orçamento')).toBeTruthy();
    expect(screen.getByText('Nova OS')).toBeTruthy();
  });

  it('renderiza seção de follow-ups quando há follow-ups', async () => {
    const overviewWithFollowUps = {
      ...defaultOverview,
      operationalToday: {
        ...defaultOverview.operationalToday,
        followUpsCount: 1,
        followUps: [
          {
            id: '1',
            quoteId: 'quote-1',
            quoteNumber: 1001,
            type: 'CALL',
            notes: 'Retorno sobre orçamento',
            scheduledAt: null,
            status: 'PENDING',
            client: { id: 'c1', name: 'Cliente A', phone: null, whatsapp: null, whatsAppUrl: null },
          },
        ],
      },
    };
    mockUseQuery.mockReturnValue({ ...defaultQueryResult, data: overviewWithFollowUps });
    await render(<HomeScreen />);
    expect(screen.getByText('Follow-ups Pendentes')).toBeTruthy();
  });

  it('renderiza serviços de hoje', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText(/Serviços de Hoje/)).toBeTruthy();
  });

  it('renderiza loading state quando isLoading é true', async () => {
    mockUseQuery.mockReturnValue({
      ...defaultQueryResult,
      isLoading: true,
      data: undefined,
    });

    await render(<HomeScreen />);
    expect(screen.getByText('Carregando dashboard...')).toBeTruthy();
  });

  it('renderiza follow-ups quando há dados', async () => {
    const mockFollowUps = [
      {
        id: '1',
        quoteId: 'quote-1',
        quoteNumber: 1001,
        type: 'CALL',
        notes: 'Retorno sobre orçamento',
        scheduledAt: null,
        status: 'PENDING',
        client: { id: 'c1', name: 'Cliente A', phone: null, whatsapp: null, whatsAppUrl: null },
      },
    ];

    mockUseQuery.mockReturnValue({
      ...defaultQueryResult,
      data: {
        ...defaultOverview,
        operationalToday: {
          ...defaultOverview.operationalToday,
          followUpsCount: 1,
          followUps: mockFollowUps,
        },
      },
    });

    await render(<HomeScreen />);
    expect(screen.getByText(/Orçamento #1001/)).toBeTruthy();
  });
  it('renderiza banner de alerta quando há orçamentos a vencer', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    mockUseQuery.mockImplementation((opts?: { queryKey?: string[] }) => {
      if (opts?.queryKey?.[0] === 'quotes-expiring') {
        return {
          data: [
            {
              id: 'quote-expiring-1',
              quoteNumber: 101,
              status: 'ENVIADO',
              validUntil: futureDate.toISOString(),
            },
          ],
          isLoading: false,
          isError: false,
          error: null,
          refetch: jest.fn(),
          isRefetching: false,
        };
      }
      return defaultQueryResult;
    });

    await render(<HomeScreen />);
    expect(screen.getByText(/1 orçamento vence em breve/)).toBeTruthy();
  });
});