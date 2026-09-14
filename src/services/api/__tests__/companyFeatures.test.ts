import { getEffectiveFeatures } from '../companyFeatures';
import { getApiClient } from '../client';

jest.mock('../client', () => ({
  getApiClient: jest.fn(),
}));

const mockedGetApiClient = getApiClient as jest.MockedFunction<typeof getApiClient>;

const mockClient = {
  get: jest.fn(),
};

describe('companyFeaturesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
  });

  it('getEffectiveFeatures chama GET /companies/features', async () => {
    const mockFeatures = ['production', 'inventory', 'purchases'];
    mockClient.get.mockResolvedValue({ data: mockFeatures });

    const result = await getEffectiveFeatures();

    expect(mockClient.get).toHaveBeenCalledWith('/companies/features');
    expect(result).toEqual(mockFeatures);
  });

  it('getEffectiveFeatures retorna array vazio quando não há features', async () => {
    mockClient.get.mockResolvedValue({ data: [] });

    const result = await getEffectiveFeatures();

    expect(mockClient.get).toHaveBeenCalledWith('/companies/features');
    expect(result).toEqual([]);
  });

  it('getEffectiveFeatures lança erro quando a requisição falha', async () => {
    mockClient.get.mockRejectedValue(new Error('Network error'));

    await expect(getEffectiveFeatures()).rejects.toThrow('Network error');
  });
});