import { serviceAdditionalsService } from '../serviceAdditionals';
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

const mockAdditional = {
  id: 'ad-1',
  companyId: 'c1',
  serviceOrderId: 'os-1',
  code: 2,
  description: 'Adicional de iluminação externa',
  amount: 850,
  estimatedCost: 500,
  status: 'APPROVED',
  approvedAt: '2026-08-10T14:30:00.000Z',
  rejectedAt: null,
  notes: 'Aprovado pelo cliente via WhatsApp',
  createdAt: '2026-08-05T10:00:00.000Z',
  updatedAt: '2026-08-10T14:30:00.000Z',
} as const;

describe('serviceAdditionalsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>,
    );
  });

  it('listAdditionals chama GET /service-orders/:serviceOrderId/additionals', async () => {
    mockClient.get.mockResolvedValue({
      data: { data: [mockAdditional], total: 1 },
    });

    const result = await serviceAdditionalsService.listAdditionals('os-1');

    expect(mockClient.get).toHaveBeenCalledWith(
      '/service-orders/os-1/additionals',
    );
    expect(result).toEqual({ data: [mockAdditional], total: 1 });
  });

  it('listAdditionals retorna os campos tipados do aditivo', async () => {
    mockClient.get.mockResolvedValue({
      data: { data: [mockAdditional], total: 1 },
    });

    const result = await serviceAdditionalsService.listAdditionals('os-1');

    expect(result.data[0].id).toBe('ad-1');
    expect(result.data[0].companyId).toBe('c1');
    expect(result.data[0].serviceOrderId).toBe('os-1');
    expect(result.data[0].code).toBe(2);
    expect(result.data[0].description).toBe('Adicional de iluminação externa');
    expect(result.data[0].amount).toBe(850);
    expect(result.data[0].estimatedCost).toBe(500);
    expect(result.data[0].status).toBe('APPROVED');
    expect(result.data[0].approvedAt).toBe('2026-08-10T14:30:00.000Z');
    expect(result.data[0].rejectedAt).toBeNull();
    expect(result.data[0].notes).toBe('Aprovado pelo cliente via WhatsApp');
    expect(result.total).toBe(1);
  });

  it('createAdditional chama POST /service-orders/:serviceOrderId/additionals com o payload', async () => {
    const payload = {
      code: 3,
      description: 'Adicional de revestimento',
      amount: 1200,
      estimatedCost: 700,
      notes: 'Solicitado pelo cliente',
    };
    mockClient.post.mockResolvedValue({ data: mockAdditional });

    const result = await serviceAdditionalsService.createAdditional('os-1', payload);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/service-orders/os-1/additionals',
      payload,
    );
    expect(result.id).toBe('ad-1');
  });

  it('createAdditional envia apenas os campos obrigatórios quando opcionais são omitidos', async () => {
    const payload = {
      code: 4,
      description: 'Adicional de pintura',
      amount: 600,
    };
    mockClient.post.mockResolvedValue({ data: mockAdditional });

    await serviceAdditionalsService.createAdditional('os-1', payload);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/service-orders/os-1/additionals',
      payload,
    );
  });

  it('updateAdditionalStatus chama PATCH /service-orders/:serviceOrderId/additionals/:id/status com o status', async () => {
    mockClient.patch.mockResolvedValue({
      data: { ...mockAdditional, status: 'SENT' },
    });

    const result = await serviceAdditionalsService.updateAdditionalStatus(
      'os-1',
      'ad-1',
      'SENT',
    );

    expect(mockClient.patch).toHaveBeenCalledWith(
      '/service-orders/os-1/additionals/ad-1/status',
      { status: 'SENT' },
    );
    expect(result.status).toBe('SENT');
  });

  it('updateAdditionalStatus propaga erro quando a API falha', async () => {
    const apiError = new Error('Network error');
    mockClient.patch.mockRejectedValue(apiError);

    await expect(
      serviceAdditionalsService.updateAdditionalStatus('os-1', 'ad-1', 'CANCELLED'),
    ).rejects.toThrow('Network error');

    expect(mockClient.patch).toHaveBeenCalledWith(
      '/service-orders/os-1/additionals/ad-1/status',
      { status: 'CANCELLED' },
    );
  });

  it('listAdditionals propaga erro quando a API falha', async () => {
    const apiError = new Error('Network error');
    mockClient.get.mockRejectedValue(apiError);

    await expect(
      serviceAdditionalsService.listAdditionals('os-1'),
    ).rejects.toThrow('Network error');

    expect(mockClient.get).toHaveBeenCalledWith(
      '/service-orders/os-1/additionals',
    );
  });

  it('createAdditional propaga erro quando a API falha', async () => {
    const apiError = new Error('Validation error');
    mockClient.post.mockRejectedValue(apiError);

    await expect(
      serviceAdditionalsService.createAdditional('os-1', {
        code: 5,
        description: 'Teste',
        amount: 100,
      }),
    ).rejects.toThrow('Validation error');

    expect(mockClient.post).toHaveBeenCalledWith(
      '/service-orders/os-1/additionals',
      { code: 5, description: 'Teste', amount: 100 },
    );
  });
});
