/**
 * SmartGesso Mobile — V5 ETAPA 9: cálculo de materiais (Etapa 4 do wizard).
 * Extraído verbatim do monólito src/screens/Orcamentos/NovoOrcamento/index.tsx
 * (estado materialsCalc* + runMaterialsCalculation + useEffect de auto-run)
 * — zero mudança de comportamento.
 */
import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { toApiError } from '@/src/services/api/client';
import { compositionsService } from '@/src/services/api/compositions';
import {
  buildCalculateInput,
  environmentHasMeasurements,
  type MaterialsCalcState,
  type QuoteDraft,
  type QuoteEnvironmentDraft,
} from '../types';

/**
 * Gerencia o cálculo de materiais a partir dos ambientes do draft.
 *
 * @param setDraft   setter do draft (useQuoteDraft) — o resultado do cálculo
 *                   substitui draft.materials, como no monólito.
 * @param currentStep etapa atual do wizard — o efeito de auto-run só roda
 *                    na etapa de índice 3 ('itens'), como no monólito.
 * @param calcKey    chave de cache das medições (computeCalcKey).
 * @param environments ambientes atuais do draft.
 */
export function useMaterialCalculation(
  setDraft: Dispatch<SetStateAction<QuoteDraft>>,
  currentStep: number,
  calcKey: string,
  environments: QuoteEnvironmentDraft[],
) {
  const [materialsCalc, setMaterialsCalc] = useState<MaterialsCalcState | null>(
    null,
  );
  const [materialsCalcPending, setMaterialsCalcPending] = useState(false);
  const [materialsCalcError, setMaterialsCalcError] = useState<string | null>(
    null,
  );

  const runMaterialsCalculation = useCallback(
    (environmentsToCalc: QuoteEnvironmentDraft[], key: string) => {
      const environmentsWithMeasurements = environmentsToCalc.filter(
        environmentHasMeasurements,
      );
      if (environmentsWithMeasurements.length === 0) return;
      setMaterialsCalcPending(true);
      setMaterialsCalcError(null);
      compositionsService
        .calculate(buildCalculateInput(environmentsToCalc))
        .then((result) => {
          setMaterialsCalc({ key, result });
          setDraft((d) => ({
            ...d,
            materials: result.items.map((item, index) => ({
              key: `${item.materialType}-${item.name}-${index}`,
              materialType: item.materialType,
              name: item.name,
              unit: item.unit,
              quantity: String(item.quantity),
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          }));
        })
        .catch((error: unknown) => {
          setMaterialsCalcError(toApiError(error).message);
        })
        .finally(() => setMaterialsCalcPending(false));
    },
    [setDraft],
  );

  // Auto-run ao entrar/alterar medições na etapa de itens (índice 3).
  useEffect(() => {
    if (currentStep !== 3) return;
    const key = calcKey;
    if (key === '') {
      setMaterialsCalc(null);
      setDraft((d) => (d.materials.length > 0 ? { ...d, materials: [] } : d));
      return;
    }
    if (materialsCalc?.key === key) return;
    if (environments.length === 0) return;
    runMaterialsCalculation(environments, key);
  }, [
    currentStep,
    calcKey,
    environments,
    materialsCalc,
    runMaterialsCalculation,
    setDraft,
  ]);

  return {
    materialsCalc,
    materialsCalcPending,
    materialsCalcError,
    runMaterialsCalculation,
    /** Limpa o estado do cálculo (monólito: setMaterialsCalc(null)). */
    clearMaterialsCalc: useCallback(() => setMaterialsCalc(null), []),
  };
}
