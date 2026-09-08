import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock useCompanyFeatures com implementação mutável (V5 ETAPA 7)
const mockUseCompanyFeatures = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: 'order-1' }),
  Stack: { Screen: () => null },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: jest.fn(), setQueryData: jest.fn() }),
}));

jest.mock('../../../../store/useSessionStore', () => ({
  useSessionStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      activeCompany: {
        company: {
          id: 'company-1',
          tradeName: 'SmartGesso Test',
        },
      },
      currentUser: { name: 'João da Silva', role: 'COMPANY_OWNER' },
      role: 'COMPANY_OWNER',
      permissions: [],
    };
    return selector(state);
  }),
}));

jest.mock('../../../../services/api/companyFeatures', () => ({
  useCompanyFeatures: (...args: unknown[]) => mockUseCompanyFeatures(...args),
}));

jest.mock('../../../../services/api/serviceOrders', () => ({
  serviceOrdersService: {
    getById: jest.fn(),
    update: jest.fn(),
    updateEtapas: jest.fn(),
    updateNeedsProduction: jest.fn(),
    registerResult: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('../../../../services/api/clients', () => ({
  clientsService: { getById: jest.fn() },
}));

jest.mock('../../../../services/api/financialSummary', () => ({
  financialSummaryService: { getFinancialSummary: jest.fn() },
}));

jest.mock('../../../../services/api/productionOrders', () => ({
  productionOrdersService: { list: jest.fn() },
}));

jest.mock('../../../../services/api/quotes', () => ({
  quotesService: { getById: jest.fn() },
}));

jest.mock('../../../../services/photos/photoStorage', () => ({
  savePhotoLocally: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

// Importar DEPOIS dos mocks
import ServicoDetalheScreen from '../index';

const baseOrder = {
  id: 'order-1',
  companyId: 'company-1',
  clientId: 'client-1',
  workId: 'work-1',
  code: 1001,
  status: 'PENDENTE',
  scheduledDate: '2026-09-10T12:00:00.000Z',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
  needsProduction: true,
  client: { id: 'client-1', name: 'Cliente A' },
  materials: [],
  checklist: {},
  etapas: {},
};

const queryResult = (data: unknown) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  isRefetching: false,
});

describe('ServicoDetalhe — seção Produção condicionada à feature (V5 ETAPA 7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useQuery, useMutation } = require('@tanstack/react-query');

    // Queries: order, client, financial-summary, production-orders, quote
    (useQuery as jest.Mock).mockImplementation((opts?: { queryKey?: unknown[] }) => {
      const key = opts?.queryKey ?? [];
      if (key[2] === 'service-orders' && key[3] === 'order-1') {
        return queryResult(baseOrder);
      }
      if (key[2] === 'clients') return queryResult({ id: 'client-1', name: 'Cliente A' });
      if (key.includes('financial-summary')) return queryResult(null);
      if (key[2] === 'production-orders') return queryResult({ data: [], total: 0 });
      if (key[2] === 'quotes') return queryResult(null);
      return queryResult(null);
    });

    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isLoading: false,
    });
  });

  it('com features ["production"]: exibe a seção Produção (toggle needsProduction)', async () => {
    mockUseCompanyFeatures.mockReturnValue({
      data: ['production'],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    });

    await render(<ServicoDetalheScreen />);

    expect(screen.getByText('Produção necessária?')).toBeTruthy();
    expect(screen.getByLabelText('Produção necessária: Sim')).toBeTruthy();
    expect(screen.getByLabelText('Produção necessária: Não')).toBeTruthy();
  });

  it('com features [] (production desabilitada): oculta a seção Produção', async () => {
    mockUseCompanyFeatures.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    });

    await render(<ServicoDetalheScreen />);

    expect(screen.queryByText('Produção necessária?')).toBeNull();
    expect(screen.queryByLabelText('Produção necessária: Sim')).toBeNull();
    expect(screen.queryByLabelText('Produção necessária: Não')).toBeNull();
    // Resto da tela segue renderizado
    expect(screen.getByText('Detalhe da OS')).toBeTruthy();
  });

  it('durante carregamento (isLoading): mantém a seção Produção visível (fail-open)', async () => {
    mockUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    });

    await render(<ServicoDetalheScreen />);

    expect(screen.getByText('Produção necessária?')).toBeTruthy();
  });

  it('em erro da query (isError): mantém a seção Produção visível (fail-open; backend é a autoridade)', async () => {
    mockUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('network'),
      refetch: jest.fn(),
      isRefetching: false,
    });

    await render(<ServicoDetalheScreen />);

    expect(screen.getByText('Produção necessária?')).toBeTruthy();
  });
});
