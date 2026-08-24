import { suppliersService } from '../suppliers';
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

const mockSupplier = {
  id: 'sup-1',
  companyId: 'c1',
  name: 'Fornecedor Gesso & Cia',
  cnpjCpf: '00.000.000/0001-00',
  phone: '(11) 99999-0000',
  email: 'contato@gessocia.com',
  address: 'Rua do Gesso, 123 - São Paulo, SP',
  notes: 'Fornecedor preferencial',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
} as const;

describe('suppliersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>,
    );
  });

  it('list chama GET /suppliers com os params de busca e paginação', async () => {
    mockClient.get.mockResolvedValue({
      data: { data: [mockSupplier], total: 1 },
    });

    const result = await suppliersService.list({
      search: 'gesso',
      page: 2,
      limit: 10,
    });

    expect(mockClient.get).toHaveBeenCalledWith('/suppliers', {
      params: { search: 'gesso', page: 2, limit: 10 },
    });
    expect(result).toEqual({ data: [mockSupplier], total: 1 });
  });

  it('list retorna os campos tipados do fornecedor', async () => {
    mockClient.get.mockResolvedValue({
      data: { data: [mockSupplier], total: 1 },
    });

    const result = await suppliersService.list();

    expect(result.data[0].id).toBe('sup-1');
    expect(result.data[0].companyId).toBe('c1');
    expect(result.data[0].name).toBe('Fornecedor Gesso & Cia');
    expect(result.data[0].cnpjCpf).toBe('00.000.000/0001-00');
    expect(result.data[0].phone).toBe('(11) 99999-0000');
    expect(result.data[0].email).toBe('contato@gessocia.com');
    expect(result.data[0].address).toBe(
      'Rua do Gesso, 123 - São Paulo, SP',
    );
    expect(result.data[0].notes).toBe('Fornecedor preferencial');
    expect(result.total).toBe(1);
  });

  it('create chama POST /suppliers com o payload', async () => {
    const payload = {
      name: 'Novo Fornecedor',
      cnpjCpf: '11.111.111/1111-11',
      email: 'novo@fornecedor.com',
    };
    mockClient.post.mockResolvedValue({ data: { ...mockSupplier, ...payload } });

    const result = await suppliersService.create(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/suppliers', payload);
    expect(result.name).toBe('Novo Fornecedor');
  });

  it('create envia apenas os campos obrigatórios quando opcionais são omitidos', async () => {
    const payload = { name: 'Fornecedor Básico' };
    mockClient.post.mockResolvedValue({ data: { ...mockSupplier, ...payload } });

    await suppliersService.create(payload);

    expect(mockClient.post).toHaveBeenCalledWith('/suppliers', payload);
  });

  it('update chama PATCH /suppliers/:id com o payload', async () => {
    const payload = { name: 'Fornecedor Atualizado', notes: 'Observação editada' };
    mockClient.patch.mockResolvedValue({ data: { ...mockSupplier, ...payload } });

    const result = await suppliersService.update('sup-1', payload);

    expect(mockClient.patch).toHaveBeenCalledWith('/suppliers/sup-1', payload);
    expect(result.name).toBe('Fornecedor Atualizado');
    expect(result.notes).toBe('Observação editada');
  });

  it('list propaga erro quando a API falha', async () => {
    const apiError = new Error('Network error');
    mockClient.get.mockRejectedValue(apiError);

    await expect(suppliersService.list()).rejects.toThrow('Network error');

    expect(mockClient.get).toHaveBeenCalledWith('/suppliers', {
      params: undefined,
    });
  });

  it('create propaga erro quando a API falha', async () => {
    const apiError = new Error('Validation error');
    mockClient.post.mockRejectedValue(apiError);

    await expect(
      suppliersService.create({ name: 'Fornecedor Erro' }),
    ).rejects.toThrow('Validation error');

    expect(mockClient.post).toHaveBeenCalledWith('/suppliers', {
      name: 'Fornecedor Erro',
    });
  });

  it('update propaga erro quando a API falha', async () => {
    const apiError = new Error('Network error');
    mockClient.patch.mockRejectedValue(apiError);

    await expect(
      suppliersService.update('sup-1', { name: 'Erro' }),
    ).rejects.toThrow('Network error');

    expect(mockClient.patch).toHaveBeenCalledWith('/suppliers/sup-1', {
      name: 'Erro',
    });
  });
});
