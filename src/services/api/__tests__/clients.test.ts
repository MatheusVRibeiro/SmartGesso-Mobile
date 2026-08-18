import { clientsService } from '../clients';
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

const mockClientRecord = {
  id: 'cli-1',
  companyId: 'c1',
  type: 'FISICA',
  name: 'João da Silva',
  document: '123.456.789-00',
  email: 'joao@test.com',
  phone: '(11) 99999-0000',
  whatsapp: '(11) 99999-0000',
  observations: null,
  status: 'ACTIVE',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
} as const;

describe('clientsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
  });

  it('list chama GET /clients com os params de busca e paginação', async () => {
    mockClient.get.mockResolvedValue({ data: { data: [mockClientRecord], total: 1 } });

    const result = await clientsService.list({ search: 'joao', page: 2, limit: 10 });

    expect(mockClient.get).toHaveBeenCalledWith('/clients', {
      params: { search: 'joao', page: 2, limit: 10 },
    });
    expect(result).toEqual({ data: [mockClientRecord], total: 1 });
  });

  it('getById chama GET /clients/:id', async () => {
    mockClient.get.mockResolvedValue({ data: mockClientRecord });

    const result = await clientsService.getById('cli-1');

    expect(mockClient.get).toHaveBeenCalledWith('/clients/cli-1');
    expect(result).toEqual(mockClientRecord);
  });

  it('create chama POST /clients com o payload', async () => {
    const payload = { type: 'JURIDICA' as const, name: 'Gesso & Cia Ltda', document: '00.000.000/0001-00' };
    mockClient.post.mockResolvedValue({ data: { ...mockClientRecord, ...payload } });

    const result = await clientsService.create(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/clients', payload);
    expect(result.name).toBe('Gesso & Cia Ltda');
  });

  it('update chama PATCH /clients/:id com o payload', async () => {
    const payload = { name: 'João da Silva Atualizado' };
    mockClient.patch.mockResolvedValue({ data: { ...mockClientRecord, ...payload } });

    const result = await clientsService.update('cli-1', payload);

    expect(mockClient.patch).toHaveBeenCalledWith('/clients/cli-1', payload);
    expect(result.name).toBe('João da Silva Atualizado');
  });

  it('remove chama DELETE /clients/:id', async () => {
    mockClient.delete.mockResolvedValue({});

    await clientsService.remove('cli-1');

    expect(mockClient.delete).toHaveBeenCalledWith('/clients/cli-1');
  });
});