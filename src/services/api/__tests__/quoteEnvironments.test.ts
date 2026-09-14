import { quoteEnvironmentsService } from '../quoteEnvironments';
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

const mockEnvironment = {
  id: 'env-1',
  companyId: 'c1',
  quoteId: 'q-1',
  name: 'Sala de Estar',
  description: 'Ambiente principal',
  order: 1,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
} as const;

const mockMeasurement = {
  id: 'm-1',
  environmentId: 'env-1',
  area: 25.5,
  perimeter: 20,
  length: 5,
  width: 4,
  height: 3,
  observations: 'Parede com infiltração',
  createdAt: '2026-08-01T10:00:00.000Z',
} as const;

describe('quoteEnvironmentsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
  });

  it('listEnvironments chama GET /quotes/:quoteId/environments', async () => {
    mockClient.get.mockResolvedValue({ data: [mockEnvironment] });

    const result = await quoteEnvironmentsService.listEnvironments('q-1');

    expect(mockClient.get).toHaveBeenCalledWith('/quotes/q-1/environments');
    expect(result).toEqual([mockEnvironment]);
  });

  it('createEnvironment chama POST /quotes/:quoteId/environments com o payload', async () => {
    const payload = { name: 'Cozinha', description: 'Ambiente de cozinha', order: 2 };
    mockClient.post.mockResolvedValue({ data: { ...mockEnvironment, ...payload } });

    const result = await quoteEnvironmentsService.createEnvironment('q-1', payload);

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/environments', payload);
    expect(result.name).toBe('Cozinha');
  });

  it('updateEnvironment chama PATCH /quotes/:quoteId/environments/:environmentId com o payload', async () => {
    const payload = { name: 'Sala Atualizada' };
    mockClient.patch.mockResolvedValue({ data: { ...mockEnvironment, ...payload } });

    const result = await quoteEnvironmentsService.updateEnvironment('q-1', 'env-1', payload);

    expect(mockClient.patch).toHaveBeenCalledWith('/quotes/q-1/environments/env-1', payload);
    expect(result.name).toBe('Sala Atualizada');
  });

  it('removeEnvironment chama DELETE /quotes/:quoteId/environments/:environmentId', async () => {
    mockClient.delete.mockResolvedValue({});

    await quoteEnvironmentsService.removeEnvironment('q-1', 'env-1');

    expect(mockClient.delete).toHaveBeenCalledWith('/quotes/q-1/environments/env-1');
  });

  it('addMeasurement chama POST /quotes/:quoteId/environments/:environmentId/measurements com o payload', async () => {
    const payload = { area: 30, length: 6, width: 5, height: 2.8 };
    mockClient.post.mockResolvedValue({ data: { ...mockMeasurement, ...payload } });

    const result = await quoteEnvironmentsService.addMeasurement('q-1', 'env-1', payload);

    expect(mockClient.post).toHaveBeenCalledWith('/quotes/q-1/environments/env-1/measurements', payload);
    expect(result.area).toBe(30);
  });

  it('updateMeasurement chama PATCH /quotes/:quoteId/environments/:environmentId/measurements/:id com o payload', async () => {
    const payload = { height: 3.2 };
    mockClient.patch.mockResolvedValue({ data: { ...mockMeasurement, ...payload } });

    const result = await quoteEnvironmentsService.updateMeasurement('q-1', 'env-1', 'm-1', payload);

    expect(mockClient.patch).toHaveBeenCalledWith('/quotes/q-1/environments/env-1/measurements/m-1', payload);
    expect(result.height).toBe(3.2);
  });
});
