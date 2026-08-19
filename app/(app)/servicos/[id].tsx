import React, { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { clientsService } from '../../../src/services/api/clients';
import { expensesService } from '../../../src/services/api/expenses';
import { paymentsService } from '../../../src/services/api/payments';
import { productionOrdersService } from '../../../src/services/api/productionOrders';
import { quotesService } from '../../../src/services/api/quotes';
import { serviceOrdersService } from '../../../src/services/api/serviceOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { PermissionGate } from '../../../src/components/domain/PermissionGate';
import { PhotoPicker } from '../../../src/components/domain/PhotoPicker';
import { COST_VIEW_ROLES } from '../../../src/types/permissions';
import { savePhotoLocally } from '../../../src/services/photos/photoStorage';
import { borders, colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency, formatNumber } from '../../../src/utils/format';
import type { PhotoAttachment } from '../../../src/types/photo';
import type {
  ProductionOrder,
  RegisterServiceOrderResultInput,
  ServiceOrder,
  ServiceOrderStatus,
} from '../../../src/types/serviceOrder';

// ─── Helpers ────────────────────────────────────────────────────────────────

const SERVICE_ORDER_STATUS_BADGE: Record<
  ServiceOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Agendado' },
  EM_DESLOCAMENTO: { variant: 'info', label: 'Em deslocamento' },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento' },
  PAUSADA: { variant: 'suspended', label: 'Pausado' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

/** Etapas do status expandido — ordem de exibição no timeline. */
const SERVICE_ORDER_STATUS_STEPS: Array<{
  status: ServiceOrderStatus;
  label: string;
}> = [
  { status: 'PENDENTE', label: 'Agendado' },
  { status: 'EM_DESLOCAMENTO', label: 'Em deslocamento' },
  { status: 'EM_ANDAMENTO', label: 'Em andamento' },
  { status: 'PAUSADA', label: 'Pausado' },
  { status: 'CONCLUIDA', label: 'Concluído' },
];

/** Itens padrão do checklist de execução da OS. */
const CHECKLIST_ITEMS = [
  'Material carregado',
  'Local protegido',
  'Estrutura instalada',
  'Placas instaladas',
  'Acabamento',
  'Limpeza',
] as const;

/** Motivos de pausa/atraso (V3 §35) — chips selecionáveis no modal. */
const PAUSE_REASONS = [
  'Aguardando cliente',
  'Aguardando material',
  'Chuva',
  'Ambiente não liberado',
  'Outro fornecedor',
  'Problema técnico',
  'Reagendamento',
  'Outro',
] as const;

/**
 * Pré-requisitos para início (V3 §34) — chaves `prereq_*` persistidas no
 * checklist Json existente (PATCH /service-orders/:id com { checklist }),
 * sem campo novo na API.
 */
const PREREQ_ITEMS = [
  { key: 'prereq_ambiente_liberado', label: 'Ambiente liberado' },
  { key: 'prereq_material_disponivel', label: 'Material disponível' },
  { key: 'prereq_eletrica_finalizada', label: 'Elétrica finalizada' },
  { key: 'prereq_local_seco', label: 'Local seco' },
  { key: 'prereq_acesso_liberado', label: 'Acesso liberado' },
  { key: 'prereq_outro', label: 'Outro' },
] as const;

/** Etapas do serviço (V3 §33) — timeline interativa; nem todo serviço usa todas. */
const SERVICE_ORDER_ETAPAS = [
  { key: 'medicao', label: 'Medição' },
  { key: 'producao', label: 'Produção' },
  { key: 'separacao', label: 'Separação de material' },
  { key: 'transporte', label: 'Transporte' },
  { key: 'instalacao', label: 'Instalação' },
  { key: 'acabamento', label: 'Acabamento' },
  { key: 'retorno', label: 'Retorno' },
  { key: 'entrega', label: 'Entrega' },
] as const;

/** Slots de fotos (antes/durante/depois) — V3 §67, captura real. */
const PHOTO_SLOTS = [
  { key: 'antes', label: 'Antes' },
  { key: 'durante', label: 'Durante' },
  { key: 'depois', label: 'Depois' },
] as const;

type PhotoSlotKey = (typeof PHOTO_SLOTS)[number]['key'];

interface StatusTransition {
  to: ServiceOrderStatus;
  label: string;
  completedDate?: boolean;
  /** Motivo da pausa (V3 §35) — preenchido pelo modal antes do PATCH. */
  pauseReason?: string;
}

/** Transições de status disponíveis a partir do status atual. */
function getStatusTransitions(status: ServiceOrderStatus): StatusTransition[] {
  switch (status) {
    case 'PENDENTE':
      return [
        { to: 'EM_DESLOCAMENTO', label: 'Iniciar deslocamento' },
        { to: 'EM_ANDAMENTO', label: 'Iniciar serviço' },
      ];
    case 'EM_DESLOCAMENTO':
      return [{ to: 'EM_ANDAMENTO', label: 'Iniciar serviço' }];
    case 'EM_ANDAMENTO':
      return [
        { to: 'PAUSADA', label: 'Pausar' },
        { to: 'CONCLUIDA', label: 'Concluir', completedDate: true },
      ];
    case 'PAUSADA':
      return [{ to: 'EM_ANDAMENTO', label: 'Retomar' }];
    default:
      return [];
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

/** dd/mm — datas de prazo do serviço (V3 central operacional). */
function formatDayMonth(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Dias inteiros entre hoje e a data-alvo — negativo = passado. */
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Badge de prazo: faltam X dias (warning) / atrasado X dias (danger) / concluído. */
function getPrazoBadge(
  order: ServiceOrder,
  referenceDate: string | null,
): { variant: StatusBadgeVariant; label: string } | null {
  if (!referenceDate) return null;
  if (order.status === 'CONCLUIDA') {
    return { variant: 'active', label: 'Concluído' };
  }
  if (order.status === 'CANCELADA') return null;
  const days = daysUntil(referenceDate);
  if (days > 0) {
    return { variant: 'warning', label: `Faltam ${days} ${days === 1 ? 'dia' : 'dias'}` };
  }
  if (days === 0) return { variant: 'warning', label: 'Hoje' };
  const late = Math.abs(days);
  return { variant: 'expired', label: `Atrasado ${late} ${late === 1 ? 'dia' : 'dias'}` };
}

// ─── Modal de registro de resultado ─────────────────────────────────────────

/**
 * A API real retorna array puro em GET /production-orders (Prisma findMany),
 * enquanto o tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

interface RegisterResultModalProps {
  visible: boolean;
  loading: boolean;
  onConfirm: (cost: number, saleValue: number) => void;
  onClose: () => void;
}

function RegisterResultModal({
  visible,
  loading,
  onConfirm,
  onClose,
}: RegisterResultModalProps) {
  const [cost, setCost] = useState('');
  const [saleValue, setSaleValue] = useState('');

  const costNum = parseFloat(cost.replace(',', '.'));
  const saleNum = parseFloat(saleValue.replace(',', '.'));
  const costInvalid = cost.trim() !== '' && (Number.isNaN(costNum) || costNum < 0);
  const saleInvalid = saleValue.trim() !== '' && (Number.isNaN(saleNum) || saleNum < 0);
  const invalid =
    cost.trim() === '' || saleValue.trim() === '' || costInvalid || saleInvalid;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Registrar resultado</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar registro de resultado"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.modalBody}>
          <AppInput
            label="Custo"
            required
            value={cost}
            onChangeText={setCost}
            placeholder="0,00"
            keyboardType="decimal-pad"
            error={costInvalid ? 'Informe um valor válido' : undefined}
            accessibilityLabel="Custo do serviço"
          />

          <AppInput
            label="Venda"
            required
            value={saleValue}
            onChangeText={setSaleValue}
            placeholder="0,00"
            keyboardType="decimal-pad"
            error={saleInvalid ? 'Informe um valor válido' : undefined}
            accessibilityLabel="Valor de venda do serviço"
          />

          <AppButton
            title="Registrar"
            size="lg"
            accessibilityLabel="Confirmar registro de resultado"
            onPress={() => onConfirm(costNum, saleNum)}
            loading={loading}
            disabled={loading || invalid}
            style={styles.modalConfirmButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Modal de motivo de pausa/atraso (V3 §35) ───────────────────────────────

interface PauseReasonModalProps {
  visible: boolean;
  loading: boolean;
  /** true = registrar atraso sem mudar status; false = pausar (muda status). */
  pauseOnly?: boolean;
  onConfirm: (reason: string, observation: string) => void;
  onClose: () => void;
}

function PauseReasonModal({
  visible,
  loading,
  pauseOnly = false,
  onConfirm,
  onClose,
}: PauseReasonModalProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [observation, setObservation] = useState('');

  // Reset do formulário a cada abertura.
  useEffect(() => {
    if (visible) {
      setReason(null);
      setObservation('');
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {pauseOnly ? 'Motivo do atraso' : 'Motivo da pausa'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar motivo"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.modalBody}>
          <Text style={styles.pauseModalHint}>
            {pauseOnly
              ? 'Registre o motivo do atraso desta ordem de serviço.'
              : 'Selecione o motivo da pausa e, se quiser, adicione uma observação.'}
          </Text>

          <View style={styles.pauseReasonsGrid}>
            {PAUSE_REASONS.map((item) => {
              const selected = reason === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`Motivo ${item}`}
                  accessibilityState={{ selected }}
                  onPress={() => setReason(item)}
                  style={({ pressed }) => [
                    styles.pauseReasonChip,
                    selected && styles.pauseReasonChipSelected,
                    pressed && styles.pauseReasonChipPressed,
                  ]}
                >
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={sizes.icon.sm}
                    color={selected ? colors.primary : colors.textLight}
                    accessibilityElementsHidden
                  />
                  <Text
                    style={[
                      styles.pauseReasonChipText,
                      selected && styles.pauseReasonChipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <AppInput
            label="Observação (opcional)"
            value={observation}
            onChangeText={setObservation}
            placeholder="Detalhes do motivo..."
            multiline
            numberOfLines={3}
            accessibilityLabel="Observação do motivo"
            style={styles.pauseObservationInput}
          />

          <Text style={styles.pauseDateHint}>
            Data registrada automaticamente:{' '}
            {new Date().toLocaleDateString('pt-BR')}
          </Text>

          <AppButton
            title={pauseOnly ? 'Registrar motivo' : 'Pausar serviço'}
            size="lg"
            accessibilityLabel="Confirmar motivo"
            onPress={() => onConfirm(reason ?? '', observation)}
            loading={loading}
            disabled={loading || !reason}
            style={styles.modalConfirmButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalheOrdemServicoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [refreshing, setRefreshing] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  // Pausa/atraso (V3 §35) — modal de motivo antes do PATCH de status.
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [pendingPauseTransition, setPendingPauseTransition] =
    useState<StatusTransition | null>(null);
  // Pré-requisitos (V3 §34) — confirmação antes de iniciar com itens pendentes.
  const [prereqConfirmVisible, setPrereqConfirmVisible] = useState(false);
  const [pendingStartTransition, setPendingStartTransition] =
    useState<StatusTransition | null>(null);
  const [servicePhotos, setServicePhotos] = useState<
    Record<PhotoSlotKey, PhotoAttachment | null>
  >({ antes: null, durante: null, depois: null });
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  // Scroll programático para os atalhos "Atualizar status" / "Ver checklist".
  const scrollRef = useRef<ScrollView>(null);
  const statusSectionY = useRef(0);
  const checklistSectionY = useRef(0);
  const photosSectionY = useRef(0);

  const orderQuery = useQuery({
    queryKey: ['company', companyId, 'service-orders', orderId],
    queryFn: () => serviceOrdersService.getById(orderId as string),
    enabled: Boolean(companyId && orderId),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await orderQuery.refetch();
    setRefreshing(false);
  };

  const statusMutation = useMutation({
    mutationFn: (transition: StatusTransition) =>
      serviceOrdersService.update(orderId as string, {
        status: transition.to,
        ...(transition.completedDate
          ? { completedDate: new Date().toISOString() }
          : {}),
        ...(transition.pauseReason
          ? { pauseReason: transition.pauseReason }
          : {}),
      }),
    onSuccess: (_data, transition) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setSnackbar({
        type: 'success',
        message: transition.to === 'CONCLUIDA'
          ? 'Ordem de serviço concluída com sucesso'
          : 'Status atualizado com sucesso',
      });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  // Motivo de atraso (V3 §35) — PATCH { pauseReason } sem mudar o status
  // (usado para OS atrasada que ainda não foi pausada).
  const pauseReasonMutation = useMutation({
    mutationFn: (pauseReason: string) =>
      serviceOrdersService.update(orderId as string, { pauseReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setSnackbar({ type: 'success', message: 'Motivo registrado com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const checklistMutation = useMutation({
    mutationFn: (checklist: Record<string, boolean>) =>
      serviceOrdersService.update(orderId as string, { checklist }),
    onMutate: async (checklist) => {
      await queryClient.cancelQueries({
        queryKey: ['company', companyId, 'service-orders', orderId],
      });
      const previous = queryClient.getQueryData<ServiceOrder>([
        'company',
        companyId,
        'service-orders',
        orderId,
      ]);
      if (previous) {
        queryClient.setQueryData<ServiceOrder>(
          ['company', companyId, 'service-orders', orderId],
          { ...previous, checklist },
        );
      }
      return { previous };
    },
    onError: (error: unknown, _checklist, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['company', companyId, 'service-orders', orderId],
          context.previous,
        );
      }
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
    },
  });

  // Etapas do serviço (V3 §33) — timeline interativa com optimistic update.
  const etapasMutation = useMutation({
    mutationFn: (etapas: Record<string, boolean>) =>
      serviceOrdersService.updateEtapas(orderId as string, etapas),
    onMutate: async (etapas) => {
      await queryClient.cancelQueries({
        queryKey: ['company', companyId, 'service-orders', orderId],
      });
      const previous = queryClient.getQueryData<ServiceOrder>([
        'company',
        companyId,
        'service-orders',
        orderId,
      ]);
      if (previous) {
        queryClient.setQueryData<ServiceOrder>(
          ['company', companyId, 'service-orders', orderId],
          { ...previous, etapas },
        );
      }
      return { previous };
    },
    onError: (error: unknown, _etapas, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['company', companyId, 'service-orders', orderId],
          context.previous,
        );
      }
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
    },
  });

  // Produção opcional (V3 §44) — Sim/Não persistido na OS com optimistic update.
  const needsProductionMutation = useMutation({
    mutationFn: (needsProduction: boolean) =>
      serviceOrdersService.updateNeedsProduction(orderId as string, needsProduction),
    onMutate: async (needsProduction) => {
      await queryClient.cancelQueries({
        queryKey: ['company', companyId, 'service-orders', orderId],
      });
      const previous = queryClient.getQueryData<ServiceOrder>([
        'company',
        companyId,
        'service-orders',
        orderId,
      ]);
      if (previous) {
        queryClient.setQueryData<ServiceOrder>(
          ['company', companyId, 'service-orders', orderId],
          { ...previous, needsProduction },
        );
      }
      return { previous };
    },
    onError: (error: unknown, _needsProduction, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['company', companyId, 'service-orders', orderId],
          context.previous,
        );
      }
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
    },
  });

  // Cliente completo (telefone/WhatsApp/endereço) para as ações rápidas.
  const clientQuery = useQuery({
    queryKey: ['company', companyId, 'clients', orderQuery.data?.clientId],
    queryFn: () => clientsService.getById(orderQuery.data!.clientId),
    enabled: Boolean(companyId && orderQuery.data?.clientId),
  });

  // Financeiro (V3) — pagamentos da empresa; recebido = soma CONFIRMADO do cliente.
  const paymentsQuery = useQuery({
    queryKey: ['company', companyId, 'payments'],
    queryFn: () => paymentsService.list(),
    enabled: Boolean(companyId),
  });

  // Custos (V3) — despesas da empresa; vinculadas = serviceOrderId === ordem.
  const expensesQuery = useQuery({
    queryKey: ['company', companyId, 'expenses'],
    queryFn: () => expensesService.list(),
    enabled: Boolean(companyId),
  });

  // Produção (V3 §44) — ordens de produção do cliente para vincular à OS.
  const productionOrdersQuery = useQuery({
    queryKey: ['company', companyId, 'production-orders'],
    queryFn: () => productionOrdersService.list(),
    enabled: Boolean(companyId && orderQuery.data?.needsProduction),
  });

  const registerResultMutation = useMutation({
    mutationFn: (data: RegisterServiceOrderResultInput) =>
      serviceOrdersService.registerResult(orderId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setResultModalVisible(false);
      setSnackbar({ type: 'success', message: 'Resultado registrado com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => serviceOrdersService.remove(orderId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Ordem de serviço excluída com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  if (!orderId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Ordem de serviço', headerShown: true }} />
        <ErrorState message="Ordem de serviço não encontrada" />
      </ScreenContainer>
    );
  }

  const order = orderQuery.data;
  const statusBadge = order ? SERVICE_ORDER_STATUS_BADGE[order.status] : null;

  // ─── Central operacional (V3): prazo, financeiro, custos, atalhos ────────

  /** Campos de prazo que a API ainda não expõe na ServiceOrder (forward-compatible). */
  type ServiceOrderPrazoFields = ServiceOrder & {
    startedDate?: string | null;
    endDate?: string | null;
    deadlineDate?: string | null;
  };
  const prazoFields = order as ServiceOrderPrazoFields | undefined;
  const startedDate = prazoFields?.startedDate ?? null;
  const deliveryDate =
    prazoFields?.endDate ?? prazoFields?.deadlineDate ?? null;
  // Contagem regressiva usa a entrega prevista quando houver; senão, o início.
  const prazoReferenceDate = deliveryDate ?? order?.scheduledDate ?? null;
  const prazoBadge = order ? getPrazoBadge(order, prazoReferenceDate) : null;

  // Financeiro — recebido = soma de pagamentos CONFIRMADO do cliente
  // (parcelas confirmadas quando o pagamento é parcelado).
  const clientPayments = order
    ? (paymentsQuery.data?.data ?? []).filter(
        (payment) => payment.clientId === order.clientId,
      )
    : [];
  const receivedTotal = clientPayments.reduce((sum, payment) => {
    if (payment.installments && payment.installments.length > 0) {
      return (
        sum +
        payment.installments
          .filter((installment) => installment.status === 'CONFIRMADO')
          .reduce((s, installment) => s + installment.amount, 0)
      );
    }
    return payment.status === 'CONFIRMADO' ? sum + payment.amount : sum;
  }, 0);
  const contractedValue = order?.saleValue ?? null;
  const toReceiveValue =
    contractedValue != null ? contractedValue - receivedTotal : null;

  // Custos — despesas vinculadas ao serviço (serviceOrderId enviado pelo
  // mobile V3; filtro forward-compatible caso a API ainda não o retorne).
  const linkedExpenses = order
    ? (expensesQuery.data?.data ?? []).filter(
        (expense) => expense.serviceOrderId === order.id,
      )
    : [];
  const expensesTotal = linkedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  function scrollToSection(y: number) {
    scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing.md), animated: true });
  }

  // Atalhos (V3) — grid de ações rápidas da central operacional.
  const shortcuts = order
    ? [
        {
          key: 'pagamento',
          label: 'Registrar pagamento',
          icon: 'card-outline' as const,
          color: colors.success,
          backgroundColor: colors.successSoft,
          onPress: () =>
            router.push({
              pathname: '/pagamentos/novo',
              params: { clientId: order.clientId, serviceOrderId: order.id },
            }),
        },
        {
          key: 'despesa',
          label: 'Adicionar despesa',
          icon: 'receipt-outline' as const,
          color: colors.warning,
          backgroundColor: colors.warningSoft,
          onPress: () =>
            router.push({
              pathname: '/despesas/novo',
              params: { serviceOrderId: order.id },
            }),
        },
        {
          key: 'foto',
          label: 'Adicionar foto',
          icon: 'camera-outline' as const,
          color: colors.primary,
          backgroundColor: colors.primarySoft,
          onPress: () => scrollToSection(photosSectionY.current),
        },
        {
          key: 'status',
          label: 'Atualizar status',
          icon: 'swap-horizontal-outline' as const,
          color: colors.info,
          backgroundColor: colors.infoSoft,
          onPress: () => scrollToSection(statusSectionY.current),
        },
        {
          key: 'agenda',
          label: 'Ver agenda',
          icon: 'calendar-outline' as const,
          color: colors.primary,
          backgroundColor: colors.primarySoft,
          onPress: () =>
            setSnackbar({ type: 'info', message: 'Agenda disponível em breve' }),
        },
        {
          key: 'checklist',
          label: 'Ver checklist',
          icon: 'checkbox-outline' as const,
          color: colors.success,
          backgroundColor: colors.successSoft,
          onPress: () => scrollToSection(checklistSectionY.current),
        },
      ]
    : [];

  // Cliente completo (telefone/WhatsApp/endereço) — ações rápidas
  const client = clientQuery.data;
  const phone = client?.phone ?? null;
  const whatsapp = client?.whatsapp ?? null;

  function openRoute() {
    const address = [
      client?.street,
      client?.number,
      client?.district,
      client?.city,
      client?.state,
    ]
      .filter(Boolean)
      .join(', ');
    const query = address.trim() || client?.name?.trim() || '';
    if (!query) {
      setSnackbar({ type: 'error', message: 'Cliente sem endereço para traçar a rota' });
      return;
    }
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    ).catch(() => {
      setSnackbar({ type: 'error', message: 'Não foi possível abrir o mapa' });
    });
  }

  function openPhone() {
    if (!phone) {
      setSnackbar({ type: 'error', message: 'Cliente sem telefone cadastrado' });
      return;
    }
    Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`).catch(() => {
      setSnackbar({ type: 'error', message: 'Não foi possível abrir o discador' });
    });
  }

  function openWhatsApp() {
    const number = (whatsapp ?? phone)?.replace(/\D/g, '') ?? '';
    if (!number) {
      setSnackbar({ type: 'error', message: 'Cliente sem WhatsApp cadastrado' });
      return;
    }
    Linking.openURL(`https://wa.me/${number}`).catch(() => {
      setSnackbar({ type: 'error', message: 'Não foi possível abrir o WhatsApp' });
    });
  }

  function toggleChecklistItem(item: string) {
    if (!order) return;
    const current = order.checklist ?? {};
    checklistMutation.mutate({ ...current, [item]: !current[item] });
  }

  function toggleEtapa(key: string) {
    if (!order) return;
    const current = order.etapas ?? {};
    etapasMutation.mutate({ ...current, [key]: !current[key] });
  }

  /** Pré-requisito (V3 §34) — chaves `prereq_*` no checklist Json existente. */
  function togglePrereq(key: string) {
    if (!order) return;
    const current = order.checklist ?? {};
    checklistMutation.mutate({ ...current, [key]: !current[key] });
  }

  /**
   * Intercepta transições especiais:
   * - PAUSADA → abre o modal de motivo (V3 §35) antes do PATCH.
   * - EM_ANDAMENTO com pré-requisitos pendentes → ConfirmDialog (V3 §34),
   *   avisa mas não bloqueia (confirmar segue com o início).
   */
  function handleStatusPress(transition: StatusTransition) {
    if (transition.to === 'PAUSADA') {
      setPendingPauseTransition(transition);
      setPauseModalVisible(true);
      return;
    }
    if (transition.to === 'EM_ANDAMENTO') {
      const pending = PREREQ_ITEMS.filter(
        (item) => order?.checklist?.[item.key] !== true,
      );
      if (pending.length > 0) {
        setPendingStartTransition(transition);
        setPrereqConfirmVisible(true);
        return;
      }
    }
    statusMutation.mutate(transition);
  }

  /**
   * Confirma o motivo (pausa ou atraso): monta a string composta
   * "<motivo> — <observação> — dd/mm/aaaa" e faz o PATCH.
   */
  function confirmPause(reason: string, observation: string) {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const pauseReason = [reason, observation.trim(), dateStr]
      .filter(Boolean)
      .join(' — ');
    if (pendingPauseTransition) {
      statusMutation.mutate({ ...pendingPauseTransition, pauseReason });
    } else {
      pauseReasonMutation.mutate(pauseReason);
    }
    setPauseModalVisible(false);
    setPendingPauseTransition(null);
  }

  /** Foto do serviço: atualiza o estado e persiste localmente (sem upload na API). */
  async function handlePhotoChange(key: PhotoSlotKey, photo: PhotoAttachment | null) {
    setServicePhotos((prev) => ({ ...prev, [key]: photo }));
    if (!photo || !order) return;
    try {
      await savePhotoLocally(photo, `servicos/${order.id}`);
    } catch {
      setSnackbar({
        type: 'error',
        message: 'Não foi possível salvar a foto no dispositivo',
      });
    }
  }

  // Resultado do serviço (custo × venda → lucro/margem)
  const hasResult = order != null && order.cost != null && order.saleValue != null;
  const showResultSection =
    order != null &&
    (order.status === 'CONCLUIDA' || order.cost != null || order.saleValue != null);
  const cost = order?.cost ?? 0;
  const saleValue = order?.saleValue ?? 0;
  const profit = saleValue - cost;
  const marginPct = saleValue > 0 ? (profit / saleValue) * 100 : 0;
  const profitColor =
    profit > 0 ? colors.success : profit < 0 ? colors.danger : colors.text;

  // Orçamento de origem (planejado × realizado — V3 §48)
  const { data: originQuote } = useQuery({
    queryKey: ['company', companyId, 'quotes', order?.quoteId],
    queryFn: () => quotesService.getById(order!.quoteId!),
    enabled: Boolean(companyId && order?.quoteId),
  });
  const quoteTotal = originQuote?.total != null ? Number(originQuote.total) : null;

  // Índice do status atual no timeline expandido (para o stepper)
  const currentStepIndex = order
    ? SERVICE_ORDER_STATUS_STEPS.findIndex((s) => s.status === order.status)
    : -1;
  const statusTransitions = order ? getStatusTransitions(order.status) : [];

  // Etapas (V3 §33) — primeira não concluída = atual (→), concluídas = ✓, demais = ○.
  const etapas = order?.etapas ?? {};
  const currentEtapaIndex = SERVICE_ORDER_ETAPAS.findIndex(
    (etapa) => etapas[etapa.key] !== true,
  );
  const etapasConcluidas = SERVICE_ORDER_ETAPAS.filter(
    (etapa) => etapas[etapa.key] === true,
  ).length;

  // Produção (V3 §44) — ordens de produção do cliente para vincular à OS.
  const clientProductionOrders = order?.needsProduction
    ? toArray<ProductionOrder>(productionOrdersQuery.data).filter(
        (po) => po.clientId === order.clientId,
      )
    : [];

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false} scrollRef={scrollRef}>
        <Stack.Screen options={{ title: 'Detalhe da ordem de serviço', headerShown: true }} />
        
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Detalhe da OS</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir ordem de serviço"
              onPress={() => setConfirmDeleteVisible(true)}
              hitSlop={8}
              style={styles.headerAction}
            >
              <Ionicons name="trash-outline" size={sizes.icon.lg} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        {orderQuery.isLoading ? (
          <LoadingState text="Carregando ordem de serviço..." />
        ) : orderQuery.isError ? (
          <ErrorState
            message={toApiError(orderQuery.error).message}
            onRetry={orderQuery.refetch}
          />
        ) : order ? (
          <>
            <AppCard shadow="light" style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>OS #{order.code}</Text>
                {statusBadge && (
                  <StatusBadge status={statusBadge.variant} label={statusBadge.label} size="sm" />
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.orderRow}>
                <View style={styles.rowIcon}>
                  <Ionicons
                    name="person-outline"
                    size={sizes.icon.sm}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>Cliente</Text>
                  <Text style={styles.rowValue}>
                    {order.client?.name ?? 'Cliente não informado'}
                  </Text>
                </View>
              </View>

              {order.work && (
                <View style={styles.orderRow}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name="construct-outline"
                      size={sizes.icon.sm}
                      color={colors.primary}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>Obra</Text>
                    <Text style={styles.rowValue}>{order.work.name}</Text>
                  </View>
                </View>
              )}

              <View style={styles.orderRow}>
                <View style={styles.rowIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={sizes.icon.sm}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>Data</Text>
                  <Text style={styles.rowValue}>
                    {order.scheduledDate
                      ? `Agendada: ${formatDate(order.scheduledDate)}`
                      : `Criada: ${formatDate(order.createdAt)}`}
                  </Text>
                </View>
              </View>

              {order.completedDate && (
                <View style={styles.orderRow}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={sizes.icon.sm}
                      color={colors.success}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>Conclusão</Text>
                    <Text style={styles.rowValue}>
                      {formatDate(order.completedDate)}
                    </Text>
                  </View>
                </View>
              )}
            </AppCard>

            {/* ── Central operacional (V3): Prazo ─────────────────────────── */}
            <Text style={styles.sectionLabel}>Prazo</Text>
            <AppCard shadow="light" style={styles.prazoCard}>
              <View style={styles.prazoRow}>
                <View style={styles.prazoItem}>
                  <Text style={styles.prazoLabel}>Início previsto</Text>
                  <Text style={styles.prazoValue}>
                    {formatDayMonth(order.scheduledDate)}
                  </Text>
                </View>
                <View style={styles.prazoItem}>
                  <Text style={styles.prazoLabel}>Entrega prevista</Text>
                  <Text style={styles.prazoValue}>
                    {formatDayMonth(deliveryDate)}
                  </Text>
                </View>
                {startedDate ? (
                  <View style={styles.prazoItem}>
                    <Text style={styles.prazoLabel}>Início real</Text>
                    <Text style={styles.prazoValue}>
                      {formatDayMonth(startedDate)}
                    </Text>
                  </View>
                ) : null}
              </View>
              {prazoBadge && (
                <View style={styles.prazoBadgeWrap}>
                  <StatusBadge
                    status={prazoBadge.variant}
                    label={prazoBadge.label}
                    size="sm"
                  />
                </View>
              )}
              {prazoBadge?.variant === 'expired' &&
                order.status !== 'CONCLUIDA' &&
                order.status !== 'CANCELADA' && (
                  <AppButton
                    title="Registrar motivo de atraso"
                    variant="outline"
                    size="sm"
                    accessibilityLabel="Registrar motivo de atraso"
                    onPress={() => {
                      setPendingPauseTransition(null);
                      setPauseModalVisible(true);
                    }}
                    style={styles.prazoLateButton}
                  />
                )}
            </AppCard>

            {/* ── Central operacional (V3): Financeiro ────────────────────── */}
            <Text style={styles.sectionLabel}>Financeiro</Text>
            <AppCard shadow="light" style={styles.financeiroCard}>
              <View style={styles.financeiroRow}>
                <View style={styles.financeiroItem}>
                  <Text style={styles.financeiroLabel}>Contratado</Text>
                  <Text style={styles.financeiroValue}>
                    {formatCurrency(contractedValue)}
                  </Text>
                </View>
                <View style={styles.financeiroItem}>
                  <Text style={styles.financeiroLabel}>Recebido</Text>
                  <Text style={styles.financeiroValueSemibold}>
                    {formatCurrency(receivedTotal)}
                  </Text>
                </View>
                <View style={styles.financeiroItem}>
                  <Text style={styles.financeiroLabel}>A receber</Text>
                  <Text
                    style={[
                      styles.financeiroValueSemibold,
                      toReceiveValue != null && {
                        color: toReceiveValue > 0 ? colors.warning : colors.success,
                      },
                    ]}
                  >
                    {formatCurrency(toReceiveValue)}
                  </Text>
                </View>
              </View>
              {paymentsQuery.isLoading && (
                <Text style={styles.financeiroHint}>Carregando pagamentos...</Text>
              )}
            </AppCard>

            {/* ── Central operacional (V3): Custos ────────────────────────── */}
            <PermissionGate allow={COST_VIEW_ROLES}>
              <Text style={styles.sectionLabel}>Custos</Text>
              <AppCard shadow="light" style={styles.custosCard}>
                <View style={styles.custosRow}>
                  <View style={styles.custosIcon}>
                    <Ionicons
                      name="receipt-outline"
                      size={sizes.icon.md}
                      color={colors.warning}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.custosInfo}>
                    <Text style={styles.custosLabel}>Despesas vinculadas</Text>
                    <Text style={styles.custosValue}>
                      {formatCurrency(expensesTotal)}
                    </Text>
                  </View>
                </View>
                {expensesTotal === 0 && (
                  <Text style={styles.custosHint}>
                    Nenhuma despesa vinculada a este serviço
                  </Text>
                )}
              </AppCard>
            </PermissionGate>

            {/* ── Central operacional (V3): Atalhos ───────────────────────── */}
            <Text style={styles.sectionLabel}>Atalhos</Text>
            <View style={styles.shortcutsGrid}>
              {shortcuts.map((shortcut) => (
                <Pressable
                  key={shortcut.key}
                  accessibilityRole="button"
                  accessibilityLabel={shortcut.label}
                  onPress={shortcut.onPress}
                  style={({ pressed }) => [
                    styles.shortcutItem,
                    pressed && styles.shortcutItemPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.shortcutIcon,
                      { backgroundColor: shortcut.backgroundColor },
                    ]}
                  >
                    <Ionicons
                      name={shortcut.icon}
                      size={sizes.icon.md}
                      color={shortcut.color}
                      accessibilityElementsHidden
                    />
                  </View>
                  <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Ações rápidas</Text>
            <View style={styles.quickActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir rota no mapa"
                onPress={openRoute}
                style={({ pressed }) => [
                  styles.quickAction,
                  pressed && styles.quickActionPressed,
                ]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons
                    name="navigate"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <Text style={styles.quickActionLabel}>Rota</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ligar para o cliente"
                onPress={openPhone}
                style={({ pressed }) => [
                  styles.quickAction,
                  pressed && styles.quickActionPressed,
                ]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.successSoft }]}>
                  <Ionicons
                    name="call"
                    size={sizes.icon.md}
                    color={colors.success}
                    accessibilityElementsHidden
                  />
                </View>
                <Text style={styles.quickActionLabel}>Ligar</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir conversa no WhatsApp"
                onPress={openWhatsApp}
                style={({ pressed }) => [
                  styles.quickAction,
                  pressed && styles.quickActionPressed,
                ]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.successSoft }]}>
                  <Ionicons
                    name="logo-whatsapp"
                    size={sizes.icon.md}
                    color={colors.success}
                    accessibilityElementsHidden
                  />
                </View>
                <Text style={styles.quickActionLabel}>WhatsApp</Text>
              </Pressable>
            </View>

            <Text
              style={styles.sectionLabel}
              onLayout={(event) => {
                statusSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              Status
            </Text>
            <AppCard shadow="light" style={styles.statusCard}>
              {order.status === 'CANCELADA' ? (
                <Text style={styles.statusCancelledText}>
                  Esta ordem de serviço foi cancelada.
                </Text>
              ) : (
                <>
                  {SERVICE_ORDER_STATUS_STEPS.map((step, index) => {
                    const isDone = currentStepIndex > index;
                    const isCurrent = currentStepIndex === index;
                    const iconName = isDone
                      ? 'checkmark-circle'
                      : isCurrent
                        ? 'radio-button-on'
                        : 'ellipse-outline';
                    const iconColor = isDone
                      ? colors.success
                      : isCurrent
                        ? colors.primary
                        : colors.textLight;
                    return (
                      <View key={step.status} style={styles.statusStep}>
                        <Ionicons
                          name={iconName}
                          size={sizes.icon.md}
                          color={iconColor}
                          accessibilityElementsHidden
                        />
                        <Text
                          style={[
                            styles.statusStepLabel,
                            isCurrent && styles.statusStepLabelCurrent,
                          ]}
                        >
                          {step.label}
                        </Text>
                        {isCurrent && (
                          <View style={styles.statusCurrentBadge}>
                            <Text style={styles.statusCurrentBadgeText}>Atual</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {order.pauseReason ? (
                    <View style={styles.pauseReasonBox}>
                      <Ionicons
                        name="pause-circle-outline"
                        size={sizes.icon.md}
                        color={colors.warning}
                        accessibilityElementsHidden
                      />
                      <View style={styles.pauseReasonInfo}>
                        <Text style={styles.pauseReasonLabel}>
                          Motivo da pausa
                        </Text>
                        <Text style={styles.pauseReasonText}>
                          {order.pauseReason}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {statusTransitions.length > 0 && (
                    <View style={styles.statusActions}>
                      {statusTransitions.map((transition) => (
                        <AppButton
                          key={transition.to}
                          title={transition.label}
                          variant={
                            transition.to === 'CONCLUIDA' ? 'primary' : 'outline'
                          }
                          size="md"
                          accessibilityLabel={transition.label}
                          onPress={() => handleStatusPress(transition)}
                          loading={statusMutation.isPending}
                          disabled={statusMutation.isPending}
                          style={styles.statusActionButton}
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
            </AppCard>

            {/* ── Pré-requisitos para início (V3 §34) ───────────────────── */}
            {order.status !== 'CONCLUIDA' && order.status !== 'CANCELADA' && (
              <>
                <Text style={styles.sectionLabel}>
                  Pré-requisitos para início
                </Text>
                <AppCard shadow="light" style={styles.prereqCard}>
                  {PREREQ_ITEMS.map((item) => {
                    const checked = order.checklist?.[item.key] === true;
                    return (
                      <Pressable
                        key={item.key}
                        accessibilityRole="checkbox"
                        accessibilityLabel={item.label}
                        accessibilityState={{ checked }}
                        onPress={() => togglePrereq(item.key)}
                        disabled={checklistMutation.isPending}
                        style={({ pressed }) => [
                          styles.checklistItem,
                          pressed && styles.checklistItemPressed,
                        ]}
                      >
                        <Ionicons
                          name={checked ? 'checkbox' : 'square-outline'}
                          size={sizes.icon.lg}
                          color={checked ? colors.success : colors.textLight}
                          accessibilityElementsHidden
                        />
                        <Text
                          style={[
                            styles.checklistItemLabel,
                            checked && styles.checklistItemLabelChecked,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Text style={styles.checklistHint}>
                    {PREREQ_ITEMS.filter(
                      (item) => order.checklist?.[item.key] === true,
                    ).length}{' '}
                    de {PREREQ_ITEMS.length} pré-requisitos confirmados
                  </Text>
                </AppCard>
              </>
            )}

            {/* ── Etapas do serviço (V3 §33): timeline interativa ───────── */}
            <Text style={styles.sectionLabel}>Etapas</Text>
            <AppCard shadow="light" style={styles.etapasCard}>
              {SERVICE_ORDER_ETAPAS.map((etapa, index) => {
                const done = etapas[etapa.key] === true;
                const isCurrent = !done && currentEtapaIndex === index;
                const iconName = done
                  ? 'checkmark-circle'
                  : isCurrent
                    ? 'radio-button-on'
                    : 'ellipse-outline';
                const iconColor = done
                  ? colors.success
                  : isCurrent
                    ? colors.primary
                    : colors.textLight;
                return (
                  <Pressable
                    key={etapa.key}
                    accessibilityRole="button"
                    accessibilityLabel={`${etapa.label}${done ? ' concluída' : ''}`}
                    accessibilityState={{ checked: done }}
                    onPress={() => toggleEtapa(etapa.key)}
                    disabled={etapasMutation.isPending}
                    style={({ pressed }) => [
                      styles.etapaRow,
                      pressed && styles.etapaRowPressed,
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={sizes.icon.md}
                      color={iconColor}
                      accessibilityElementsHidden
                    />
                    <Text
                      style={[
                        styles.etapaLabel,
                        done && styles.etapaLabelDone,
                        isCurrent && styles.etapaLabelCurrent,
                      ]}
                    >
                      {etapa.label}
                    </Text>
                    {done ? (
                      <View style={[styles.etapaBadge, styles.etapaBadgeDone]}>
                        <Text
                          style={[styles.etapaBadgeText, styles.etapaBadgeTextDone]}
                        >
                          Concluída
                        </Text>
                      </View>
                    ) : isCurrent ? (
                      <View style={styles.etapaBadge}>
                        <Text style={styles.etapaBadgeText}>Atual</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
              <Text style={styles.etapaHint}>
                {etapasConcluidas} de {SERVICE_ORDER_ETAPAS.length} etapas
                concluídas — toque para marcar
              </Text>
            </AppCard>

            {/* ── Produção opcional (V3 §44) ─────────────────────────────── */}
            <Text style={styles.sectionLabel}>Produção</Text>
            <AppCard shadow="light" style={styles.producaoCard}>
              <Text style={styles.producaoQuestion}>Produção necessária?</Text>
              <View style={styles.producaoToggleRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Produção necessária: Sim"
                  accessibilityState={{ selected: order.needsProduction === true }}
                  onPress={() => needsProductionMutation.mutate(true)}
                  disabled={needsProductionMutation.isPending}
                  style={[
                    styles.producaoToggleButton,
                    order.needsProduction === true &&
                      styles.producaoToggleButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.producaoToggleButtonText,
                      order.needsProduction === true &&
                        styles.producaoToggleButtonTextActive,
                    ]}
                  >
                    Sim
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Produção necessária: Não"
                  accessibilityState={{ selected: order.needsProduction === false }}
                  onPress={() => needsProductionMutation.mutate(false)}
                  disabled={needsProductionMutation.isPending}
                  style={[
                    styles.producaoToggleButton,
                    order.needsProduction === false &&
                      styles.producaoToggleButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.producaoToggleButtonText,
                      order.needsProduction === false &&
                        styles.producaoToggleButtonTextActive,
                    ]}
                  >
                    Não
                  </Text>
                </Pressable>
              </View>

              {order.needsProduction === true && (
                <>
                  <View style={styles.divider} />
                  {clientProductionOrders.length > 0 ? (
                    <>
                      <Text style={styles.producaoHint}>
                        Ordens de produção do cliente
                      </Text>
                      {clientProductionOrders.slice(0, 3).map((po) => (
                        <Pressable
                          key={po.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Abrir ordem de produção ${po.code}`}
                          onPress={() => router.push(`/producao/${po.id}`)}
                          style={({ pressed }) => [
                            styles.producaoLinkRow,
                            pressed && styles.producaoLinkRowPressed,
                          ]}
                        >
                          <Ionicons
                            name="construct-outline"
                            size={sizes.icon.md}
                            color={colors.primary}
                            accessibilityElementsHidden
                          />
                          <Text style={styles.producaoLinkLabel}>
                            Ordem de produção #{po.code}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={sizes.icon.sm}
                            color={colors.textLight}
                            accessibilityElementsHidden
                          />
                        </Pressable>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.producaoHint}>
                      Nenhuma ordem de produção vinculada a este cliente
                    </Text>
                  )}
                  <AppButton
                    title="Criar ordem de produção"
                    variant="outline"
                    size="md"
                    accessibilityLabel="Criar ordem de produção para este serviço"
                    onPress={() =>
                      router.push({
                        pathname: '/producao/novo',
                        params: { serviceOrderId: order.id },
                      })
                    }
                    style={styles.producaoCtaButton}
                  />
                </>
              )}
            </AppCard>

            <Text
              style={styles.sectionLabel}
              onLayout={(event) => {
                checklistSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              Checklist de execução
            </Text>
            <AppCard shadow="light" style={styles.checklistCard}>
              {CHECKLIST_ITEMS.map((item) => {
                const checked = order.checklist?.[item] === true;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="checkbox"
                    accessibilityLabel={item}
                    accessibilityState={{ checked }}
                    onPress={() => toggleChecklistItem(item)}
                    disabled={checklistMutation.isPending}
                    style={({ pressed }) => [
                      styles.checklistItem,
                      pressed && styles.checklistItemPressed,
                    ]}
                  >
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={sizes.icon.lg}
                      color={checked ? colors.success : colors.textLight}
                      accessibilityElementsHidden
                    />
                    <Text
                      style={[
                        styles.checklistItemLabel,
                        checked && styles.checklistItemLabelChecked,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
              <Text style={styles.checklistHint}>
                {Object.values(order.checklist ?? {}).filter(Boolean).length} de{' '}
                {CHECKLIST_ITEMS.length} itens concluídos
              </Text>
            </AppCard>

            <Text
              style={styles.sectionLabel}
              onLayout={(event) => {
                photosSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              Fotos
            </Text>
            <View style={styles.photoSection}>
              {PHOTO_SLOTS.map((slot) => (
                <PhotoPicker
                  key={slot.key}
                  label={`Foto ${slot.label}`}
                  hint="Câmera ou galeria"
                  value={servicePhotos[slot.key]}
                  onChange={(photo) => handlePhotoChange(slot.key, photo)}
                />
              ))}
              <Text style={styles.photoHint}>
                Fotos salvas no dispositivo — upload na próxima versão.
              </Text>
            </View>

            <Text style={styles.sectionLabel}>Materiais usados</Text>
            {!order.materials || order.materials.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum material adicionado</Text>
            ) : (
              order.materials.map((material) => (
                <AppCard key={material.id} shadow="light" style={styles.materialCard}>
                  <View style={styles.materialIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={sizes.icon.md}
                      color={colors.primary}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialName} numberOfLines={2}>
                      {material.materialName}
                    </Text>
                  </View>
                  <Text style={styles.materialQuantity}>
                    {formatNumber(material.quantity)} {material.unit}
                  </Text>
                </AppCard>
              ))
            )}

            {order.observations ? (
              <>
                <Text style={styles.sectionLabel}>Observações</Text>
                <AppCard shadow="light" style={styles.obsCard}>
                  <Text style={styles.obsText}>{order.observations}</Text>
                </AppCard>
              </>
            ) : null}

            {showResultSection && (
              <PermissionGate allow={COST_VIEW_ROLES}>
                <Text style={styles.sectionLabel}>Resultado do serviço</Text>
                {hasResult ? (
                  <AppCard shadow="light" style={styles.resultCard}>
                    <View style={styles.resultRow}>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultLabel}>Custo</Text>
                        <Text style={styles.resultValue}>{formatCurrency(cost)}</Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultLabel}>Venda</Text>
                        <Text style={styles.resultValueSemibold}>
                          {formatCurrency(saleValue)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.resultProfitRow}>
                      <Text style={styles.resultLabel}>Lucro</Text>
                      <Text style={[styles.profitValue, { color: profitColor }]}>
                        {formatCurrency(profit)}
                      </Text>
                    </View>
                    <Text style={styles.marginText}>
                      Margem: {formatNumber(marginPct)}%
                    </Text>
                  </AppCard>
                ) : (
                  <AppButton
                    title="Registrar resultado"
                    variant="outline"
                    size="md"
                    accessibilityLabel="Registrar resultado do serviço"
                    onPress={() => setResultModalVisible(true)}
                    style={styles.resultCtaButton}
                  />
                )}
              </PermissionGate>
            )}

            {showResultSection && order.quoteId && (
              <Text style={styles.sectionLabel}>Planejado × Realizado</Text>
            )}
            {showResultSection && order.quoteId && (
              <AppCard shadow="light" style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultLabel}>Custo previsto</Text>
                    <Text style={styles.resultValue}>
                      {formatCurrency(quoteTotal ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultLabel}>Custo realizado</Text>
                    <Text style={styles.resultValueSemibold}>
                      {formatCurrency(cost ?? 0)}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.resultProfitRow}>
                  <Text style={styles.resultLabel}>Desvio de custo</Text>
                  <Text
                    style={[
                      styles.profitValue,
                      { color: cost !== null && quoteTotal ? (cost > quoteTotal ? colors.danger : colors.success) : colors.text },
                    ]}
                  >
                    {cost !== null && quoteTotal
                      ? `${cost > quoteTotal ? '+' : ''}${formatCurrency(cost - quoteTotal)}`
                      : '—'}
                  </Text>
                </View>
                {order.completedDate && order.scheduledDate ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.resultProfitRow}>
                      <Text style={styles.resultLabel}>Prazo previsto × realizado</Text>
                      <Text style={styles.resultValueSemibold}>
                        {formatDayMonth(order.scheduledDate)} → {formatDayMonth(order.completedDate)}
                      </Text>
                    </View>
                  </>
                ) : null}
              </AppCard>
            )}
          </>
        ) : null}
      </ScreenContainer>

      <RegisterResultModal
        visible={resultModalVisible}
        loading={registerResultMutation.isPending}
        onConfirm={(costValue, saleValueValue) =>
          registerResultMutation.mutate({ cost: costValue, saleValue: saleValueValue })
        }
        onClose={() => setResultModalVisible(false)}
      />

      <PauseReasonModal
        visible={pauseModalVisible}
        loading={statusMutation.isPending || pauseReasonMutation.isPending}
        pauseOnly={pendingPauseTransition === null}
        onConfirm={confirmPause}
        onClose={() => {
          setPauseModalVisible(false);
          setPendingPauseTransition(null);
        }}
      />

      <ConfirmDialog
        visible={prereqConfirmVisible}
        title="Confirme os pré-requisitos"
        message={
          'Alguns pré-requisitos ainda não foram confirmados:\n' +
          PREREQ_ITEMS.filter((item) => order?.checklist?.[item.key] !== true)
            .map((item) => `• ${item.label}`)
            .join('\n') +
          '\n\nDeseja iniciar o serviço mesmo assim?'
        }
        confirmLabel="Iniciar mesmo assim"
        cancelLabel="Cancelar"
        loading={statusMutation.isPending}
        onConfirm={() => {
          if (pendingStartTransition) {
            statusMutation.mutate(pendingStartTransition);
          }
          setPrereqConfirmVisible(false);
          setPendingStartTransition(null);
        }}
        onCancel={() => {
          setPrereqConfirmVisible(false);
          setPendingStartTransition(null);
        }}
      />

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Excluir ordem de serviço"
        message="Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDeleteVisible(false)}
      />

      {snackbar && (
        <AppSnackbar
          visible={true}
          type={snackbar.type}
          message={snackbar.message}
          onHide={() => setSnackbar(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  backButton: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  materialQuantity: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  obsCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  obsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  resultCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  resultValueSemibold: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  resultProfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  marginText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultCtaButton: {
    marginBottom: spacing.lg,
  },
  // Central operacional (V3) — Prazo / Financeiro / Custos / Atalhos
  prazoCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  prazoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  prazoItem: {
    flex: 1,
  },
  prazoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  prazoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  prazoBadgeWrap: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  financeiroCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  financeiroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  financeiroItem: {
    flex: 1,
  },
  financeiroLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  financeiroValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  financeiroValueSemibold: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  financeiroHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  custosCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  custosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  custosIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  custosInfo: {
    flex: 1,
  },
  custosLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  custosValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  custosHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  shortcutItem: {
    width: '48%',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutItemPressed: {
    backgroundColor: colors.primarySoft,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  // Ações rápidas (rota / ligar / WhatsApp)
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionPressed: {
    backgroundColor: colors.primarySoft,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  // Status expandido (timeline + transições)
  statusCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusStepLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  statusStepLabelCurrent: {
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  statusCurrentBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusCurrentBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  statusActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusActionButton: {
    marginBottom: spacing.xs,
  },
  statusCancelledText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  // Checklist interativo
  checklistCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: sizes.touchTarget,
    borderRadius: radius.sm,
  },
  checklistItemPressed: {
    backgroundColor: colors.primarySoft,
  },
  checklistItemLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  checklistItemLabelChecked: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  checklistHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  // Etapas do serviço (V3 §33) — timeline interativa
  etapasCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  etapaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: sizes.touchTarget,
    borderRadius: radius.sm,
  },
  etapaRowPressed: {
    backgroundColor: colors.primarySoft,
  },
  etapaLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  etapaLabelDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  etapaLabelCurrent: {
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  etapaBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  etapaBadgeDone: {
    backgroundColor: colors.successSoft,
  },
  etapaBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  etapaBadgeTextDone: {
    color: colors.success,
  },
  etapaHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  // Produção opcional (V3 §44) — Sim/Não + link para ordem de produção
  producaoCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  producaoQuestion: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  producaoToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  producaoToggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.border,
    minHeight: sizes.touchTarget,
  },
  producaoToggleButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  producaoToggleButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  producaoToggleButtonTextActive: {
    color: colors.primary,
  },
  producaoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: sizes.touchTarget,
    borderRadius: radius.sm,
  },
  producaoLinkRowPressed: {
    backgroundColor: colors.primarySoft,
  },
  producaoLinkLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  producaoHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  producaoCtaButton: {
    marginTop: spacing.sm,
  },
  // Fotos (antes / durante / depois) — PhotoPicker (V3 §67)
  photoSection: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoHint: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Modal styles
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: sizes.screenPadding,
    paddingTop: spacing.lg,
  },
  modalConfirmButton: {
    marginTop: spacing.lg,
  },
  // Motivo da pausa/atraso (V3 §35) — exibição no card de Status
  pauseReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },
  pauseReasonInfo: {
    flex: 1,
    gap: 2,
  },
  pauseReasonLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pauseReasonText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: typography.sizes.sm * 1.4,
  },
  // Modal de motivo (V3 §35) — chips + observação
  pauseModalHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  pauseReasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pauseReasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: sizes.touchTarget,
  },
  pauseReasonChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pauseReasonChipPressed: {
    backgroundColor: colors.primarySoft,
  },
  pauseReasonChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  pauseReasonChipTextSelected: {
    color: colors.primary,
  },
  pauseObservationInput: {
    marginBottom: spacing.md,
  },
  pauseDateHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  // Prazo — botão de atraso (V3 §35)
  prazoLateButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  // Pré-requisitos para início (V3 §34)
  prereqCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});