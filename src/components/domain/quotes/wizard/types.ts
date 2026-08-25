/**
 * SmartGesso Mobile — Tipos, helpers, constantes e schemas do wizard de orçamento.
 *
 * Extraído de app/(app)/orcamentos/novo.tsx (ETAPA 4) para melhorar
 * legibilidade e testabilidade. Mantém a mesma lógica de estado (draft).
 */
import type { Client, CreateClientInput } from '../../../../types/client';
import type {
  CreateQuoteInput,
  QuotePaymentMethod,
} from '../../../../types/quote';
import type { MeasurementApplicationType } from '../../../../types/measurement';
import type {
  QuoteEnvironment,
  QuoteEnvironmentMeasurement,
} from '../../../../types/quoteEnvironment';
import type {
  CalculateMaterialsInput,
  CalculateMaterialsResponse,
} from '../../../../types/composition';
import { z } from 'zod';
import { createQuoteSchema } from '../../../../validation/schemas';
import { parseCurrencyInput } from '../../../../utils/masks';

// ─── Tipos do wizard ────────────────────────────────────────────────────────

export type StepKey =
  | 'cliente'
  | 'local'
  | 'ambientes'
  | 'itens'
  | 'valores'
  | 'prazo'
  | 'pagamento'
  | 'revisao';

export interface ServiceDraft {
  id: string;
  name: string;
  unitPrice: string;
}

export interface MaterialDraft {
  key: string;
  materialType: string;
  name: string;
  unit: string;
  quantity: string;
  unitPrice?: number | null;
  total?: number | null;
}

/** Endereço livre do local do serviço (Etapa 2 — V3). */
export interface QuoteLocalDraft {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
}

/** Modos da etapa Prazo (V3): A = início + duração, B = início + conclusão, C = data-limite. */
export type PrazoMode = 'A' | 'B' | 'C';

/** Contagem do prazo no Modo A: dias úteis ou corridos. */
export type PrazoCalendar = 'UTEIS' | 'CORRIDOS';

/** Medição local de um ambiente dentro do wizard (campos em texto para edição). */
export interface QuoteEnvironmentMeasurementDraft {
  length: string;
  width: string;
  height: string;
  area: string;
  perimeter: string;
  observations: string;
}

/** Ambiente criado localmente no wizard — antes de ser persistido na API. */
export interface QuoteEnvironmentDraft {
  id: string;
  name: string;
  description: string;
  order: number;
  applicationType: MeasurementApplicationType;
  measurement: QuoteEnvironmentMeasurementDraft;
}

export interface QuoteDraft {
  clientId: string;
  local: QuoteLocalDraft;
  environments: QuoteEnvironmentDraft[];
  materials: MaterialDraft[];
  services: ServiceDraft[];
  discount: string;
  marginPct: string;
  prazoMode: PrazoMode;
  prazoCalendar: PrazoCalendar;
  startDate: string;
  durationDays: string;
  endDate: string;
  deadlineDate: string;
  deadlineObservation: string;
  paymentMethod: QuotePaymentMethod;
  observations: string;
}

export type ServiceErrors = Record<string, { name?: string; unitPrice?: string }>;

/** Estado derivado do cálculo de materiais. */
export interface MaterialsCalcState {
  key: string;
  result: CalculateMaterialsResponse;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real retorna array puro em GET /clients, /works e
 * /works/:workId/measurements (Prisma findMany), enquanto os tipos
 * declarados são { data, total }. Normaliza ambos os formatos.
 */
export function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

/** Converte texto digitado (pt-BR) em número. Aceita vírgula decimal. */
export function parseNumber(value: string): number {
  const normalized = String(value).trim().replace(',', '.');
  if (normalized === '') return 0;
  const n = Number(normalized);
  return Number.isNaN(n) ? NaN : n;
}

/** Converte texto em número — retorna undefined quando vazio/NaN. */
export function parseMeasurementValue(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = parseNumber(value);
  return Number.isNaN(n) ? undefined : n;
}

/** Verdadeiro se algum campo de medição do ambiente tem valor. */
export function environmentHasMeasurements(env: QuoteEnvironmentDraft): boolean {
  const m = env.measurement;
  return Boolean(
    m.length.trim() ||
      m.width.trim() ||
      m.height.trim() ||
      m.area.trim() ||
      m.perimeter.trim(),
  );
}

/** Valida data no formato AAAA-MM-DD (ISO). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Soma dias corridos a uma data ISO (AAAA-MM-DD). */
export function addDaysToIsoDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Soma dias úteis (seg–sex) a uma data ISO (AAAA-MM-DD). */
export function addBusinessDaysToIsoDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return date.toISOString().slice(0, 10);
}

/** Formata data ISO (AAAA-MM-DD) como DD/MM/AAAA. */
export function formatIsoDate(value: string): string {
  if (!isValidIsoDate(value)) return value;
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

/** Monta resumo legível do endereço local (Etapa 2). */
export function buildLocalSummary(local: QuoteLocalDraft): string {
  const parts = [
    [local.street.trim(), local.number.trim()].filter(Boolean).join(', '),
    local.complement.trim(),
    local.neighborhood.trim(),
    [local.city.trim(), local.state.trim()].filter(Boolean).join(' - '),
    local.zipCode.trim(),
  ].filter(Boolean);
  return parts.join(' · ');
}

/** Calcula a conclusão prevista (Modo A) a partir de início + prazo em dias. */
export function computeEndDate(draft: QuoteDraft): string | null {
  if (draft.prazoMode !== 'A') return null;
  const start = draft.startDate.trim();
  const days = parseNumber(draft.durationDays);
  if (!isValidIsoDate(start) || !Number.isInteger(days) || days <= 0) return null;
  return draft.prazoCalendar === 'UTEIS'
    ? addBusinessDaysToIsoDate(start, days)
    : addDaysToIsoDate(start, days);
}

/** Monta o payload de cálculo de materiais a partir das medições dos ambientes. */
export function buildCalculateInput(
  environments: QuoteEnvironmentDraft[],
): CalculateMaterialsInput {
  const measurements = environments
    .filter(environmentHasMeasurements)
    .flatMap((env) => {
      const m = env.measurement;
      return [
        {
          length: parseMeasurementValue(m.length),
          width: parseMeasurementValue(m.width),
          ceilingHeight: parseMeasurementValue(m.height),
          area: parseMeasurementValue(m.area),
          perimeter: parseMeasurementValue(m.perimeter),
        },
      ];
    });

  return {
    applicationType: environments[0]?.applicationType ?? 'DRYWALL',
    measurements,
  };
}

let serviceIdCounter = 0;
export function nextServiceId(): string {
  serviceIdCounter += 1;
  return `servico-${serviceIdCounter}`;
}

let environmentIdCounter = 0;
export function nextEnvironmentId(): string {
  environmentIdCounter += 1;
  return `env-${environmentIdCounter}`;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

export const PAYMENT_METHOD_OPTIONS: {
  value: QuotePaymentMethod;
  label: string;
}[] = [
  { value: 'AVISTA', label: 'À vista' },
  { value: 'AVISTA_DESCONTO', label: 'À vista c/ desconto' },
  { value: 'ENTRADA_SALDO', label: 'Entrada + saldo' },
  { value: 'QUINZENAL_2X', label: 'Quinzenal 2x' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'PARCELADO', label: 'Parcelado' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
];

export const APPLICATION_TYPE_BADGE: Record<
  MeasurementApplicationType,
  { variant: 'active' | 'warning' | 'expired' | 'cancelled'; label: string }
> = {
  DRYWALL: { variant: 'active', label: 'Drywall' },
  FORRO: { variant: 'warning', label: 'Forro' },
  PAREDE: { variant: 'active', label: 'Parede' },
  SANCA: { variant: 'expired', label: 'Sanca' },
  REBAIXAMENTO: { variant: 'warning', label: 'Rebaixamento' },
  OUTRO: { variant: 'cancelled', label: 'Outro' },
};

export const STEP_META: {
  key: StepKey;
  title: string;
  icon: string;
}[] = [
  { key: 'cliente', title: 'Cliente', icon: 'person-outline' },
  { key: 'local', title: 'Local', icon: 'location-outline' },
  { key: 'ambientes', title: 'Ambientes', icon: 'home-outline' },
  { key: 'itens', title: 'Serviço/Materiais', icon: 'cube-outline' },
  { key: 'valores', title: 'Valores', icon: 'calculator-outline' },
  { key: 'prazo', title: 'Prazo', icon: 'time-outline' },
  { key: 'pagamento', title: 'Pagamento', icon: 'card-outline' },
  { key: 'revisao', title: 'Revisão', icon: 'document-text-outline' },
];

// ─── Validação por etapa (zod) ──────────────────────────────────────────────

export const stepClienteSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente para continuar'),
});

export const serviceRowSchema = z.object({
  name: z.string().trim().min(1, 'Descrição é obrigatória'),
  unitPrice: z
    .string()
    .trim()
    .min(1, 'Informe o valor do serviço')
    .refine((v) => !Number.isNaN(parseCurrencyInput(v)), 'Valor inválido')
    .refine((v) => parseCurrencyInput(v) >= 0, 'Valor não pode ser negativo'),
});

export const stepValoresSchema = z.object({
  discount: z
    .string()
    .refine((v) => !Number.isNaN(parseCurrencyInput(v)), 'Desconto inválido')
    .refine((v) => parseCurrencyInput(v) >= 0, 'Desconto não pode ser negativo'),
  marginPct: z
    .string()
    .refine((v) => !Number.isNaN(parseNumber(v)), 'Margem inválida')
    .refine((v) => parseNumber(v) >= 0, 'Margem não pode ser negativa')
    .refine((v) => parseNumber(v) <= 100, 'Margem deve ser no máximo 100%'),
});

// Re-exporta tipos de API para os steps
export type {
  Client,
  CreateClientInput,
  CreateQuoteInput,
  QuotePaymentMethod,
  MeasurementApplicationType,
  QuoteEnvironment,
  QuoteEnvironmentMeasurement,
  CalculateMaterialsInput,
  CalculateMaterialsResponse,
};
