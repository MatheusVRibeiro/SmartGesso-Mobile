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
    return sum + (Number.isNaN(qty) ? 0 : qty * price);
  }, 0);
}

/**
 * Converte valor monetário (string formatada com máscara "R$ 1.500,00" ou número pt-BR)
 * de forma resiliente para número decimal.
 */
export function parseMonetaryValue(value: string | number | undefined | null): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  const str = String(value).trim();
  if (!str) return 0;

  if (str.includes('R$') || str.includes(',')) {
    const parsed = parseCurrencyInput(str);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const num = Number(str);
  return Number.isNaN(num) ? 0 : num;
}

/** Soma dos serviços (preço unitário de cada linha). */
export function computeServicesTotal(services: ServiceDraft[]): number {
  return services.reduce((sum, s) => sum + parseMonetaryValue(s.unitPrice), 0);
}

/** Total do orçamento: itens − desconto + margem (% sobre itens). */
export function computeQuoteTotal(
  itemsTotal: number,
  discount: string,
  marginPct: string,
): number {
  const discountValue = parseMonetaryValue(discount);
  const marginPctValue = parseNumber(marginPct);
  const safeItems = Number.isNaN(itemsTotal) ? 0 : itemsTotal;
  const safeDiscount = Number.isNaN(discountValue) ? 0 : discountValue;
  const safeMargin = Number.isNaN(marginPctValue) ? 0 : marginPctValue;
  return safeItems - safeDiscount + (safeItems * safeMargin) / 100;
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
      unitPrice: parseMonetaryValue(s.unitPrice),
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
    discount: parseMonetaryValue(draft.discount),
    marginPct: parseNumber(draft.marginPct),
    paymentMethod: draft.paymentMethod,
    observations,
    items,
  };
}
