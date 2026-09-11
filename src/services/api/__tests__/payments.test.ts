import { paymentsService } from '../payments';
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

const mockPayment = {
  id: 'p-1',
  companyId: 'c1',
  clientId: 'cli-1',
  quoteId: null,
  amount: 1500,
  paymentMethod: 'PIX',
  paymentDate: '2026-08-01T10:00:00.000Z',
  dueDate: null,
  status: 'PENDENTE',
  notes: null,
  receiptUrl: null,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
  client: { id: 'cli-1', name: 'João da Silva' },
} as const;

describe('paymentsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
  });

  it('list chama GET /payments com os params de filtro e paginação', async () => {
    mockClient.get.mockResolvedValue({ data: { data: [mockPayment], total: 1 } });

    const result = await paymentsService.list({ status: 'PENDENTE', page: 1, limit: 20 });

    expect(mockClient.get).toHaveBeenCalledWith('/payments', {
      params: { status: 'PENDENTE', page: 1, limit: 20 },
    });
    expect(result).toEqual({ data: [mockPayment], total: 1 });
  });

  it('create chama POST /payments com o payload', async () => {
    const payload = {
      clientId: 'cli-1',
      amount: 1500,
      paymentMethod: 'PIX' as const,
      status: 'PENDENTE' as const,
    };
    mockClient.post.mockResolvedValue({ data: mockPayment });

    const result = await paymentsService.create(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/payments', payload);
    expect(result.id).toBe('p-1');
  });

  it('create chama POST /payments com serviceOrderId quando informado (V3 — pagamento a partir da OS)', async () => {
    const payload = {
      clientId: 'cli-1',
      serviceOrderId: 'so-123',
      amount: 1500,
      paymentMethod: 'PIX' as const,
    };
    mockClient.post.mockResolvedValue({
      data: { ...mockPayment, serviceOrderId: 'so-123' },
    });

    const result = await paymentsService.create(payload);

    expect(mockClient.post).toHaveBeenCalledTimes(1);
    const [url, body] = mockClient.post.mock.calls[0];
    expect(url).toBe('/payments');
    // serviceOrderId presente no body E clientId preservado (não sobrescrito).
    expect(body).toMatchObject({
      clientId: 'cli-1',
      serviceOrderId: 'so-123',
      amount: 1500,
    });
    expect(result.serviceOrderId).toBe('so-123');
  });

  it('update chama PATCH /payments/:id com o payload', async () => {
    const payload = { status: 'CONFIRMADO' as const };
    mockClient.patch.mockResolvedValue({ data: { ...mockPayment, ...payload } });

    const result = await paymentsService.update('p-1', payload);

    expect(mockClient.patch).toHaveBeenCalledWith('/payments/p-1', payload);
    expect(result.status).toBe('CONFIRMADO');
  });

  it('remove chama DELETE /payments/:id', async () => {
    mockClient.delete.mockResolvedValue({});

    await paymentsService.remove('p-1');

    expect(mockClient.delete).toHaveBeenCalledWith('/payments/p-1');
  });
});