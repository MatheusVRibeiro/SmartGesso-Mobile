/**
 * SmartGesso Mobile — Serviço de Notificações (V3 §79).
 *
 * As notificações são calculadas LOCALMENTE a partir das APIs existentes
 * (sem endpoint dedicado de notificações no backend):
 * - Orçamentos vencendo (validade do orçamento próxima);
 * - Visitas hoje (agenda — quotes com visitDate);
 * - Serviço amanhã (service orders com scheduledDate);
 * - Entrega próxima (service orders com deadlineDate);
 * - Pagamento vencendo (payments PENDENTE com dueDate próximo);
 * - Estoque baixo (materiais com stockQty <= minStockQty).
 *
 * Push: `registerForPushNotifications()` é um placeholder — solicita
 * permissão e obtém o token Expo, mas NÃO envia para nenhum servidor push.
 */
import * as Notifications from 'expo-notifications';
import { agendaService } from './api/agenda';
import { catalogService } from './api/catalog';
import { paymentsService } from './api/payments';
import { quotesService } from './api/quotes';
import { serviceOrdersService } from './api/serviceOrders';
import type { MaterialItem } from '../types/catalog';
import type { Payment } from '../types/finance';
import type { Notificacao, NotificationType } from '../types/notification';
import type { QuoteSummary } from '../types/quote';
import type { ServiceOrder } from '../types/serviceOrder';
import { formatCurrency } from '../utils/format';

// ─── Helpers de data (fuso local) ──────────────────────────────────────────

/** Chave de data local (YYYY-MM-DD) — evita deslocamento de fuso. */
function toLocalDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

/** Data local de hoje (YYYY-MM-DD). */
function todayKey(): string {
  return toLocalDateKey(new Date());
}

/** Data local de amanhã (YYYY-MM-DD). */
function tomorrowKey(): string {
  return toLocalDateKey(addDays(new Date(), 1));
}

/** Data local daqui a 7 dias (YYYY-MM-DD) — limite do horizonte. */
function weekEndKey(): string {
  return toLocalDateKey(addDays(new Date(), 7));
}

/** Formata data ISO/YYYY-MM-DD como dd/mm/aaaa (pt-BR). */
function formatShortDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

/** Normaliza array puro (Prisma findMany) ou { data, total }. */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

/**
 * Campos de validade/prazo ainda não tipados na API — declarados como
 * opcionais para tolerar a resposta real sem quebrar o typecheck.
 */
type QuoteWithValidity = QuoteSummary & {
  /** Até quando o preço/condições são válidos (V3 — validade do orçamento). */
  validUntil?: string | null;
  /** Previsão de conclusão (fallback de validade quando não informada). */
  endDate?: string | null;
};

type ServiceOrderWithDeadline = ServiceOrder & {
  /** Data-limite comercial combinada (V3 — "Entregar até"). */
  deadlineDate?: string | null;
};

// ─── Fontes de notificação ─────────────────────────────────────────────────

function buildQuoteNotifications(quotes: QuoteWithValidity[]): Notificacao[] {
  const today = todayKey();
  const end = weekEndKey();

  const result: Notificacao[] = [];

  for (const quote of quotes) {
    // Orçamento "vencendo" = ainda aguardando resposta do cliente.
    if (quote.status !== 'ENVIADO' && quote.status !== 'AGUARDANDO_APROVACAO') {
      continue;
    }
    const validity = quote.validUntil ?? quote.endDate;
    if (!validity) continue;
    const validityKey = toLocalDateKey(validity);
    if (validityKey < today || validityKey > end) continue;

    const clientName = quote.client?.name ?? 'Cliente não informado';
    result.push({
      id: `quote-expiring-${quote.id}`,
      type: 'QUOTE_EXPIRING',
      title: 'Orçamento vencendo',
      description: `${clientName} · vence em ${formatShortDate(validityKey)}`,
      date: validityKey,
      read: false,
    });
  }

  return result;
}

function buildVisitNotifications(agendaItems: Array<{ id: string; type: string; date: string; clientName: string }>): Notificacao[] {
  const today = todayKey();

  const result: Notificacao[] = [];

  for (const item of agendaItems) {
    if (item.type !== 'VISITA' || item.date !== today) continue;
    result.push({
      id: `visit-today-${item.id}`,
      type: 'VISIT_TODAY',
      title: 'Visita hoje',
      description: item.clientName,
      date: today,
      read: false,
    });
  }

  return result;
}

function buildServiceNotifications(orders: ServiceOrderWithDeadline[]): Notificacao[] {
  const today = todayKey();
  const tomorrow = tomorrowKey();
  const end = weekEndKey();

  const result: Notificacao[] = [];

  for (const order of orders) {
    if (order.status === 'CANCELADA' || order.status === 'CONCLUIDA') continue;
    const clientName = order.client?.name ?? 'Cliente não informado';
    const code = `OS-${String(order.code).padStart(5, '0')}`;

    // Serviço amanhã (scheduledDate).
    if (order.scheduledDate) {
      const scheduledKey = toLocalDateKey(order.scheduledDate);
      if (scheduledKey === tomorrow) {
        result.push({
          id: `service-tomorrow-${order.id}`,
          type: 'SERVICE_TOMORROW',
          title: 'Serviço amanhã',
          description: `${code} · ${clientName}`,
          date: tomorrow,
          read: false,
        });
      }
    }

    // Entrega próxima (deadlineDate nos próximos 7 dias).
    const deadline = order.deadlineDate;
    if (deadline) {
      const deadlineKey = toLocalDateKey(deadline);
      if (deadlineKey >= today && deadlineKey <= end) {
        result.push({
          id: `delivery-soon-${order.id}`,
          type: 'DELIVERY_SOON',
          title: 'Entrega próxima',
          description: `${code} · ${clientName} · entrega ${formatShortDate(deadlineKey)}`,
          date: deadlineKey,
          read: false,
        });
      }
    }
  }

  return result;
}

function buildPaymentNotifications(payments: Payment[]): Notificacao[] {
  const today = todayKey();
  const end = weekEndKey();

  const result: Notificacao[] = [];

  for (const payment of payments) {
    if (payment.status !== 'PENDENTE' || !payment.dueDate) continue;
    const dueKey = toLocalDateKey(payment.dueDate);
    if (dueKey < today || dueKey > end) continue;

    const clientName = payment.client?.name ?? 'Cliente não informado';
    result.push({
      id: `payment-due-${payment.id}`,
      type: 'PAYMENT_DUE',
      title: 'Pagamento vencendo',
      description: `${clientName} · ${formatCurrency(payment.amount)} · vence ${formatShortDate(dueKey)}`,
      date: dueKey,
      read: false,
    });
  }

  return result;
}

function buildStockNotifications(materials: MaterialItem[]): Notificacao[] {
  const today = todayKey();

  const result: Notificacao[] = [];

  for (const material of materials) {
    if (material.status !== 'ACTIVE') continue;
    if (material.stockQty == null || material.minStockQty == null) continue;
    if (material.stockQty > material.minStockQty) continue;

    result.push({
      id: `low-stock-${material.id}`,
      type: 'LOW_STOCK',
      title: 'Estoque baixo',
      description: `${material.name} · ${material.stockQty} ${material.unit} (mínimo ${material.minStockQty})`,
      date: today,
      read: false,
    });
  }

  return result;
}

// ─── API pública ───────────────────────────────────────────────────────────

/**
 * Calcula todas as notificações a partir das APIs existentes.
 * Retorna a lista ordenada por data (mais próxima primeiro).
 */
export async function loadNotifications(): Promise<Notificacao[]> {
  const [quotes, agendaItems, orders, payments, materials] = await Promise.all([
    quotesService.list(),
    agendaService.list(),
    serviceOrdersService.list(),
    paymentsService.list({ status: 'PENDENTE' }),
    catalogService.listMaterials(),
  ]);

  const notifications: Notificacao[] = [
    ...buildQuoteNotifications(toArray<QuoteWithValidity>(quotes)),
    ...buildVisitNotifications(agendaItems),
    ...buildServiceNotifications(toArray<ServiceOrderWithDeadline>(orders)),
    ...buildPaymentNotifications(toArray<Payment>(payments)),
    ...buildStockNotifications(toArray<MaterialItem>(materials)),
  ];

  return notifications.sort((a, b) => a.date.localeCompare(b.date));
}

/** Contagem total de notificações (usada no badge do menu). */
export async function countNotifications(): Promise<number> {
  const notifications = await loadNotifications();
  return notifications.length;
}

// ─── Push (placeholder — sem servidor push) ────────────────────────────────

/**
 * Placeholder de registro para push notifications.
 *
 * Solicita permissão e obtém o token Expo do dispositivo. NÃO envia o token
 * para nenhum servidor — a integração com backend de push será feita quando
 * houver endpoint dedicado.
 *
 * @returns Token Expo push ou null quando indisponível/negado.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    // Sem suporte a push no ambiente (ex.: web) ou erro de permissão.
    return null;
  }
}

/** Mapa de rótulos/tipos para exibição (fallback de UI). */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  QUOTE_EXPIRING: 'Orçamento vencendo',
  VISIT_TODAY: 'Visita hoje',
  SERVICE_TOMORROW: 'Serviço amanhã',
  DELIVERY_SOON: 'Entrega próxima',
  PAYMENT_DUE: 'Pagamento vencendo',
  LOW_STOCK: 'Estoque baixo',
};