import { purchaseOrdersService } from '../purchaseOrders';
import { getApiClient } from '../client';

jest.mock('../client', () => ({
  getApiClient: jest.fn(),
}));

const mockedGetApiClient = getApiClient as jest.MockedFunction<
  typeof getApiClient
>;

const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

const mockPurchaseOrderItem = {
  id: 'poi-1',
  productId: 'prod-1',
  productName: 'Gesso hidráulico 30cm',
  quantity: 10,
  unitPrice: 15.5,
  total: 155,
};

const mockPurchaseOrder = {
  id: 'po-1',
  companyId: 'c1',
  supplierId: 'sup-1',
  supplierName: 'Fornecedor Gesso & Cia',
  serviceOrderId: 'os-1',
  status: 'DRAFT',
  items: [mockPurchaseOrderItem],
  total: 155,
  notes: 'Pedido de material para obra X',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
} as const;

describe('purchaseOrdersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>,
    );
  });

  it('list chama GET /purchase-orders com os params de busca e paginação', async () => {
    mockClient.get.mockResolvedValue({
      data: { data: [mockPurchaseOrder], total: 1 },
    });

    const result = await purchaseOrdersService.list({
      search: 'gesso',
      page: 1,
      limit: 20,
    });

    expect(mockClient.get).toHaveBeenCalledWith('/purchase-orders', {
      params: { search: 'gesso', page: 1, limit: 20 },
    });
    expect(result).toEqual({ data: [mockPurchaseOrder], total: 1 });
  });

  it('list retorna os campos tipados do pedido de compra', async () => {
    mockClient.get.mockResolvedValue({
      data: { data: [mockPurchaseOrder], total: 1 },
    });

    const result = await purchaseOrdersService.list();

    expect(result.data[0].id).toBe('po-1');
    expect(result.data[0].companyId).toBe('c1');
    expect(result.data[0].supplierId).toBe('sup-1');
    expect(result.data[0].supplierName).toBe('Fornecedor Gesso & Cia');
    expect(result.data[0].serviceOrderId).toBe('os-1');
    expect(result.data[0].status).toBe('DRAFT');
    expect(result.data[0].items[0].id).toBe('poi-1');
    expect(result.data[0].items[0].productId).toBe('prod-1');
    expect(result.data[0].items[0].productName).toBe('Gesso hidráulico 30cm');
    expect(result.data[0].items[0].quantity).toBe(10);
    expect(result.data[0].items[0].unitPrice).toBe(15.5);
    expect(result.data[0].items[0].total).toBe(155);
    expect(result.data[0].total).toBe(155);
    expect(result.data[0].notes).toBe('Pedido de material para obra X');
    expect(result.total).toBe(1);
  });

  it('create chama POST /purchase-orders com o payload', async () => {
    const payload = {
      supplierId: 'sup-1',
      items: [
        {
          productId: 'prod-1',
          productName: 'Gesso hidráulico 30cm',
          quantity: 10,
          unitPrice: 15.5,
        },
      ],
      notes: 'Pedido de material para obra X',
    };
    mockClient.post.mockResolvedValue({ data: mockPurchaseOrder });

    const result = await purchaseOrdersService.create(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/purchase-orders', payload);
    expect(result.id).toBe('po-1');
    expect(result.status).toBe('DRAFT');
  });

  it('updateStatus chama PATCH /purchase-orders/:id/status com o status', async () => {
    mockClient.patch.mockResolvedValue({
      data: { ...mockPurchaseOrder, status: 'RECEIVED' },
    });

    const result = await purchaseOrdersService.updateStatus('po-1', {
      status: 'RECEIVED',
    });

    expect(mockClient.patch).toHaveBeenCalledWith(
      '/purchase-orders/po-1/status',
      { status: 'RECEIVED' },
    );
    expect(result.status).toBe('RECEIVED');
  });

  it('list propaga erro quando a API falha', async () => {
    const apiError = new Error('Network error');
    mockClient.get.mockRejectedValue(apiError);

    await expect(purchaseOrdersService.list()).rejects.toThrow('Network error');

    expect(mockClient.get).toHaveBeenCalledWith('/purchase-orders', {
      params: undefined,
    });
  });

  it('create propaga erro quando a API falha', async () => {
    const apiError = new Error('Validation error');
    mockClient.post.mockRejectedValue(apiError);

    await expect(
      purchaseOrdersService.create({
        supplierId: 'sup-1',
        items: [
          {
            productName: 'Material',
            quantity: 5,
            unitPrice: 10,
          },
        ],
      }),
    ).rejects.toThrow('Validation error');

    expect(mockClient.post).toHaveBeenCalledWith('/purchase-orders', {
      supplierId: 'sup-1',
      items: [
        {
          productName: 'Material',
          quantity: 5,
          unitPrice: 10,
        },
      ],
    });
  });

  it('updateStatus propaga erro quando a API falha', async () => {
    const apiError = new Error('Network error');
    mockClient.patch.mockRejectedValue(apiError);

    await expect(
      purchaseOrdersService.updateStatus('po-1', { status: 'CANCELLED' }),
    ).rejects.toThrow('Network error');

    expect(mockClient.patch).toHaveBeenCalledWith(
      '/purchase-orders/po-1/status',
      { status: 'CANCELLED' },
    );
  });
});
