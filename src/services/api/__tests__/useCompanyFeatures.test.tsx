import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCompanyFeatures } from '../companyFeatures';
import { getApiClient } from '../client';

jest.mock('../client', () => ({
  getApiClient: jest.fn(),
}));

const mockedGetApiClient = getApiClient as jest.MockedFunction<typeof getApiClient>;

const mockClient = {
  get: jest.fn(),
};

let queryClient: QueryClient;

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCompanyFeatures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetApiClient.mockReturnValue(
      mockClient as unknown as ReturnType<typeof getApiClient>
    );
    // retry: false no client — o hook define retry: 1 explicitamente, que
    // prevalece sobre o default (ver teste de erro). gcTime: 0 para não
    // deixar timers de garbage collection vazando entre testes.
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  afterEach(() => {
    // Evita timers do gcTime vazando entre testes (worker não finaliza).
    queryClient.clear();
  });

  it('inicia em loading e retorna features após sucesso', async () => {
    mockClient.get.mockResolvedValue({ data: ['production', 'inventory'] });

    const { result } = renderHook(() => useCompanyFeatures(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(['production', 'inventory']);
    expect(mockClient.get).toHaveBeenCalledWith('/companies/features');
  });

  it('retorna array vazio quando não há features', async () => {
    mockClient.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useCompanyFeatures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('propaga erro quando a requisição falha', async () => {
    mockClient.get.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCompanyFeatures(), {
      wrapper: createWrapper(),
    });

    // O hook define retry: 1 (1 tentativa extra com ~1s de backoff) —
    // aguardar além do timeout padrão do waitFor.
    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });
});
