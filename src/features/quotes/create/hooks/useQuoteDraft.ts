/**
 * SmartGesso Mobile — V5 ETAPA 9: estado do draft do wizard de orçamento.
 * Extraído verbatim do monólito src/screens/Orcamentos/NovoOrcamento/index.tsx
 * — mesma forma inicial, mesmos handlers, zero mudança de comportamento.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  nextEnvironmentId,
  nextServiceId,
  parseNumber,
  type MeasurementApplicationType,
  type QuoteDraft,
  type QuoteEnvironmentDraft,
  type QuoteEnvironmentMeasurementDraft,
  type ServiceErrors,
} from '../types';
import {
  computeMaterialsTotal,
  computeServicesTotal,
} from '../utils';

/** Forma inicial do draft — idêntica ao useState inicial do monólito. */
export function createInitialQuoteDraft(): QuoteDraft {
  return {
    clientId: '',
    local: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      reference: '',
    },
    environments: [],
    materials: [],
    services: [],
    discount: '',
    marginPct: '',
    prazoMode: 'A',
    prazoCalendar: 'UTEIS',
    startDate: '',
    durationDays: '',
    endDate: '',
    deadlineDate: '',
    deadlineObservation: '',
    paymentMethod: 'AVISTA',
    observations: '',
  };
}

/**
 * Estado central do wizard: draft + handlers mecânicos (sem regras novas).
 * Todos os handlers preservam a mesma forma de update funcional do monólito.
 */
export function useQuoteDraft() {
  const [draft, setDraft] = useState<QuoteDraft>(createInitialQuoteDraft);
  const [serviceErrors, setServiceErrors] = useState<ServiceErrors>({});

  // ── Handlers de ambientes (monólito: add/update/removeEnvironment, etc.) ──

  const addEnvironment = useCallback(() => {
    setDraft((d) => {
      const nextNum = d.environments.length + 1;
      const newEnv: QuoteEnvironmentDraft = {
        id: nextEnvironmentId(),
        name: `Ambiente ${nextNum}`,
        description: '',
        order: d.environments.length,
        applicationType: 'DRYWALL',
        measurement: {
          length: '',
          width: '',
          height: '',
          area: '',
          perimeter: '',
          observations: '',
        },
      };
      return {
        ...d,
        environments: [...d.environments, newEnv],
      };
    });
  }, []);

  const updateEnvironment = useCallback(
    (
      id: string,
      field: keyof QuoteEnvironmentDraft,
      value: string | MeasurementApplicationType,
    ) => {
      setDraft((d) => ({
        ...d,
        environments: d.environments.map((env) =>
          env.id === id ? { ...env, [field]: value } : env,
        ),
      }));
    },
    [],
  );

  const removeEnvironment = useCallback((id: string) => {
    setDraft((d) => ({
      ...d,
      environments: d.environments
        .filter((env) => env.id !== id)
        .map((env, index) => ({ ...env, order: index })),
    }));
  }, []);

  const updateMeasurement = useCallback(
    (
      envId: string,
      field: keyof QuoteEnvironmentMeasurementDraft,
      value: string,
    ) => {
      setDraft((d) => ({
        ...d,
        environments: d.environments.map((env) => {
          if (env.id !== envId) return env;
          const updatedMeasurement = { ...env.measurement, [field]: value };
          // Auto-calculate area when length or width changes
          if (field === 'length' || field === 'width') {
            const length = parseNumber(updatedMeasurement.length);
            const width = parseNumber(updatedMeasurement.width);
            if (
              !Number.isNaN(length) &&
              !Number.isNaN(width) &&
              length > 0 &&
              width > 0
            ) {
              updatedMeasurement.area = String(length * width);
            }
          }
          return { ...env, measurement: updatedMeasurement };
        }),
      }));
    },
    [],
  );

  const updateMaterialQuantity = useCallback((key: string, quantity: string) => {
    setDraft((d) => ({
      ...d,
      materials: d.materials.map((m) =>
        m.key === key ? { ...m, quantity } : m,
      ),
    }));
  }, []);

  // ── Handlers de serviços ──────────────────────────────────────────────────

  const addService = useCallback(() => {
    setDraft((d) => ({
      ...d,
      services: [...d.services, { id: nextServiceId(), name: '', unitPrice: '' }],
    }));
  }, []);

  const updateService = useCallback(
    (id: string, field: 'name' | 'unitPrice', value: string) => {
      setDraft((d) => ({
        ...d,
        services: d.services.map((s) =>
          s.id === id ? { ...s, [field]: value } : s,
        ),
      }));
      setServiceErrors((prev) => {
        const row = prev[id];
        if (!row) return prev;
        const next = { ...row, [field]: undefined };
        if (next.name == null && next.unitPrice == null) {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        }
        return { ...prev, [id]: next };
      });
    },
    [],
  );

  const removeService = useCallback((id: string) => {
    setDraft((d) => ({
      ...d,
      services: d.services.filter((s) => s.id !== id),
    }));
    setServiceErrors((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const setServiceErrorsState = setServiceErrors;

  /**
   * Totais derivados do draft. No monólito eram useMemo na tela; aqui ficam
   * memoizados dentro do hook (mesma chave de dependência: arrays do draft).
   */
  const { materialsTotal, servicesTotal } = useMemo(
    () => ({
      materialsTotal: computeMaterialsTotal(draft.materials),
      servicesTotal: computeServicesTotal(draft.services),
    }),
    [draft.materials, draft.services],
  );

  return {
    draft,
    setDraft,
    serviceErrors,
    setServiceErrors: setServiceErrorsState,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    updateMeasurement,
    updateMaterialQuantity,
    addService,
    updateService,
    removeService,
    materialsTotal,
    servicesTotal,
  };
}
