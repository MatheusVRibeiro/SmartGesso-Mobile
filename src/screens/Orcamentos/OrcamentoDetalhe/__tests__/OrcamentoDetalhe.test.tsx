import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react';

// ─── Mocks (V5 ETAPA 14 — approve flow) ─────────────────────────────────────

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
    replace: mockRouterReplace,
  }),
  useLocalSearchParams: () => ({ id: 'q-1' }),
  Stack: { Screen: () => null },
}));

const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
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

jest.mock('../../../../services/api/quotes', () => ({
  quotesService: {
    getById: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    remove: jest.fn(),
    duplicate: jest.fn(),
    generateVersion: jest.fn(),
    getPdf: jest.fn(),
    share: jest.fn(),
  },
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { cache: '/cache' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(),
}));

// Importar DEPOIS dos mocks
import OrcamentoDetalheScreen from '../index';
import { quotesService } from '../../../../services/api/quotes';

const mockedQuotesService = quotesService as jest.Mocked<typeof quotesService>;

const baseQuote = {
  id: 'q-1',
  companyId: 'company-1',
  clientId: 'cli-1',
  workId: null,
  quoteNumber: 1,
  version: 1,
  status: 'AGUARDANDO_APROVACAO',
  subtotal: 1500,
  discount: 0,
  marginPct: 0,
  total: 1500,
  paymentMethod: 'AVISTA',
  observations: null,
  validUntil: null,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
  items: [],
  history: [],
  client: { id: 'cli-1', name: 'João da Silva' },
};

const queryResult = (data: unknown) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  isRefetching: false,
});

const approveResponse = {
  quote: { ...baseQuote, status: 'APROVADO' },
  serviceOrder: { id: 'so-1', code: 1, status: 'PENDENTE' },
  serviceOrderCreated: true,
};

/** Fluxo real da tela: botão "Aprovar orçamento" → ConfirmDialog → confirmar. */
async function approveViaUI() {
  fireEvent.press(screen.getByLabelText('Aprovar orçamento'));
  // RNTL v14 + React 19: re-render do dialog é assíncrono
  await waitFor(() => {
    expect(screen.getByText('Aprovar', { exact: true })).toBeTruthy();
  });
  fireEvent.press(screen.getByText('Aprovar', { exact: true }));
}

describe('OrcamentoDetalhe — approve flow (V5 ETAPA 14)', () => {
  let capturedMutationFn: (() => Promise<unknown>) | undefined;
  let capturedOnSuccess: ((response: unknown) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedMutationFn = undefined;
    capturedOnSuccess = undefined;

    const { useQuery, useMutation } = require('@tanstack/react-query');

    (useQuery as jest.Mock).mockImplementation(() => queryResult(baseQuote));

    // Emula react-query v5: mutate → mutationFn → onSuccess/onError
    (useMutation as jest.Mock).mockImplementation(
      (opts: {
        mutationFn?: () => Promise<unknown>;
        onSuccess?: (r: unknown) => void;
        onError?: (e: unknown) => void;
      }) => {
        // Captura a mutation do approve (única que chama quotesService.approve)
        if (opts?.mutationFn?.toString().includes('approve')) {
          capturedMutationFn = opts.mutationFn;
          capturedOnSuccess = opts.onSuccess;
        }
        return {
          mutate: jest.fn(() => {
            void Promise.resolve()
              .then(() => opts?.mutationFn?.())
              .then((result) => opts?.onSuccess?.(result))
              .catch((err) => opts?.onError?.(err));
          }),
          mutateAsync: jest.fn(),
          isPending: false,
          isLoading: false,
        };
      }
    );

    mockedQuotesService.getById.mockResolvedValue(baseQuote as never);
  });

  it('após approve resolver com serviceOrder.id="so-1", router.replace navega para /servicos/[id] com id="so-1"', async () => {
    mockedQuotesService.approve.mockResolvedValue(approveResponse as never);

    await render(<OrcamentoDetalheScreen />);
    await approveViaUI();

    await waitFor(() => {
      expect(mockedQuotesService.approve).toHaveBeenCalledWith('q-1');
    });

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledTimes(1);
    });

    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/servicos/[id]',
      params: { id: 'so-1', quoteId: 'q-1' },
    });
    // Invalida queries de orçamentos e de service-orders
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['company', 'company-1', 'quotes'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['company', 'company-1', 'service-orders'],
    });
  });

  it('onSuccess mostra snackbar "Serviço criado" quando serviceOrderCreated=true', async () => {
    mockedQuotesService.approve.mockResolvedValue(approveResponse as never);

    await render(<OrcamentoDetalheScreen />);
    await approveViaUI();

    await waitFor(() => {
      expect(screen.getByText('Serviço criado')).toBeTruthy();
    });
  });

  it('onSuccess mostra snackbar "Serviço já existente" quando serviceOrderCreated=false (idempotência)', async () => {
    mockedQuotesService.approve.mockResolvedValue({
      ...approveResponse,
      serviceOrderCreated: false,
    } as never);

    await render(<OrcamentoDetalheScreen />);
    await approveViaUI();

    await waitFor(() => {
      expect(screen.getByText('Serviço já existente')).toBeTruthy();
    });
  });

  it('mutationFn do approve chama quotesService.approve com o id do orçamento', async () => {
    mockedQuotesService.approve.mockResolvedValue(approveResponse as never);

    await render(<OrcamentoDetalheScreen />);

    // A mutation capturada deve ser a do approve
    expect(capturedMutationFn).toBeDefined();
    await capturedMutationFn?.();

    expect(mockedQuotesService.approve).toHaveBeenCalledWith('q-1');
  });

  it('onSuccess do approve navega com o id da serviceOrder retornada', async () => {
    mockedQuotesService.approve.mockResolvedValue(approveResponse as never);

    await render(<OrcamentoDetalheScreen />);

    expect(capturedOnSuccess).toBeDefined();
    // act: onSuccess dispara setState (snackbar) + navegação
    await act(async () => {
      capturedOnSuccess?.(approveResponse);
    });

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith({
        pathname: '/servicos/[id]',
        params: { id: 'so-1', quoteId: 'q-1' },
      });
    });
  });
});
