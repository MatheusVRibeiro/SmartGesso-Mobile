import { quotesService } from '../quotes';
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

const mockQuoteSummary = {
  id: 'q-1',
  quoteNumber: 1,
  version: 1,
  status: 'RASCUNHO',
  total: 1500,
  paymentMethod: 'AVISTA',
  createdAt: '2026-08-01T10:00:00.000Z',
  client: { id: 'cli-1', name: 'João da Silva' },
} as const;

const mockQuote = {
  id: 'q-1',
  companyId: 'c1',
  clientId: 'cli-1',
  workId: null,
  quoteNumber: 1,
  version: 1,
  status: 'RASCUNHO',
  subtotal: 1500,
  discount: 0,
  marginPct: 0,
  total: 1500,
  paymentMethod: 'AVISTA',
  observations: null,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
  items: [],
} as const;

describe('quotesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
  });

  it('list chama GET /quotes', async () => {
    mockClient.get.mockResolvedValue({ data: [mockQuoteSummary] });

    const result = await quotesService.list();

    expect(mockClient.get).toHaveBeenCalledWith('/quotes');
    expect(result).toEqual([mockQuoteSummary]);
  });

  it('create chama POST /quotes com o payload', async () => {
    const payload = {
      clientId: 'cli-1',
      paymentMethod: 'AVISTA' as const,
      items: [{ itemType: 'SERVICO' as const, name: 'Instalação', quantity: 1, unitPrice: 1500 }],
    };
    mockClient.post.mockResolvedValue({ data: mockQuote });

    const result = await quotesService.create(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/quotes', payload);
    expect(result.id).toBe('q-1');
  });

  it('generateVersion chama POST /quotes/:id/version', async () => {
    mockClient.post.mockResolvedValue({ data: { ...mockQuote, version: 2 } });

    const result = await quotesService.generateVersion('q-1');

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/version');
    expect(result.version).toBe(2);
  });

  it('approve chama POST /quotes/:id/approve', async () => {
    mockClient.post.mockResolvedValue({ data: { ...mockQuote, status: 'APROVADO' } });

    const result = await quotesService.approve('q-1');

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/approve');
    expect(result.status).toBe('APROVADO');
  });

  it('reject chama POST /quotes/:id/reject com a nota', async () => {
    mockClient.post.mockResolvedValue({ data: { ...mockQuote, status: 'REJEITADO' } });

    const result = await quotesService.reject('q-1', 'Cliente pediu desconto');

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/reject', {
      note: 'Cliente pediu desconto',
    });
    expect(result.status).toBe('REJEITADO');
  });

  it('reject envia nota undefined quando omitida', async () => {
    mockClient.post.mockResolvedValue({ data: { ...mockQuote, status: 'REJEITADO' } });

    await quotesService.reject('q-1');

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/reject', {
      note: undefined,
    });
  });

  it('duplicate chama POST /quotes/:id/duplicate e retorna o novo orçamento', async () => {
    const duplicated = { ...mockQuote, id: 'q-2', quoteNumber: 2, status: 'RASCUNHO' };
    mockClient.post.mockResolvedValue({ data: duplicated });

    const result = await quotesService.duplicate('q-1');

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/duplicate');
    expect(result.id).toBe('q-2');
    expect(result.status).toBe('RASCUNHO');
  });

  it('convertToService chama POST /quotes/:id/convert-to-service', async () => {
    const converted = {
      serviceOrderId: 'os-1',
      code: 1,
      status: 'PENDENTE',
      clientId: 'cli-1',
      workId: null,
      scheduledDate: null,
      saleValue: 1500,
      observations: null,
    };
    mockClient.post.mockResolvedValue({ data: converted });

    const result = await quotesService.convertToService('q-1');

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/convert-to-service');
    expect(result.serviceOrderId).toBe('os-1');
  });

  it('getPdf chama GET /quotes/:id/pdf com responseType blob', async () => {
    mockClient.get.mockResolvedValue({ data: {} as Blob });

    await quotesService.getPdf('q-1');

    expect(mockClient.get).toHaveBeenCalledWith('/quotes/q-1/pdf', {
      responseType: 'blob',
    });
  });
});