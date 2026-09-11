/**
 * SmartGesso Mobile — V5 ETAPA 9: submissão do orçamento (criação e edição)
 * e persistência de ambientes.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiError } from '@/src/services/api/client';
import { clientsService } from '@/src/services/api/clients';
import { quotesService } from '@/src/services/api/quotes';
import { quoteEnvironmentsService } from '@/src/services/api/quoteEnvironments';
import { createQuoteSchema } from '@/src/validation/schemas';
import { buildQuotePayload } from '../utils';
import {
  parseMeasurementValue,
  type CreateClientInput,
  type CreateQuoteInput,
  type QuoteDraft,
} from '../types';
import type { QuoteSnackbarState } from './useQuoteSubmit.types';

/** Persiste ambientes e medições do draft após o orçamento ser criado. */
async function persistEnvironments(
  quoteId: string,
  draft: QuoteDraft,
): Promise<void> {
  if (draft.environments.length === 0) return;
  for (const env of draft.environments) {
    const createdEnv = await quoteEnvironmentsService.createEnvironment(
      quoteId,
      {
        name: env.name.trim() || `Ambiente ${env.order + 1}`,
        description: env.description.trim() || undefined,
        order: env.order,
      },
    );
    const m = env.measurement;
    const hasMeasurements =
      m.length.trim() ||
      m.width.trim() ||
      m.height.trim() ||
      m.area.trim() ||
      m.perimeter.trim();
    if (hasMeasurements) {
      await quoteEnvironmentsService.addMeasurement(quoteId, createdEnv.id, {
        length: parseMeasurementValue(m.length),
        width: parseMeasurementValue(m.width),
        height: parseMeasurementValue(m.height),
        area: parseMeasurementValue(m.area),
        perimeter: parseMeasurementValue(m.perimeter),
        observations: m.observations.trim() || undefined,
      });
    }
  }
}

export interface UseQuoteSubmitParams {
  companyId?: string | null;
  /** Se informado, executa atualização (PATCH /quotes/:id) em vez de criação */
  editQuoteId?: string | null;
  /** Navegação — no monólito, `router.back()` após sucesso. */
  onBack: () => void;
  setSnackbar: (value: QuoteSnackbarState | null) => void;
  /**
   * Fluxo do cadastro rápido de cliente (V3 §12): no monólito o onSuccess da
   * mutation chamava handleSelectClient(client.id) e fechava o modal.
   */
  onClientCreated: (clientId: string) => void;
  onCloseQuickClient: () => void;
}

/**
 * Mutations de criação / edição (orçamento + cadastro rápido de cliente) e handler
 * de submissão com validação por schema.
 */
export function useQuoteSubmit({
  companyId,
  editQuoteId,
  onBack,
  setSnackbar,
  onClientCreated,
  onCloseQuickClient,
}: UseQuoteSubmitParams) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      data,
      draft,
    }: {
      data: CreateQuoteInput;
      draft: QuoteDraft;
    }) => quotesService.create(data),
    onSuccess: async (quote, { draft }) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      try {
        await persistEnvironments(quote.id, draft);
      } catch (error) {
        setSnackbar({
          type: 'error',
          message: `Orçamento criado, mas falha ao salvar ambientes: ${toApiError(error).message}`,
        });
        return;
      }
      setSnackbar({ type: 'success', message: 'Orçamento criado com sucesso' });
      setTimeout(() => onBack(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      draft,
    }: {
      id: string;
      data: CreateQuoteInput;
      draft: QuoteDraft;
    }) => quotesService.update(id, data),
    onSuccess: async (quote, { draft }) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes', editQuoteId],
      });
      try {
        await persistEnvironments(quote.id, draft);
      } catch (error) {
        setSnackbar({
          type: 'error',
          message: `Orçamento atualizado, mas falha ao salvar ambientes: ${toApiError(error).message}`,
        });
        return;
      }
      setSnackbar({ type: 'success', message: 'Orçamento atualizado com sucesso' });
      setTimeout(() => onBack(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  // Cadastro rápido de cliente (V3 §12) — cria e já seleciona no wizard.
  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.create(data),
    onSuccess: (client) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'clients'],
      });
      onClientCreated(client.id);
      onCloseQuickClient();
      setSnackbar({ type: 'success', message: 'Cliente cadastrado com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  /** Valida com createQuoteSchema antes de mutar (criação ou atualização). */
  function handleSubmit(draft: QuoteDraft) {
    const payload = buildQuotePayload(draft);
    const parsed = createQuoteSchema.safeParse(payload);
    if (!parsed.success) {
      setSnackbar({
        type: 'error',
        message:
          parsed.error.issues[0]?.message ??
          'Verifique os dados do orçamento',
      });
      return;
    }
    if (editQuoteId) {
      updateMutation.mutate({ id: editQuoteId, data: payload, draft });
    } else {
      createMutation.mutate({ data: payload, draft });
    }
  }

  return {
    createMutation,
    updateMutation,
    createClientMutation,
    handleSubmit,
  };
}
