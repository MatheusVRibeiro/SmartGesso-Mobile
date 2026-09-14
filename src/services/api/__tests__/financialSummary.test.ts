import { financialSummaryService } from '../financialSummary';
import { getApiClient } from '../client';

jest.mock('../client', () => ({
  getApiClient: jest.fn(),
}));

const mockedGetApiClient = getApiClient as jest.MockedFunction<typeof getApiClient>;

const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

const mockFinancialSummary = {
  contractedValue: 10000,
  additionalApproved: 500,
  totalContracted: 10500,
  received: 6000,
  toReceive: 4500,
  forecastCost: 7000,
  realizedCost: 5500,
  projectedResult: 3500,
  cashResult: 5000,
  margin: 47.6,
} as const;

describe('financialSummaryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
  });

  it('getFinancialSummary chama GET /service-orders/:id/financial-summary', async () => {
    mockClient.get.mockResolvedValue({ data: mockFinancialSummary });

    const result = await financialSummaryService.getFinancialSummary('os-1');

    expect(mockClient.get).toHaveBeenCalledWith(
      '/service-orders/os-1/financial-summary',
    );
    expect(result).toEqual(mockFinancialSummary);
  });

  it('getFinancialSummary retorna os campos tipados do resumo financeiro', async () => {
    mockClient.get.mockResolvedValue({ data: mockFinancialSummary });

    const result = await financialSummaryService.getFinancialSummary('os-1');

    expect(result.contractedValue).toBe(10000);
    expect(result.additionalApproved).toBe(500);
    expect(result.totalContracted).toBe(10500);
    expect(result.received).toBe(6000);
    expect(result.toReceive).toBe(4500);
    expect(result.forecastCost).toBe(7000);
    expect(result.realizedCost).toBe(5500);
    expect(result.projectedResult).toBe(3500);
    expect(result.cashResult).toBe(5000);
    expect(result.margin).toBe(47.6);
  });

  it('getFinancialSummary propaga erro quando a API falha', async () => {
    const apiError = new Error('Network error');
    mockClient.get.mockRejectedValue(apiError);

    await expect(
      financialSummaryService.getFinancialSummary('os-1'),
    ).rejects.toThrow('Network error');

    expect(mockClient.get).toHaveBeenCalledWith(
      '/service-orders/os-1/financial-summary',
    );
  });
});
