import {
  processPendingMutations,
  addMutationWithSync,
  startSyncListener,
} from '../processor';
import { getPendingMutations, markAsProcessing, markAsCompleted, markAsFailed } from '../syncQueue';
import { SecureTokenStorage } from '../../auth/SecureTokenStorage';
import { config } from '../../../constants/config';
import NetInfo from '@react-native-community/netinfo';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../../auth/SecureTokenStorage', () => ({
  SecureTokenStorage: {
    getAccessToken: jest.fn(),
  },
}));

jest.mock('../syncQueue', () => ({
  addMutation: jest.fn(),
  getPendingMutations: jest.fn(),
  markAsProcessing: jest.fn(),
  markAsCompleted: jest.fn(),
  markAsFailed: jest.fn(),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockGetPendingMutations = getPendingMutations as jest.Mock;
const mockMarkAsProcessing = markAsProcessing as jest.Mock;
const mockMarkAsCompleted = markAsCompleted as jest.Mock;
const mockMarkAsFailed = markAsFailed as jest.Mock;
const mockGetAccessToken = SecureTokenStorage.getAccessToken as jest.Mock;
const mockNetInfoFetch = NetInfo.fetch as jest.Mock;

function makeMutation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'mut-1',
    type: 'payment',
    endpoint: '/payments',
    method: 'POST',
    body: { amount: 100 },
    status: 'pending',
    retries: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

function mockFetchOk() {
  return jest.fn().mockResolvedValue({ ok: true, status: 201 });
}

function mockFetchHttpError(status: number) {
  return jest.fn().mockResolvedValue({ ok: false, status });
}

function mockFetchNetworkError() {
  return jest.fn().mockRejectedValue(new Error('Network request failed'));
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Offline processor', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    originalFetch = globalThis.fetch;
    mockMarkAsProcessing.mockResolvedValue(undefined);
    mockMarkAsCompleted.mockResolvedValue(undefined);
    mockMarkAsFailed.mockResolvedValue(true);
    mockNetInfoFetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('processPendingMutations', () => {
    it('não faz nada quando a fila está vazia', async () => {
      mockGetPendingMutations.mockResolvedValue([]);

      await processPendingMutations();

      expect(mockMarkAsProcessing).not.toHaveBeenCalled();
      expect(mockGetAccessToken).not.toHaveBeenCalled();
    });

    it('envia fetch autenticado com base URL + Authorization Bearer', async () => {
      const mutation = makeMutation();
      mockGetPendingMutations.mockResolvedValue([mutation]);
      mockGetAccessToken.mockResolvedValue('jwt-token-123');
      const fetchMock = mockFetchOk();
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      await processPendingMutations();

      expect(fetchMock).toHaveBeenCalledWith(
        `${config.apiUrl}/payments`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer jwt-token-123',
          }),
        }),
      );
      expect(mockMarkAsCompleted).toHaveBeenCalledWith('mut-1');
      expect(mockMarkAsFailed).not.toHaveBeenCalled();
    });

    it('NUNCA envia sem token — marca a mutação como failed', async () => {
      const mutation = makeMutation();
      mockGetPendingMutations.mockResolvedValue([mutation]);
      mockGetAccessToken.mockResolvedValue(null);
      const fetchMock = jest.fn();
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      await processPendingMutations();

      expect(fetchMock).not.toHaveBeenCalled();
      expect(mockMarkAsFailed).toHaveBeenCalledWith('mut-1', 3);
      expect(mockMarkAsCompleted).not.toHaveBeenCalled();
    });

    it('marca como failed em erro HTTP (não completed)', async () => {
      const mutation = makeMutation();
      mockGetPendingMutations.mockResolvedValue([mutation]);
      mockGetAccessToken.mockResolvedValue('jwt-token-123');
      globalThis.fetch = mockFetchHttpError(500) as unknown as typeof globalThis.fetch;

      await processPendingMutations();

      expect(mockMarkAsFailed).toHaveBeenCalledWith('mut-1', 3);
      expect(mockMarkAsCompleted).not.toHaveBeenCalled();
    });

    it('marca como failed em erro de rede (fetch rejeita)', async () => {
      const mutation = makeMutation();
      mockGetPendingMutations.mockResolvedValue([mutation]);
      mockGetAccessToken.mockResolvedValue('jwt-token-123');
      globalThis.fetch = mockFetchNetworkError() as unknown as typeof globalThis.fetch;

      await processPendingMutations();

      expect(mockMarkAsFailed).toHaveBeenCalledWith('mut-1', 3);
      expect(mockMarkAsCompleted).not.toHaveBeenCalled();
    });

    it('para o processamento quando o dispositivo está offline', async () => {
      const mutation = makeMutation();
      mockGetPendingMutations.mockResolvedValue([mutation]);
      mockGetAccessToken.mockResolvedValue('jwt-token-123');
      mockNetInfoFetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      const fetchMock = mockFetchOk();
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      await processPendingMutations();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('pula mutações que já estão em processamento', async () => {
      const mutation = makeMutation({ status: 'processing' });
      mockGetPendingMutations.mockResolvedValue([mutation]);
      const fetchMock = mockFetchOk();
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      await processPendingMutations();

      expect(fetchMock).not.toHaveBeenCalled();
      expect(mockMarkAsProcessing).not.toHaveBeenCalled();
    });
  });

  describe('addMutationWithSync', () => {
    it('adiciona a mutação e processa imediatamente quando online', async () => {
      const { addMutation } = require('../syncQueue');
      const added = makeMutation();
      (addMutation as jest.Mock).mockResolvedValue(added);
      mockGetAccessToken.mockResolvedValue('jwt-token-123');
      const fetchMock = mockFetchOk();
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      await addMutationWithSync({
        type: 'payment',
        endpoint: '/payments',
        method: 'POST',
        body: { amount: 100 },
      });

      expect(addMutation).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        `${config.apiUrl}/payments`,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer jwt-token-123' }),
        }),
      );
    });

    it('não processa imediatamente quando offline', async () => {
      const { addMutation } = require('../syncQueue');
      const added = makeMutation();
      (addMutation as jest.Mock).mockResolvedValue(added);
      mockNetInfoFetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      const fetchMock = jest.fn();
      globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

      await addMutationWithSync({
        type: 'payment',
        endpoint: '/payments',
        method: 'POST',
        body: { amount: 100 },
      });

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('startSyncListener', () => {
    it('registra listener no NetInfo e retorna unsubscribe', () => {
      const unsubscribe = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);

      const result = startSyncListener();

      expect(NetInfo.addEventListener).toHaveBeenCalled();
      expect(typeof result).toBe('function');
      result();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
