import { renderHook, act } from '@testing-library/react-native';
import { useCnpjLookup } from '../useCnpjLookup';
import * as cnpjApi from '../../services/api/cnpj';

jest.mock('../../services/api/cnpj', () => {
  const actual = jest.requireActual('../../services/api/cnpj');
  return {
    ...actual,
    fetchCompanyByCnpj: jest.fn(),
  };
});

const mockFetchCompany = cnpjApi.fetchCompanyByCnpj as jest.MockedFunction<
  typeof cnpjApi.fetchCompanyByCnpj
>;

describe('useCnpjLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicia com estados padrao limpos', async () => {
    const { result } = await renderHook(() => useCnpjLookup());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('busca CNPJ com sucesso e chama onFound', async () => {
    const mockData: cnpjApi.CnpjCompanyData = {
      cnpj: '00000000000191',
      razaoSocial: 'BANCO DO BRASIL SA',
      nomeFantasia: 'DIRECAO GERAL',
      uf: 'DF',
    };

    mockFetchCompany.mockResolvedValueOnce(mockData);
    const onFound = jest.fn();

    const { result } = await renderHook(() => useCnpjLookup());

    let returned: cnpjApi.CnpjCompanyData | null = null;
    await act(async () => {
      returned = await result.current.searchCnpj('00.000.000/0001-91', onFound);
    });

    expect(mockFetchCompany).toHaveBeenCalledWith('00000000000191');
    expect(onFound).toHaveBeenCalledWith(mockData);
    expect(returned).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('define mensagem de erro quando CNPJ nao e encontrado', async () => {
    mockFetchCompany.mockResolvedValueOnce(null);
    const onFound = jest.fn();

    const { result } = await renderHook(() => useCnpjLookup());

    await act(async () => {
      await result.current.searchCnpj('11111111000199', onFound);
    });

    expect(onFound).not.toHaveBeenCalled();
    expect(result.current.error).toBe('CNPJ não encontrado na Receita Federal');
    expect(result.current.isLoading).toBe(false);
  });

  it('handleCnpjChange dispara busca apenas quando completar 14 digitos', async () => {
    const mockData: cnpjApi.CnpjCompanyData = {
      cnpj: '00000000000191',
      razaoSocial: 'BANCO DO BRASIL SA',
    };
    mockFetchCompany.mockResolvedValueOnce(mockData);

    const onFound = jest.fn();
    const onTextChange = jest.fn();

    const { result } = await renderHook(() => useCnpjLookup());

    // 10 digitos (incompleto)
    await act(async () => {
      result.current.handleCnpjChange('0000000000', onFound, onTextChange);
    });
    expect(onTextChange).toHaveBeenCalledWith('0000000000');
    expect(mockFetchCompany).not.toHaveBeenCalled();

    // 14 digitos completos
    await act(async () => {
      result.current.handleCnpjChange('00.000.000/0001-91', onFound, onTextChange);
    });
    expect(mockFetchCompany).toHaveBeenCalledWith('00000000000191');
    expect(onFound).toHaveBeenCalledWith(mockData);
  });
});
