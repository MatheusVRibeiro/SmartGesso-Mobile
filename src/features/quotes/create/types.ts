/**
 * SmartGesso Mobile — V5 ETAPA 9: superfície de tipos do wizard de criação
 * de orçamento (src/features/quotes/create/).
 *
 * Fonte única de verdade: src/components/domain/quotes/wizard/types.ts
 * (compartilhado com os steps em components/domain/quotes/steps/).
 * Este módulo é apenas um facade de re-export — NENHUMA lógica nova.
 */
export type {
  StepKey,
  ServiceDraft,
  MaterialDraft,
  QuoteLocalDraft,
  PrazoMode,
  PrazoCalendar,
  QuoteEnvironmentMeasurementDraft,
  QuoteEnvironmentDraft,
  QuoteDraft,
  ServiceErrors,
  MaterialsCalcState,
  Client,
  CreateClientInput,
  CreateQuoteInput,
  QuotePaymentMethod,
  MeasurementApplicationType,
  QuoteEnvironment,
  QuoteEnvironmentMeasurement,
  CalculateMaterialsInput,
  CalculateMaterialsResponse,
} from '@/src/components/domain/quotes/wizard/types';

export {
  toArray,
  parseNumber,
  parseMeasurementValue,
  environmentHasMeasurements,
  isValidIsoDate,
  formatIsoDate,
  buildLocalSummary,
  computeEndDate,
  buildCalculateInput,
  nextServiceId,
  nextEnvironmentId,
  PAYMENT_METHOD_OPTIONS,
  STEP_META,
  stepClienteSchema,
  serviceRowSchema,
  stepValoresSchema,
} from '@/src/components/domain/quotes/wizard/types';
