// ─── Notificações (V3 §79) ─────────────────────────────────────────────────

/**
 * Tipos de notificação calculados localmente a partir das APIs existentes:
 * orçamento vencendo, visita hoje, serviço amanhã, entrega próxima,
 * pagamento vencendo e estoque baixo.
 */
export type NotificationType =
  | 'QUOTE_EXPIRING'
  | 'VISIT_TODAY'
  | 'SERVICE_TOMORROW'
  | 'DELIVERY_SOON'
  | 'PAYMENT_DUE'
  | 'LOW_STOCK'
  | 'GENERIC';

export interface Notificacao {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  /** Data de referência da notificação (YYYY-MM-DD, fuso local). */
  date: string;
  read: boolean;
}