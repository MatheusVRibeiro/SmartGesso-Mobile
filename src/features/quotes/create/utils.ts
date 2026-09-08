/**
 * SmartGesso Mobile — V5 ETAPA 9: funções puras do wizard de criação de
 * orçamento. Movidas verbatim do monólito
 * src/screens/Orcamentos/NovoOrcamento/index.tsx (useMemo derivados +
 * buildPayload) — zero mudança de comportamento.
 */
import {
  parseNumber,
  computeEndDate,
  type CreateQuoteInput,
  type MaterialDraft,
  type QuoteDraft,
  type QuoteEnvironmentDraft,
  type ServiceDraft,
} from './types';
import { parseCurrencyInput } from '@/src/utils/masks';

// ─── Derivados do draft (eram useMemo no monólito) ──────────────────────────

/**
 * Chave de cache do cálculo de materiais — muda quando qualquer medição de
 * ambiente muda (monólito: `calcKey`).
 */
export function computeCalcKey(environments: QuoteEnvironmentDraft[]): string {
  return environments
    .map(
      (env) =>
        `${env.id}:${env.measurement.length}:${env.measurement.width}:${env.measurement.height}:${env.measurement.area}:${env.measurement.perimeter}`,
    )
    .sort()
    .join('|');
}

/** Soma dos materiais (quantidade × preço unitário). */
export function computeMaterialsTotal(materials: MaterialDraft[]): number {
  return materials.reduce((sum, m) => {
    const qty = parseNumber(m.quantity);
    const price = m.unitPrice ?? 0;
    return sum + qty * price;
  }, 0);
}

/** Soma dos serviços (preço unitário de cada linha). */
export function computeServicesTotal(services: ServiceDraft[]): number {
  return services.reduce((sum, s) => sum + parseNumber(s.unitPrice), 0);
}

/** Total do orçamento: itens − desconto + margem (% sobre itens). */
export function computeQuoteTotal(
  itemsTotal: number,
  discount: string,
  marginPct: string,
): number {
  const discountValue = parseNumber(discount);
  const marginPctValue = parseNumber(marginPct);
  return itemsTotal - discountValue + (itemsTotal * marginPctValue) / 100;
}

// ─── Payload de submissão (monólito: buildPayload) ──────────────────────────

/**
 * Monta o DTO final — mesmo formato do formulário anterior (não quebra a API).
 */
export function buildQuotePayload(draft: QuoteDraft): CreateQuoteInput {
  const items: CreateQuoteInput['items'] = [
    ...draft.materials.map((m) => ({
      itemType: 'MATERIAL' as const,
      name: m.name.trim(),
      quantity: parseNumber(m.quantity),
      unit: m.unit.trim() || 'un',
      unitPrice: m.unitPrice ?? 0,
    })),
    ...draft.services.map((s) => ({
      itemType: 'SERVICO' as const,
      name: s.name.trim(),
      quantity: 1,
      unit: 'un',
      unitPrice: parseCurrencyInput(s.unitPrice),
    })),
  ];

  const local = draft.local;
  const hasLocal = Object.values(local).some((value) => value.trim() !== '');
  const startDate = draft.startDate.trim();
  const durationDays = parseNumber(draft.durationDays);
  const computedEnd = computeEndDate(draft);
  const observations =
    [draft.observations?.trim(), draft.deadlineObservation?.trim()]
      .filter(Boolean)
      .join('\n') || undefined;

  return {
    clientId: draft.clientId,
    localAddress: hasLocal
      ? {
          cep: local.zipCode.trim() || undefined,
          rua: local.street.trim() || undefined,
          numero: local.number.trim() || undefined,
          complemento: local.complement.trim() || undefined,
          bairro: local.neighborhood.trim() || undefined,
          cidade: local.city.trim() || undefined,
          estado: local.state.trim() || undefined,
          referencia: local.reference.trim() || undefined,
        }
      : undefined,
    startDate:
      draft.prazoMode === 'A' || draft.prazoMode === 'B'
        ? startDate || undefined
        : undefined,
    durationDays:
      draft.prazoMode === 'A' &&
      Number.isInteger(durationDays) &&
      durationDays > 0
        ? durationDays
        : undefined,
    endDate:
      draft.prazoMode === 'A'
        ? computedEnd ?? undefined
        : draft.prazoMode === 'B'
          ? draft.endDate.trim() || undefined
          : undefined,
    deadlineDate:
      draft.prazoMode === 'C'
        ? draft.deadlineDate.trim() || undefined
        : undefined,
    discount: parseNumber(draft.discount),
    marginPct: parseNumber(draft.marginPct),
    paymentMethod: draft.paymentMethod,
    observations,
    items,
  };
}
