import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addMutation,
  getPendingMutations,
  getPendingCount,
  markAsProcessing,
  markAsCompleted,
  markAsFailed,
  removeMutation,
  clearQueue,
  getQueue,
} from '../syncQueue';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('SyncQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('addMutation', () => {
    it('should add a mutation to the queue', async () => {
      const mutation = {
        type: 'payment' as const,
        endpoint: 'https://api.example.com/payments',
        method: 'POST' as const,
        body: { amount: 100 },
      };

      const result = await addMutation(mutation);

      expect(result).toHaveProperty('id');
      expect(result.type).toBe('payment');
      expect(result.endpoint).toBe('https://api.example.com/payments');
      expect(result.method).toBe('POST');
      expect(result.body).toEqual({ amount: 100 });
      expect(result.status).toBe('pending');
      expect(result.retries).toBe(0);
      expect(result.createdAt).toBeDefined();

      // Verify AsyncStorage was called
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe(result.id);
    });

    it('should generate unique IDs for each mutation', async () => {
      const mutation1 = {
        type: 'payment' as const,
        endpoint: 'https://api.example.com/payments',
        method: 'POST' as const,
        body: { amount: 100 },
      };

      const mutation2 = {
        type: 'expense' as const,
        endpoint: 'https://api.example.com/expenses',
        method: 'POST' as const,
        body: { amount: 50 },
      };

      const result1 = await addMutation(mutation1);
      const result2 = await addMutation(mutation2);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getPendingMutations', () => {
    it('should return only pending and failed mutations', async () => {
      const queue = [
        { id: '1', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 0 },
        { id: '2', status: 'processing', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 2, retries: 0 },
        { id: '3', status: 'failed', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 3, retries: 3 },
        { id: '4', status: 'completed', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 4, retries: 1 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      const result = await getPendingMutations();

      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toEqual(['1', '3']);
    });

    it('should return empty array when queue is empty', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getPendingMutations();

      expect(result).toHaveLength(0);
    });
  });

  describe('getPendingCount', () => {
    it('should return count of pending mutations', async () => {
      const queue = [
        { id: '1', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 0 },
        { id: '2', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 2, retries: 0 },
        { id: '3', status: 'failed', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 3, retries: 3 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      const result = await getPendingCount();

      expect(result).toBe(3);
    });
  });

  describe('markAsProcessing', () => {
    it('should update mutation status to processing', async () => {
      const queue = [
        { id: '1', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 0 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      await markAsProcessing('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData[0].status).toBe('processing');
    });
  });

  describe('markAsCompleted', () => {
    it('should remove mutation from queue', async () => {
      const queue = [
        { id: '1', status: 'processing', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 0 },
        { id: '2', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 2, retries: 0 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      await markAsCompleted('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('2');
    });
  });

  describe('markAsFailed', () => {
    it('should increment retries and mark as failed when max retries exceeded', async () => {
      const queue = [
        { id: '1', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 2 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      const shouldRetry = await markAsFailed('1', 3);

      expect(shouldRetry).toBe(false);
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData[0].retries).toBe(3);
      expect(savedData[0].status).toBe('failed');
    });

    it('should increment retries and keep as pending when retries remain', async () => {
      const queue = [
        { id: '1', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 1 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      const shouldRetry = await markAsFailed('1', 3);

      expect(shouldRetry).toBe(true);
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData[0].retries).toBe(2);
      expect(savedData[0].status).toBe('pending');
    });
  });

  describe('removeMutation', () => {
    it('should remove specific mutation from queue', async () => {
      const queue = [
        { id: '1', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 0 },
        { id: '2', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 2, retries: 0 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      await removeMutation('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('2');
    });
  });

  describe('clearQueue', () => {
    it('should remove all mutations from queue', async () => {
      await clearQueue();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@smartgesso:offline-sync-queue');
    });
  });

  describe('getQueue', () => {
    it('should return queue from AsyncStorage', async () => {
      const queue = [
        { id: '1', status: 'pending', type: 'payment', endpoint: 'test', method: 'POST', body: {}, createdAt: 1, retries: 0 },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queue));

      const result = await getQueue();

      expect(result).toEqual(queue);
    });

    it('should return empty array when no queue exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getQueue();

      expect(result).toEqual([]);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getQueue();

      expect(result).toEqual([]);
    });
  });
});
