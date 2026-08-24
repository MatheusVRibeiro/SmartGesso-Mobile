import { quoteFollowUpsService } from '../quoteFollowUps';
import { getApiClient } from '../client';

// Mock do getApiClient
jest.mock('../client', () => ({
  getApiClient: jest.fn(),
}));

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
};

(getApiClient as jest.Mock).mockReturnValue(mockApi);

describe('quoteFollowUpsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listByQuote', () => {
    it('deve listar follow-ups de um orçamento', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            quoteId: 'quote-1',
            type: 'CALL',
            status: 'PENDING',
            notes: 'Ligação de follow-up',
            scheduledAt: '2026-08-25T10:00:00.000Z',
          },
        ],
        total: 1,
      };

      mockApi.get.mockResolvedValue({ data: mockResponse });

      const result = await quoteFollowUpsService.listByQuote('quote-1');

      expect(mockApi.get).toHaveBeenCalledWith('/quotes/quote-1/follow-ups');
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('CALL');
    });

    it('deve retornar lista vazia quando não houver follow-ups', async () => {
      const mockResponse = { data: [], total: 0 };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      const result = await quoteFollowUpsService.listByQuote('quote-2');

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('listToday', () => {
    it('deve listar follow-ups pendentes do dia', async () => {
      const mockFollowUps = [
        {
          id: '1',
          quoteId: 'quote-1',
          type: 'WHATSAPP',
          status: 'PENDING',
          notes: 'Follow-up via WhatsApp',
        },
        {
          id: '2',
          quoteId: 'quote-2',
          type: 'EMAIL',
          status: 'PENDING',
          scheduledAt: '2026-08-24T14:00:00.000Z',
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockFollowUps });

      const result = await quoteFollowUpsService.listToday();

      expect(mockApi.get).toHaveBeenCalledWith('/follow-ups/today');
      expect(result).toEqual(mockFollowUps);
      expect(result).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('deve criar um novo follow-up', async () => {
      const newFollowUp = {
        type: 'CALL' as const,
        notes: 'Ligação de acompanhamento',
        scheduledAt: '2026-08-26T09:00:00.000Z',
      };

      const mockResponse = {
        id: 'new-id',
        quoteId: 'quote-1',
        ...newFollowUp,
        status: 'PENDING',
        createdAt: '2026-08-24T12:00:00.000Z',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await quoteFollowUpsService.create('quote-1', newFollowUp);

      expect(mockApi.post).toHaveBeenCalledWith('/quotes/quote-1/follow-ups', newFollowUp);
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe('new-id');
      expect(result.type).toBe('CALL');
      expect(result.status).toBe('PENDING');
    });

    it('deve criar follow-up sem notas e data agendada', async () => {
      const newFollowUp = {
        type: 'OTHER' as const,
      };

      const mockResponse = {
        id: 'new-id-2',
        quoteId: 'quote-1',
        ...newFollowUp,
        status: 'PENDING',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await quoteFollowUpsService.create('quote-1', newFollowUp);

      expect(result.type).toBe('OTHER');
      expect(result.notes).toBeUndefined();
      expect(result.scheduledAt).toBeUndefined();
    });
  });

  describe('update', () => {
    it('deve marcar follow-up como concluído', async () => {
      const mockResponse = {
        id: 'follow-up-1',
        quoteId: 'quote-1',
        type: 'CALL',
        status: 'DONE',
        doneAt: '2026-08-24T15:00:00.000Z',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse });

      const result = await quoteFollowUpsService.update('follow-up-1', { status: 'DONE' });

      expect(mockApi.patch).toHaveBeenCalledWith('/quote-follow-ups/follow-up-1', { status: 'DONE' });
      expect(result.status).toBe('DONE');
      expect(result.doneAt).toBeDefined();
    });

    it('deve cancelar follow-up', async () => {
      const mockResponse = {
        id: 'follow-up-2',
        quoteId: 'quote-1',
        type: 'EMAIL',
        status: 'CANCELLED',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse });

      const result = await quoteFollowUpsService.update('follow-up-2', { status: 'CANCELLED' });

      expect(mockApi.patch).toHaveBeenCalledWith('/quote-follow-ups/follow-up-2', { status: 'CANCELLED' });
      expect(result.status).toBe('CANCELLED');
    });

    it('deve atualizar notas do follow-up', async () => {
      const mockResponse = {
        id: 'follow-up-3',
        quoteId: 'quote-1',
        type: 'WHATSAPP',
        status: 'PENDING',
        notes: 'Atualizado: cliente respondeu positivamente',
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse });

      const result = await quoteFollowUpsService.update('follow-up-3', {
        notes: 'Atualizado: cliente respondeu positivamente',
      });

      expect(mockApi.patch).toHaveBeenCalledWith('/quote-follow-ups/follow-up-3', {
        notes: 'Atualizado: cliente respondeu positivamente',
      });
      expect(result.notes).toContain('Atualizado');
    });
  });
});