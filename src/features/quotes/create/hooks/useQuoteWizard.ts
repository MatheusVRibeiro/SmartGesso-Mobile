/**
 * SmartGesso Mobile — V5 ETAPA 9: navegação e validação por etapa do wizard.
 * Extraído verbatim do monólito (funções goNext/goBack) — as mesmas regras
 * de validação, as mesmas mensagens de erro, zero mudança de comportamento.
 */
import { useCallback, useState } from 'react';
import {
  isValidIsoDate,
  parseNumber,
  serviceRowSchema,
  stepClienteSchema,
  stepValoresSchema,
  STEP_META,
  type QuoteDraft,
  type ServiceErrors,
} from '../types';

const TOTAL_STEPS = STEP_META.length;

/** Erros por linha de serviço da etapa 'itens' (monólito: bloco do goNext). */
export function collectServiceRowErrors(draft: QuoteDraft): ServiceErrors {
  const errors: ServiceErrors = {};
  for (const service of draft.services) {
    const parsed = serviceRowSchema.safeParse(service);
    if (!parsed.success) {
      const row: { name?: string; unitPrice?: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as 'name' | 'unitPrice';
        row[field] = issue.message;
      }
      errors[service.id] = row;
    }
  }
  return errors;
}

export interface StepValidationResult {
  /** Mensagem de erro da etapa (exibida sob o conteúdo) — null se válida. */
  error: string | null;
  /** Erros por linha de serviço (etapa 'itens') — vazio caso contrário. */
  serviceErrors: ServiceErrors;
  /** true quando a etapa passou e o wizard deve avançar. */
  canAdvance: boolean;
}

/**
 * Valida a etapa atual exatamente como o goNext do monólito: para em
 * 'itens' quando há erro de linha (setando serviceErrors) e retorna a
 * mensagem de erro quando a etapa é inválida.
 */
export function validateStep(
  stepKey: string,
  draft: QuoteDraft,
): StepValidationResult {
  if (stepKey === 'cliente') {
    const parsed = stepClienteSchema.safeParse({ clientId: draft.clientId });
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? 'Verifique os dados',
        serviceErrors: {},
        canAdvance: false,
      };
    }
  }

  if (stepKey === 'ambientes') {
    const invalid = draft.environments.some((env) => !env.name.trim());
    if (invalid) {
      return {
        error: 'Informe o nome de todos os ambientes',
        serviceErrors: {},
        canAdvance: false,
      };
    }
  }

  if (stepKey === 'itens') {
    const invalid = draft.materials.filter((m) => {
      const qty = parseNumber(m.quantity);
      return Number.isNaN(qty) || qty <= 0;
    });
    if (invalid.length > 0) {
      return {
        error: `Quantidade inválida em ${invalid.length} ${
          invalid.length === 1 ? 'material' : 'materiais'
        }`,
        serviceErrors: {},
        canAdvance: false,
      };
    }

    const errors = collectServiceRowErrors(draft);
    if (Object.keys(errors).length > 0) {
      // Monólito: setava serviceErrors e retornava sem avançar, sem mensagem.
      return { error: null, serviceErrors: errors, canAdvance: false };
    }
    if (draft.services.length === 0 && draft.materials.length === 0) {
      return {
        error: 'Adicione ao menos um material ou um serviço',
        serviceErrors: {},
        canAdvance: false,
      };
    }
    return { error: null, serviceErrors: {}, canAdvance: true };
  }

  if (stepKey === 'valores') {
    const parsed = stepValoresSchema.safeParse({
      discount: draft.discount,
      marginPct: draft.marginPct,
    });
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? 'Verifique os valores',
        serviceErrors: {},
        canAdvance: false,
      };
    }
  }

  if (stepKey === 'prazo') {
    if (draft.prazoMode === 'A') {
      if (!isValidIsoDate(draft.startDate.trim())) {
        return {
          error: 'Informe a previsão de início (AAAA-MM-DD)',
          serviceErrors: {},
          canAdvance: false,
        };
      }
      const days = parseNumber(draft.durationDays);
      if (!Number.isInteger(days) || days <= 0) {
        return {
          error: 'Informe o prazo estimado em dias (inteiro maior que 0)',
          serviceErrors: {},
          canAdvance: false,
        };
      }
    }
    if (draft.prazoMode === 'B') {
      if (!isValidIsoDate(draft.startDate.trim())) {
        return {
          error: 'Informe a previsão de início (AAAA-MM-DD)',
          serviceErrors: {},
          canAdvance: false,
        };
      }
      if (!isValidIsoDate(draft.endDate.trim())) {
        return {
          error: 'Informe a previsão de conclusão (AAAA-MM-DD)',
          serviceErrors: {},
          canAdvance: false,
        };
      }
      if (draft.endDate.trim() < draft.startDate.trim()) {
        return {
          error: 'A conclusão não pode ser anterior ao início',
          serviceErrors: {},
          canAdvance: false,
        };
      }
    }
    if (draft.prazoMode === 'C') {
      if (!isValidIsoDate(draft.deadlineDate.trim())) {
        return {
          error: 'Informe a data limite de entrega (AAAA-MM-DD)',
          serviceErrors: {},
          canAdvance: false,
        };
      }
    }
  }

  return { error: null, serviceErrors: {}, canAdvance: true };
}

/**
 * Estado de navegação do wizard (currentStep/stepError) — equivalente ao
 * par useState do monólito + goNext/goBack.
 */
export function useQuoteWizard(draft: QuoteDraft) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const goNext = useCallback(
    (onServiceErrors: (errors: ServiceErrors) => void): void => {
      setStepError(null);
      const stepKey = STEP_META[currentStep].key;

      // QUIRK DO MONÓLITO PRESERVADO (V5 ETAPA 9 — zero mudança de
      // comportamento): no index.tsx original, o branch `stepKey === 'local'`
      // fazia `return (<LocalStep ... />)` dentro do handler goNext — JSX que
      // é descartado (retorno de onPress), pulando o setCurrentStep. Ou seja,
      // na etapa 'local' o botão "Continuar" nunca avançava. Reproduzimos o
      // mesmo early-return. Corrigir isso é arranho de regra/comportamento e
      // está FORA do escopo desta extração mecânica.
      if (stepKey === 'local') return;

      const result = validateStep(stepKey, draft);
      if (Object.keys(result.serviceErrors).length > 0) {
        onServiceErrors(result.serviceErrors);
      }
      if (!result.canAdvance) {
        setStepError(result.error);
        return;
      }

      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    },
    [currentStep, draft],
  );

  const goBack = useCallback(() => {
    setStepError(null);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  return { currentStep, stepError, setStepError, goNext, goBack };
}
