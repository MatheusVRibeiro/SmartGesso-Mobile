import { getApiClient } from './client';

/**
 * Notificação retornada pela API dedicada de notificações (V3 §79).
 *
 * A API está sendo criada em paralelo — os campos são tolerantes
 * (opcionais) para não quebrar o typecheck caso a resposta real varie.
 */
export interface ApiNotification {
  id: string;
  /** Tipo da notificação (ex.: QUOTE_EXPIRING, VISIT_TODAY, ...). */
  type: string;
  title: string;
  description?: string | null;
  /** Data de referência (YYYY-MM-DD ou ISO 8601). */
  date?: string | null;
  read?: boolean;
  createdAt?: string;
}

function api() {
  return getApiClient();
}

/** Módulo tipado de notificações do backend (V3 §79). */
export const notificationsApi = {
  /**
   * POST /notifications/tokens — registra o token push do dispositivo
   * para a empresa ativa (chamado após login).
   */
  async registerPushToken(token: string): Promise<{ ok: true }> {
    await api().post('/notifications/tokens', { token });
    return { ok: true };
  },

  /**
   * GET /notifications — lista as notificações da empresa ativa.
   * Aceita resposta em array puro ou { data: [...] } (padrão Prisma).
   */
  async listNotifications(): Promise<ApiNotification[]> {
    const response = await api().get<ApiNotification[] | { data: ApiNotification[] }>(
      '/notifications',
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  },

  /** PATCH /notifications/:id/read — marca uma notificação como lida. */
  async markRead(id: string): Promise<{ ok: true }> {
    await api().patch(`/notifications/${id}/read`);
    return { ok: true };
  },
};