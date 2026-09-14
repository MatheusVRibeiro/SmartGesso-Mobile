import { quotesService } from './quotes';
import { serviceOrdersService } from './serviceOrders';
import { toArray } from '../../types/api';
import type { AgendaItem } from '../../types/agenda';
import type { QuoteSummary } from '../../types/quote';
import type { ServiceOrder } from '../../types/serviceOrder';

/**
 * Módulo Agenda (V3).
 *
 * A API ainda não possui módulo schedule/agenda dedicado — a Agenda é montada
 * a partir dos dados existentes:
 * - Quotes: visitDate → visita técnica; measurementDate → medição;
 * - ServiceOrders: scheduledDate → instalação/serviço.
 */

/** Chave de data local (YYYY-MM-DD) — evita deslocamento de fuso. */
function toLocalDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Hora local (HH:mm) ou null quando a data não tem horário (00:00). */
function toTime(value: string | Date): string | null {
  const date = typeof value === 'string' ? new Date(value) : value;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (hours === 0 && minutes === 0) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export const agendaService = {
  /** Monta a Agenda (visitas, medições e instalações) a partir de quotes + service orders. */
  async list(): Promise<AgendaItem[]> {
    const [quotes, orders] = await Promise.all([
      quotesService.list(),
      serviceOrdersService.list(),
    ]);

    const items: AgendaItem[] = [];

    for (const quote of toArray<QuoteSummary>(quotes)) {
      const clientName = quote.client?.name ?? 'Cliente não informado';

      if (quote.visitDate) {
        items.push({
          id: `quote-visit-${quote.id}`,
          type: 'VISITA',
          title: 'Visita',
          clientName,
          date: toLocalDateKey(quote.visitDate),
          time: toTime(quote.visitDate),
          source: 'QUOTE',
          sourceId: quote.id,
        });
      }

      if (quote.measurementDate) {
        items.push({
          id: `quote-measurement-${quote.id}`,
          type: 'MEDICAO',
          title: 'Medição',
          clientName,
          date: toLocalDateKey(quote.measurementDate),
          time: toTime(quote.measurementDate),
          source: 'QUOTE',
          sourceId: quote.id,
        });
      }
    }

    for (const order of toArray<ServiceOrder>(orders)) {
      if (order.scheduledDate) {
        items.push({
          id: `service-order-${order.id}`,
          type: 'INSTALACAO',
          title: `OS #${order.code}`,
          clientName: order.client?.name ?? 'Cliente não informado',
          date: toLocalDateKey(order.scheduledDate),
          time: toTime(order.scheduledDate),
          source: 'SERVICE_ORDER',
          sourceId: order.id,
        });
      }
    }

    // Ordena por data e hora (itens sem hora vão primeiro no dia).
    return items.sort((a, b) => {
      const timeA = a.time ?? '00:00';
      const timeB = b.time ?? '00:00';
      return `${a.date}T${timeA}`.localeCompare(`${b.date}T${timeB}`);
    });
  },
};
