import { renderHook, act } from '@testing-library/react-native';
import { useCepLookup } from '../useCepLookup';
import * as cepApi from '../../services/api/cep';

jest.mock('../../services/api/cep', () => {
  const actual = jest.requireActual('../../services/api/cep');
  return {
    ...actual,
    fetchAddressByCep: jest.fn(),
  };
});

const mockFetchAddressByCep = cepApi.fetchAddressByCep as jest.MockedFunction<
  typeof cepApi.fetchAddressByCep
>;

describe('useCepLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicia com estados padrão limpos', async () => {
    const { result } = await renderHook(() => useCepLookup());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('busca endereço com sucesso e dispara callback onFound', async () => {
    const mockAddress: cepApi.CepAddress = {
      cep: '01310-100',
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      complement: 'lado ímpar',
    };

    mockFetchAddressByCep.mockResolvedValueOnce(mockAddress);
    const onFound = jest.fn();

    const { result } = await renderHook(() => useCepLookup());

    let returnedAddress: cepApi.CepAddress | null = null;
    await act(async () => {
      returnedAddress = await result.current.searchCep('01310-100', onFound);
    });

    expect(mockFetchAddressByCep).toHaveBeenCalledWith('01310100');
    expect(onFound).toHaveBeenCalledWith(mockAddress);
    expect(returnedAddress).toEqual(mockAddress);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('define mensagem de erro quando CEP não é encontrado', async () => {
    mockFetchAddressByCep.mockResolvedValueOnce(null);
    const onFound = jest.fn();

    const { result } = await renderHook(() => useCepLookup());

    await act(async () => {
      await result.current.searchCep('99999-999', onFound);
    });

    expect(onFound).not.toHaveBeenCalled();
    expect(result.current.error).toBe('CEP não encontrado');
    expect(result.current.isLoading).toBe(false);
  });

  it('handleCepChange dispara busca apenas quando completar 8 dígitos', async () => {
    const mockAddress: cepApi.CepAddress = {
      cep: '01310-100',
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    };

    mockFetchAddressByCep.mockResolvedValueOnce(mockAddress);
    const onFound = jest.fn();
    const onTextChange = jest.fn();

    const { result } = await renderHook(() => useCepLookup());

    // Digitando 5 dígitos (incompleto)
    await act(async () => {
      result.current.handleCepChange('01310', onFound, onTextChange);
    });

    expect(onTextChange).toHaveBeenCalledWith('01310');
    expect(mockFetchAddressByCep).not.toHaveBeenCalled();

    // Completando 8 dígitos
    await act(async () => {
      result.current.handleCepChange('01310-100', onFound, onTextChange);
    });

    expect(onTextChange).toHaveBeenCalledWith('01310-100');
    expect(mockFetchAddressByCep).toHaveBeenCalledWith('01310100');
    expect(onFound).toHaveBeenCalledWith(mockAddress);
  });

  it('limpa o erro quando clearError é chamado', async () => {
    mockFetchAddressByCep.mockResolvedValueOnce(null);

    const { result } = await renderHook(() => useCepLookup());

    await act(async () => {
      await result.current.searchCep('99999-999');
    });

    expect(result.current.error).toBe('CEP não encontrado');

    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
