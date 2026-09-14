// ─── Home acionável (V4 ETAPA 15) — helpers 100% puros ──────────────────────
// NÃO importar react-native nem react (apenas types TS) — roda em jest node.

import type { ServiceOrderStatus } from '../../types/serviceOrder';

// ─── Tipos públicos ─────────────────────────────────────────────────────────

/** Forma mínima de OS consumida pela Home (subconjunto de ServiceOrder). */
export interface ServiceOrderSummary {
  id: string;
  code: number;
  status: ServiceOrderStatus;
  scheduledDate: string | null;
  saleValue?: number | null;
  client?: { name: string } | null;
  work?: { name: string } | null;
}

/** Visita técnica do operationalToday (dashboardService.getOverview). */
export interface VisitSummary {
  id: string;
  type: string;
  title: string | null;
  time: string | null;
  quoteId?: string | null;
  serviceOrderId?: string | null;
  client?: { name: string } | null;
  notes?: string | null;
}

/** Follow-up de orçamento do operationalToday. */
export interface FollowUpSummary {
  id: string;
  quoteId: string;
  quoteNumber?: number | null;
  type: string;
  notes?: string | null;
  scheduledAt: string | null;
  status?: string;
  client?: { name: string } | null;
}

/** Entrada do buildTodayTimeline (campos de operationalToday). */
export interface OperationalTodayInput {
  services?: ServiceOrderSummary[] | null;
  visits?: VisitSummary[] | null;
  followUps?: FollowUpSummary[] | null;
}

export type TimelineItemKind = 'visit' | 'service' | 'followUp';

export interface TimelineItem {
  id: string;
  kind: TimelineItemKind;
  title: string;
  subtitle: string | null;
  time: Date | null;
  route: string;
}

// ─── Status ─────────────────────────────────────────────────────────────────
// NOTA: o enum real (src/types/serviceOrder.ts) NÃO possui 'AGENDADA'.
// O par "AGENDADA ou EM_ANDAMENTO" da spec mapeia para os status ativos
// equivalentes (ainda não concluídos/cancelados e vinculados a agenda):
const OVERDUE_ELIGIBLE_STATUSES: readonly ServiceOrderStatus[] = [
  'PENDENTE',
  'EM_DESLOCAMENTO',
  'EM_ANDAMENTO',
];

const IN_PROGRESS_STATUS: ServiceOrderStatus = 'EM_ANDAMENTO';

// ─── Helpers internos ───────────────────────────────────────────────────────

/** Início do dia local (00:00) de uma data. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Converte ISO em Date; retorna null para null/undefined/inválido. */
function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clientName(client?: { name: string } | null): string | null {
  return client?.name ?? null;
}

// ─── (a) OS atrasada ────────────────────────────────────────────────────────

/**
 * true se a OS está em status ainda acionável (ver OVERDUE_ELIGIBLE_STATUSES)
 * e scheduledDate é anterior ao início do dia de `now` (00:00 local).
 */
export function isServiceOverdue(
  so: { status: ServiceOrderStatus; scheduledDate: string | null | undefined },
  now: Date,
): boolean {
  if (!OVERDUE_ELIGIBLE_STATUSES.includes(so.status)) return false;
  const scheduled = toDate(so.scheduledDate);
  if (!scheduled) return false;
  return scheduled.getTime() < startOfDay(now).getTime();
}

// ─── (b) OS atrasadas ───────────────────────────────────────────────────────

export function computeOverdueServices(
  services: ServiceOrderSummary[],
  now: Date,
): ServiceOrderSummary[] {
  return services.filter((s) => isServiceOverdue(s, now));
}

// ─── (c) OS em andamento ────────────────────────────────────────────────────

/** OS com status EM_ANDAMENTO, independente da data. */
export function computeInProgressServices(
  services: ServiceOrderSummary[],
  now: Date,
): ServiceOrderSummary[] {
  void now; // mantido na assinatura da spec; não afeta o resultado
  return services.filter((s) => s.status === IN_PROGRESS_STATUS);
}

// ─── (d) Timeline do dia ────────────────────────────────────────────────────

function buildVisitItem(visit: VisitSummary): TimelineItem {
  const client = clientName(visit.client);
  const label = visit.title || visit.type || 'Visita';
  return {
    id: visit.id,
    kind: 'visit',
    title: client ? `${label} — ${client}` : label,
    subtitle: visit.notes ?? null,
    time: toDate(visit.time),
    route: '/(app)/agenda',
  };
}

function buildServiceItem(service: ServiceOrderSummary): TimelineItem {
  const client = clientName(service.client);
  const label = `OS #${service.code}`;
  return {
    id: service.id,
    kind: 'service',
    title: client ? `${label} — ${client}` : label,
    subtitle: service.work?.name ?? null,
    time: toDate(service.scheduledDate),
    route: `/(app)/servicos/${service.id}`,
  };
}

function buildFollowUpItem(followUp: FollowUpSummary): TimelineItem {
  const client = clientName(followUp.client);
  const label = 'Follow-up';
  return {
    id: followUp.id,
    kind: 'followUp',
    title: client ? `${label} — ${client}` : label,
    subtitle: followUp.notes ?? followUp.type,
    time: toDate(followUp.scheduledAt),
    route: followUp.quoteId
      ? `/(app)/orcamentos/${followUp.quoteId}`
      : '/(app)/orcamentos',
  };
}

const TIME_NULL_LAST = Number.MAX_SAFE_INTEGER;

/**
 * Merge de visits + services + followUps em itens de timeline,
 * ordenados por time crescente (time null no fim — ordenação estável).
 */
export function buildTodayTimeline(
  operationalToday: OperationalTodayInput,
  now: Date,
): TimelineItem[] {
  void now; // mantido na assinatura da spec; ordenação é por time do item
  const items: TimelineItem[] = [
    ...(operationalToday.visits ?? []).map(buildVisitItem),
    ...(operationalToday.services ?? []).map(buildServiceItem),
    ...(operationalToday.followUps ?? []).map(buildFollowUpItem),
  ];
  return items.sort((a, b) => {
    const ta = a.time ? a.time.getTime() : TIME_NULL_LAST;
    const tb = b.time ? b.time.getTime() : TIME_NULL_LAST;
    return ta - tb;
  });
}
