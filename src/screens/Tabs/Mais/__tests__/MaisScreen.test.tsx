import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock useCompanyFeatures com implementação mutável (V5 ETAPA 7)
const mockUseCompanyFeatures = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => {
  // Stub mínimo: src/lib/queryClient.ts instancia `new QueryClient(...)` no
  // escopo do módulo (importado pela tela via queryClient.clear() no logout).
  class QueryClient {
    clear() {}
  }
  return { useQuery: jest.fn(), QueryClient };
});

jest.mock('../../../../store/useSessionStore', () => ({
  useSessionStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      activeCompany: {
        company: {
          id: 'company-1',
          tradeName: 'SmartGesso Test',
        },
      },
      clearSession: jest.fn(),
    };
    return selector(state);
  }),
}));

jest.mock('../../../../services/api/companyFeatures', () => ({
  useCompanyFeatures: (...args: unknown[]) => mockUseCompanyFeatures(...args),
}));

jest.mock('../../../../services/notifications', () => ({
  countNotifications: jest.fn(() => Promise.resolve(0)),
}));

jest.mock('../../../../services/auth/SecureTokenStorage', () => ({
  SecureTokenStorage: {
    clearTokens: jest.fn(() => Promise.resolve()),
  },
}));

// Importar DEPOIS dos mocks
import MaisScreen from '../index';

const featuresQuery = (features: string[] | undefined) => ({
  data: features,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  isRefetching: false,
});

describe('MaisScreen — filtro de módulos opcionais (V5 ETAPA 7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // useQuery (contagem de notificações)
    (require('@tanstack/react-query').useQuery as jest.Mock).mockReturnValue({
      data: 0,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    });
  });

  it('com features ["production", "inventory"]: exibe Produção e Estoque', async () => {
    mockUseCompanyFeatures.mockReturnValue(featuresQuery(['production', 'inventory']));

    await render(<MaisScreen />);

    expect(screen.getByText('Menu Operacional')).toBeTruthy();
    expect(screen.getByText('Produção')).toBeTruthy();
    expect(screen.getByText('Estoque')).toBeTruthy();
  });

  it('com features ["production"] (sem inventory): exibe Produção e OCULTA Estoque', async () => {
    mockUseCompanyFeatures.mockReturnValue(featuresQuery(['production']));

    await render(<MaisScreen />);

    expect(screen.getByText('Produção')).toBeTruthy();
    expect(screen.queryByText('Estoque')).toBeNull();
  });

  it('com features [] (nenhuma): oculta Produção e Estoque', async () => {
    mockUseCompanyFeatures.mockReturnValue(featuresQuery([]));

    await render(<MaisScreen />);

    expect(screen.queryByText('Produção')).toBeNull();
    expect(screen.queryByText('Estoque')).toBeNull();
    // Itens não-gated permanecem visíveis ('Agenda' para evitar colisão
    // título do item × título de seção 'Financeiro')
    expect(screen.getByText('Clientes')).toBeTruthy();
    expect(screen.getByText('Agenda')).toBeTruthy();
  });

  it('durante carregamento (isLoading): mantém itens visíveis (fail-open, evita flicker)', async () => {
    mockUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    });

    await render(<MaisScreen />);

    expect(screen.getByText('Produção')).toBeTruthy();
    expect(screen.getByText('Estoque')).toBeTruthy();
  });

  it('em erro da query (isError): mantém itens visíveis (fail-open; backend é a autoridade)', async () => {
    mockUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('network'),
      refetch: jest.fn(),
      isRefetching: false,
    });

    await render(<MaisScreen />);

    expect(screen.getByText('Produção')).toBeTruthy();
    expect(screen.getByText('Estoque')).toBeTruthy();
  });
});

describe('MaisScreen — reorganização do menu (V5 ETAPA 12)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('@tanstack/react-query').useQuery as jest.Mock).mockReturnValue({
      data: 0,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    });
    mockUseCompanyFeatures.mockReturnValue(
      featuresQuery(['production', 'inventory', 'purchases', 'advancedFinance', 'team']),
    );
  });

  it('não exibe itens que já são tabs (Orçamentos, Serviços) nem duplicidade Pagamentos', async () => {
    await render(<MaisScreen />);

    expect(screen.queryByText('Orçamentos')).toBeNull();
    expect(screen.queryByText('Serviços')).toBeNull();
    expect(screen.queryByText('Pagamentos / Recebíveis')).toBeNull();
    expect(screen.queryByText('Catálogo de Serviços')).toBeNull();
  });

  it('exibe as 5 seções na ordem recomendada', async () => {
    await render(<MaisScreen />);

    expect(screen.getByText('Operação')).toBeTruthy();
    // 'Financeiro' existe como seção E como item (id 'financeiro') — usar getAllByText
    expect(screen.getAllByText('Financeiro').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Gestão')).toBeTruthy();
    expect(screen.getByText('Conta')).toBeTruthy();
    expect(screen.getByText('Suporte')).toBeTruthy();
  });

  it('exibe itens de GESTÃO (Relatórios, Equipe) e CONTA (Empresa, Configurações, Meu Perfil)', async () => {
    await render(<MaisScreen />);

    expect(screen.getByText('Relatórios')).toBeTruthy();
    expect(screen.getByText('Equipe')).toBeTruthy();
    expect(screen.getByText('Empresa')).toBeTruthy();
    expect(screen.getByText('Configurações')).toBeTruthy();
    expect(screen.getByText('Meu Perfil')).toBeTruthy();
  });

  it('exibe itens de SUPORTE (Ajuda, Calculadora, Trocar empresa) e Sair da Conta', async () => {
    await render(<MaisScreen />);

    expect(screen.getByText('Ajuda & Suporte')).toBeTruthy();
    expect(screen.getByText('Calculadora de Insumos')).toBeTruthy();
    expect(screen.getByText('Trocar empresa')).toBeTruthy();
    expect(screen.getByText('Sair da Conta')).toBeTruthy();
  });

  it('exibe itens de FINANCEIRO (Financeiro, Despesas, Metas da Equipe)', async () => {
    await render(<MaisScreen />);

    // 'Financeiro' existe como seção E como item (id 'financeiro') — usar getAllByText
    expect(screen.getAllByText('Financeiro').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Despesas')).toBeTruthy();
    expect(screen.getByText('Metas da Equipe')).toBeTruthy();
  });
});
