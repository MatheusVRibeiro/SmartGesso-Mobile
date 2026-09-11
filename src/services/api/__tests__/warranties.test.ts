import { warrantiesService } from '../warranties';
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

const mockWarranty = {
  id: 'w-1',
  companyId: 'c-1',
  serviceOrderId: 'so-1',
  startDate: '2026-08-24T00:00:00.000Z',
  endDate: '2026-09-24T00:00:00.000Z',
  notes: 'Garantia padrão',
  status: 'ACTIVE' as const,
  createdAt: '2026-08-24T10:00:00.000Z',
  updatedAt: '2026-08-24T10:00:00.000Z',
};

const mockReturn = {
  id: 'r-1',
  companyId: 'c-1',
  serviceOrderId: 'so-1',
  warrantyId: 'w-1',
  reason: 'Defeito',
  description: 'Retorno por defeito',
  status: 'OPEN' as const,
  resolutionNote: null,
  resolvedAt: null,
  createdAt: '2026-08-24T10:00:00.000Z',
  updatedAt: '2026-08-24T10:00:00.000Z',
};

describe('warrantiesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>,
    );
  });

  it('listWarranties chama GET /service-warranties/service-orders/:id/warranty', async () => {
    const data = { data: [mockWarranty], total: 1 };
    mockClient.get.mockResolvedValue({ data });

    const result = await warrantiesService.listWarranties('so-1');

    expect(mockClient.get).toHaveBeenCalledWith('/service-warranties/service-orders/so-1/warranty');
    expect(result).toEqual(data);
  });

  it('createWarranty chama POST com warrantyDays', async () => {
    mockClient.post.mockResolvedValue({ data: mockWarranty });
    const payload = { warrantyDays: 30, notes: 'Teste' };

    await warrantiesService.createWarranty('so-1', payload);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/service-warranties/service-orders/so-1/warranty',
      payload,
    );
  });

  it('updateWarrantyStatus chama PATCH com status', async () => {
    mockClient.patch.mockResolvedValue({ data: mockWarranty });
    await warrantiesService.updateWarrantyStatus('w-1', 'EXPIRED');

    expect(mockClient.patch).toHaveBeenCalledWith(
      '/service-warranties/service-warranties/w-1/status',
      { status: 'EXPIRED' },
    );
  });

  it('listReturns chama GET /service-warranties/service-orders/:id/returns', async () => {
    const data = { data: [mockReturn], total: 1 };
    mockClient.get.mockResolvedValue({ data });

    const result = await warrantiesService.listReturns('so-1');

    expect(mockClient.get).toHaveBeenCalledWith('/service-warranties/service-orders/so-1/returns');
    expect(result).toEqual(data);
  });

  it('createReturn chama POST com reason', async () => {
    mockClient.post.mockResolvedValue({ data: mockReturn });
    const payload = { reason: 'Problema', warrantyId: 'w-1' };

    await warrantiesService.createReturn('so-1', payload);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/service-warranties/service-orders/so-1/returns',
      payload,
    );
  });

  it('updateReturnStatus chama PATCH com status e resolutionNote', async () => {
    mockClient.patch.mockResolvedValue({ data: mockReturn });
    await warrantiesService.updateReturnStatus('r-1', 'RESOLVED', 'Consertado');

    expect(mockClient.patch).toHaveBeenCalledWith(
      '/service-warranties/service-returns/r-1/status',
      { status: 'RESOLVED', resolutionNote: 'Consertado' },
    );
  });

  it('propaga erro quando a API falha', async () => {
    mockClient.get.mockRejectedValue(new Error('Network error'));
    await expect(warrantiesService.listWarranties('so-1')).rejects.toThrow('Network error');
  });
});
