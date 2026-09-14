import { goalsService } from '../goals';
import { getApiClient } from '../client';

jest.mock('../client', () => ({
  getApiClient: jest.fn(),
}));

const mockedGetApiClient = getApiClient as jest.MockedFunction<
  typeof getApiClient
>;

const mockClient = {
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

const mockGoal = {
  id: 'g-1',
  companyId: 'c1',
  year: 2026,
  month: 8,
  targetQuoteAmount: '50000.00',
  targetRevenue: '30000.00',
  targetApprovedQuotes: 10,
  createdById: 'u1',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
} as const;

const mockPerformance = {
  period: { year: 2026, month: 8 },
  totals: {
    quotesCreated: 12,
    quotesApproved: 5,
    approvalRate: 41.67,
    revenue: 15000,
    followUpsDone: 8,
  },
  goals: {
    targetQuoteAmount: '50000.00',
    targetRevenue: '30000.00',
    targetApprovedQuotes: 10,
    quoteAmountPct: 60,
    revenuePct: 50,
    approvedQuotesPct: 50,
  },
  byMember: [
    {
      memberId: 'm1',
      memberName: 'João da Silva',
      role: 'SALES',
      quotesCreated: 0,
      quotesApproved: 0,
      approvalRate: null,
      revenue: 0,
      followUpsDone: 4,
    },
  ],
} as const;

describe('goalsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
  });

  describe('getGoal', () => {
    it('chama GET /goals com year e month e normaliza Decimals para number', async () => {
      mockClient.get.mockResolvedValue({ data: mockGoal });

      const result = await goalsService.getGoal(2026, 8);

      expect(mockClient.get).toHaveBeenCalledWith('/goals', {
        params: { year: 2026, month: 8 },
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe('g-1');
      expect(result?.targetQuoteAmount).toBe(50000);
      expect(result?.targetRevenue).toBe(30000);
      expect(result?.targetApprovedQuotes).toBe(10);
    });

    it('retorna null quando a API responde 200 com null (sem meta)', async () => {
      mockClient.get.mockResolvedValue({ data: null });

      const result = await goalsService.getGoal(2026, 8);

      expect(result).toBeNull();
    });
  });

  describe('setGoal', () => {
    it('chama PUT /goals com o payload completo e normaliza a resposta', async () => {
      const payload = {
        year: 2026,
        month: 8,
        targetQuoteAmount: 50000,
        targetRevenue: 30000,
        targetApprovedQuotes: 10,
      };
      mockClient.put.mockResolvedValue({ data: mockGoal });

      const result = await goalsService.setGoal(payload);

      expect(mockClient.put).toHaveBeenCalledWith('/goals', payload);
      expect(result.id).toBe('g-1');
      expect(result.targetQuoteAmount).toBe(50000);
      expect(result.targetRevenue).toBe(30000);
    });
  });

  describe('listGoals', () => {
    it('chama GET /goals/list e normaliza array puro', async () => {
      mockClient.get.mockResolvedValue({ data: [mockGoal] });

      const result = await goalsService.listGoals();

      expect(mockClient.get).toHaveBeenCalledWith('/goals/list');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('g-1');
      expect(result[0].targetQuoteAmount).toBe(50000);
    });

    it('normaliza envelope { data, total }', async () => {
      mockClient.get.mockResolvedValue({
        data: { data: [mockGoal], total: 1 },
      });

      const result = await goalsService.listGoals();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('g-1');
    });
  });

  describe('getPerformance', () => {
    it('chama GET /company/dashboard/performance com year e month e normaliza Decimals', async () => {
      mockClient.get.mockResolvedValue({ data: mockPerformance });

      const result = await goalsService.getPerformance(2026, 8);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/company/dashboard/performance',
        { params: { year: 2026, month: 8 } }
      );
      expect(result.period).toEqual({ year: 2026, month: 8 });
      expect(result.totals.quotesCreated).toBe(12);
      expect(result.totals.approvalRate).toBe(41.67);
      expect(result.goals?.targetQuoteAmount).toBe(50000);
      expect(result.goals?.targetRevenue).toBe(30000);
      expect(result.goals?.approvedQuotesPct).toBe(50);
      expect(result.byMember).toHaveLength(1);
      expect(result.byMember[0].memberName).toBe('João da Silva');
    });

    it('mantém goals com campos null quando não há meta', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          ...mockPerformance,
          goals: {
            targetQuoteAmount: null,
            targetRevenue: null,
            targetApprovedQuotes: null,
            quoteAmountPct: null,
            revenuePct: null,
            approvedQuotesPct: null,
          },
        },
      });

      const result = await goalsService.getPerformance(2026, 8);

      expect(result.goals?.targetQuoteAmount).toBeNull();
      expect(result.goals?.revenuePct).toBeNull();
      expect(result.byMember).toHaveLength(1);
    });

    it('tolera resposta parcial (byMember ausente vira array vazio)', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          period: { year: 2026, month: 8 },
          totals: {
            quotesCreated: 0,
            quotesApproved: 0,
            approvalRate: null,
            revenue: 0,
            followUpsDone: 0,
          },
        },
      });

      const result = await goalsService.getPerformance(2026, 8);

      expect(result.byMember).toEqual([]);
      expect(result.goals).toBeNull();
    });
  });
});
