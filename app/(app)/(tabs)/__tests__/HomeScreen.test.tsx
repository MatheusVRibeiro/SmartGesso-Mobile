import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock useQuery with a mutable implementation
const mockUseQuery = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock('../../../../src/store/useSessionStore', () => ({
  useSessionStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      activeCompany: {
        company: {
          id: 'company-1',
          tradeName: 'SmartGesso Test',
        },
      },
      currentUser: {
        name: 'João da Silva',
      },
    };
    return selector(state);
  }),
}));

jest.mock('../../../../src/services/api/dashboard', () => ({
  dashboardService: {
    getMetrics: jest.fn(),
  },
}));

jest.mock('../../../../src/services/api/quoteFollowUps', () => ({
  quoteFollowUpsService: {
    listToday: jest.fn(),
  },
}));

jest.mock('../../../../src/services/api/client', () => ({
  toApiError: jest.fn(() => ({ message: 'Erro de teste' })),
}));

// Importar DEPOIS dos mocks
import HomeScreen from '../index';

const defaultQueryResult = {
  data: null,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  isRefetching: false,
};

describe('HomeScreen (Dashboard)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock - retorna dados vazios
    mockUseQuery.mockReturnValue(defaultQueryResult);
  });

  it('renderiza a saudação com o nome do usuário', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Olá, João')).toBeTruthy();
  });

  it('renderiza o nome da empresa', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('SmartGesso Test')).toBeTruthy();
  });

  it('renderiza os cards de métricas', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('A receber')).toBeTruthy();
    expect(screen.getByText('Serviços hoje')).toBeTruthy();
    expect(screen.getByText('Orçamentos abertos')).toBeTruthy();
    expect(screen.getByText('Despesas do mês')).toBeTruthy();
  });

  it('renderiza as ações rápidas', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Novo orçamento')).toBeTruthy();
    expect(screen.getByText('Novo cliente')).toBeTruthy();
  });

  it('renderiza a seção de follow-ups', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Follow-ups do dia')).toBeTruthy();
    expect(screen.getByText('Acompanhamentos pendentes')).toBeTruthy();
  });

  it('renderiza loading state quando isLoading é true', async () => {
    // Configura mock para retornar isLoading: true na primeira chamada (dashboard)
    mockUseQuery
      .mockReturnValueOnce({
        ...defaultQueryResult,
        isLoading: true,
      })
      .mockReturnValue(defaultQueryResult);

    await render(<HomeScreen />);
    expect(screen.getByText('Carregando dashboard...')).toBeTruthy();
  });

  it('renderiza follow-ups quando há dados', async () => {
    const mockFollowUps = [
      {
        id: '1',
        quoteId: 'quote-1',
        type: 'CALL',
        notes: 'Retorno sobre orçamento',
        status: 'PENDING',
      },
      {
        id: '2',
        quoteId: 'quote-2',
        type: 'WHATSAPP',
        notes: 'Enviar proposta',
        status: 'PENDING',
      },
    ];

    // Primeira chamada: dashboard (return default), segunda chamada: follow-ups
    mockUseQuery
      .mockReturnValueOnce(defaultQueryResult)
      .mockReturnValueOnce({
        ...defaultQueryResult,
        data: mockFollowUps,
      });

    await render(<HomeScreen />);
    expect(screen.getByText('Ligação')).toBeTruthy();
    expect(screen.getByText('Retorno sobre orçamento')).toBeTruthy();
    expect(screen.getByText('WhatsApp')).toBeTruthy();
    expect(screen.getByText('Enviar proposta')).toBeTruthy();
  });
});
