import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { toArray } from '@/src/utils/toArray';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { clientsService } from '@/src/services/api/clients';
import { useCompanyFeatures } from '@/src/services/api/companyFeatures';
import { financialSummaryService } from '@/src/services/api/financialSummary';
import { productionOrdersService } from '@/src/services/api/productionOrders';
import { quotesService } from '@/src/services/api/quotes';
import { serviceOrdersService } from '@/src/services/api/serviceOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { PermissionGate } from '@/src/components/domain/PermissionGate';
import { PhotoPicker } from '@/src/components/domain/PhotoPicker';
import { COST_VIEW_ROLES } from '@/src/types/permissions';
import { savePhotoLocally } from '@/src/services/photos/photoStorage';
import { borders, colors, radius, sizes, spacing, typography } from '@/src/theme';
import { formatCurrency, formatNumber } from '@/src/utils/format';
import type { PhotoAttachment } from '@/src/types/photo';
import type {
  ProductionOrder,
  RegisterServiceOrderResultInput,
  ServiceOrder,
  ServiceOrderStatus,
} from '@/src/types/serviceOrder';
import { createServicoDetalheStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { BackButton } from '@/src/components/navigation/BackButton';

// ── Badges de Status ────────────────────────────────────────────────────────
const SERVICE_ORDER_STATUS_BADGE: Record<
  ServiceOrderStatus,
  { variant: StatusBadgeVariant; label: string; dotColor: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Agendado', dotColor: colors.info },
  EM_DESLOCAMENTO: { variant: 'info', label: 'Em deslocamento', dotColor: colors.progressDot },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento', dotColor: colors.warningDot },
  PAUSADA: { variant: 'suspended', label: 'Pausado', dotColor: colors.pausedDot },
  CONCLUIDA: { variant: 'active', label: 'Concluído', dotColor: colors.successDot },
  CANCELADA: { variant: 'cancelled', label: 'Cancelado', dotColor: colors.dangerBright },
};

const CHECKLIST_ITEMS = [
  'Material carregado',
  'Local protegido',
  'Estrutura instalada',
  'Placas instaladas',
  'Acabamento',
  'Limpeza',
] as const;

const PAUSE_REASONS = [
  { key: 'falta_material', label: 'Falta de material' },
  { key: 'chuva_umidade', label: 'Chuva / umidade no local' },
  { key: 'eletrica_pendente', label: 'Elétrica pendente' },
  { key: 'cliente_ausente', label: 'Cliente ausente / sem acesso' },
  { key: 'ajuste_projeto', label: 'Ajuste de projeto solicitado' },
  { key: 'outro', label: 'Outro motivo' },
] as const;

const PREREQ_ITEMS = [
  { key: 'ambiente_liberado', label: 'Ambiente liberado' },
  { key: 'material_disponivel', label: 'Material disponível' },
  { key: 'eletrica_finalizada', label: 'Elétrica finalizada' },
  { key: 'local_seco', label: 'Local seco' },
  { key: 'acesso_liberado', label: 'Acesso liberado' },
  { key: 'outro', label: 'Outro' },
] as const;

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

const PHOTO_SLOTS = [
  { key: 'before', label: 'Antes' },
  { key: 'during', label: 'Durante' },
  { key: 'after', label: 'Depois' },
] as const;

type PhotoSlotKey = (typeof PHOTO_SLOTS)[number]['key'];

interface StatusTransition {
  to: ServiceOrderStatus;
  label: string;
  completedDate?: boolean;
  pauseReason?: string;
  isPrimary?: boolean;
}

function getStatusTransitions(status: ServiceOrderStatus): StatusTransition[] {
  switch (status) {
    case 'PENDENTE':
      return [
        { to: 'EM_ANDAMENTO', label: 'Iniciar serviço', isPrimary: true },
        { to: 'EM_DESLOCAMENTO', label: 'Iniciar deslocamento' },
      ];
    case 'EM_DESLOCAMENTO':
      return [{ to: 'EM_ANDAMENTO', label: 'Iniciar serviço', isPrimary: true }];
    case 'EM_ANDAMENTO':
      return [
        { to: 'CONCLUIDA', label: 'Concluir serviço', completedDate: true, isPrimary: true },
        { to: 'PAUSADA', label: 'Pausar' },
      ];
    case 'PAUSADA':
      return [{ to: 'EM_ANDAMENTO', label: 'Retomar serviço', isPrimary: true }];
    default:
      return [];
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDayMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getPrazoBadge(
  order: ServiceOrder,
  referenceDate: string | null,
): { label: string; variant: StatusBadgeVariant } | null {
  if (order.status === 'CONCLUIDA' || order.status === 'CANCELADA') return null;
  if (!referenceDate) return null;
  const days = daysUntil(referenceDate);
  if (days < 0) {
    const late = Math.abs(days);
    return {
      label: `Atrasado ${late} ${late === 1 ? 'dia' : 'dias'}`,
      variant: 'expired',
    };
  }
  return null;
}

// ── Modais Auxiliares ───────────────────────────────────────────────────────
interface RegisterResultModalProps {
  visible: boolean;
  loading: boolean;
  onConfirm: (cost: number, saleValue: number) => void;
  onClose: () => void;
}

function RegisterResultModal({ visible, loading, onConfirm, onClose }: RegisterResultModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createServicoDetalheStyles(colors, isDark), [colors, isDark]);
  const [cost, setCost] = useState('');
  const [saleValue, setSaleValue] = useState('');

  const costNum = parseFloat(cost.replace(',', '.'));
  const saleNum = parseFloat(saleValue.replace(',', '.'));
  const costInvalid = cost.trim() !== '' && (Number.isNaN(costNum) || costNum < 0);
  const saleInvalid = saleValue.trim() !== '' && (Number.isNaN(saleNum) || saleNum < 0);
  const invalid = cost.trim() === '' || saleValue.trim() === '' || costInvalid || saleInvalid;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Registrar resultado</Text>
          <AppInput
            label="Custo real (R$)"
            value={cost}
            onChangeText={setCost}
            placeholder="0,00"
            keyboardType="decimal-pad"
            error={costInvalid ? 'Informe um valor válido' : undefined}
          />
          <AppInput
            label="Valor cobrado (R$)"
            value={saleValue}
            onChangeText={setSaleValue}
            placeholder="0,00"
            keyboardType="decimal-pad"
            error={saleInvalid ? 'Informe um valor válido' : undefined}
          />
          <View style={styles.modalActions}>
            <AppButton title="Cancelar" variant="outline" size="sm" onPress={onClose} disabled={loading} />
            <AppButton
              title="Salvar"
              variant="primary"
              size="sm"
              loading={loading}
              disabled={invalid || loading}
              onPress={() => onConfirm(costNum, saleNum)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface PauseReasonModalProps {
  visible: boolean;
  loading: boolean;
  pauseOnly?: boolean;
  onConfirm: (reason: string, observation: string) => void;
  onClose: () => void;
}

function PauseReasonModal({ visible, loading, pauseOnly, onConfirm, onClose }: PauseReasonModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createServicoDetalheStyles(colors, isDark), [colors, isDark]);
  const [reason, setReason] = useState<string | null>(null);
  const [observation, setObservation] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {pauseOnly ? 'Registrar motivo de atraso' : 'Motivo da pausa'}
          </Text>
          {PAUSE_REASONS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setReason(item.label)}
              style={[
                styles.pauseReasonItem,
                reason === item.label && styles.pauseReasonItemSelected,
              ]}
            >
              <Ionicons
                name={reason === item.label ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={reason === item.label ? colors.primary : colors.textLight}
              />
              <Text style={styles.pauseReasonLabel}>{item.label}</Text>
            </Pressable>
          ))}
          <AppInput
            label="Observação (opcional)"
            value={observation}
            onChangeText={setObservation}
            placeholder="Detalhes adicionais..."
          />
          <View style={styles.modalActions}>
            <AppButton title="Cancelar" variant="outline" size="sm" onPress={onClose} disabled={loading} />
            <AppButton
              title="Confirmar"
              variant="primary"
              size="sm"
              loading={loading}
              disabled={!reason || loading}
              onPress={() => reason && onConfirm(reason, observation)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Tela Principal ──────────────────────────────────────────────────────────
export default function DetalheOrdemServicoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createServicoDetalheStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [activeTab, setActiveTab] = useState<'geral' | 'execucao' | 'financeiro'>('geral');
  const [prereqExpanded, setPrereqExpanded] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [pendingPauseTransition, setPendingPauseTransition] = useState<StatusTransition | null>(null);
  const [prereqConfirmVisible, setPrereqConfirmVisible] = useState(false);
  const [pendingStartTransition, setPendingStartTransition] = useState<StatusTransition | null>(null);
  const [servicePhotos, setServicePhotos] = useState<Record<PhotoSlotKey, PhotoAttachment | null>>({
    before: null,
    during: null,
    after: null,
  });
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: AppSnackbarType;
  } | null>(null);

  // ── Queries ──
  const orderQuery = useQuery({
    queryKey: ['company', companyId, 'service-orders', orderId],
    queryFn: () => serviceOrdersService.getById(orderId as string),
    enabled: Boolean(companyId && orderId),
  });

  const originQuoteId = orderQuery.data?.quoteId ?? null;
  const { data: originQuote } = useQuery({
    queryKey: ['company', companyId, 'quotes', originQuoteId],
    queryFn: () => quotesService.getById(originQuoteId as string),
    enabled: Boolean(companyId && originQuoteId),
  });

  const clientQuery = useQuery({
    queryKey: ['company', companyId, 'clients', orderQuery.data?.clientId],
    queryFn: () => clientsService.getById(orderQuery.data!.clientId),
    enabled: Boolean(companyId && orderQuery.data?.clientId),
  });

  const financialSummaryQuery = useQuery({
    queryKey: ['service-order', companyId, orderQuery.data?.id, 'financial-summary'],
    queryFn: () => financialSummaryService.getFinancialSummary(orderQuery.data!.id),
    enabled: Boolean(companyId && orderQuery.data?.id),
  });

  const {
    data: companyFeatures,
    isLoading: featuresLoading,
    isError: featuresError,
  } = useCompanyFeatures();

  const productionFeatureEnabled = (() => {
    if (featuresLoading || featuresError) return true;
    return Array.isArray(companyFeatures) ? companyFeatures.includes('production') : true;
  })();

  const productionOrdersQuery = useQuery({
    queryKey: ['company', companyId, 'production-orders'],
    queryFn: () => productionOrdersService.list(),
    enabled: Boolean(companyId && orderQuery.data?.needsProduction),
  });

  // ── Mutations ──
  const statusMutation = useMutation({
    mutationFn: (transition: StatusTransition) =>
      serviceOrdersService.update(orderId as string, {
        status: transition.to,
        ...(transition.completedDate ? { completedDate: new Date().toISOString() } : {}),
        ...(transition.pauseReason ? { pauseReason: transition.pauseReason } : {}),
      }),
    onSuccess: (_data, transition) => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'service-orders'] });
      setSnackbar({
        type: 'success',
        message: transition.to === 'CONCLUIDA' ? 'Serviço concluído com sucesso' : 'Status atualizado',
      });
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const pauseReasonMutation = useMutation({
    mutationFn: (pauseReason: string) =>
      serviceOrdersService.update(orderId as string, { pauseReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'service-orders'] });
      setSnackbar({ type: 'success', message: 'Motivo registrado com sucesso' });
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const checklistMutation = useMutation({
    mutationFn: (checklist: Record<string, boolean>) =>
      serviceOrdersService.update(orderId as string, { checklist }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['company', companyId, 'service-orders', orderId], updated);
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const etapasMutation = useMutation({
    mutationFn: (etapas: Record<string, boolean>) =>
      serviceOrdersService.updateEtapas(orderId as string, etapas),
    onSuccess: (updated) => {
      queryClient.setQueryData(['company', companyId, 'service-orders', orderId], updated);
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const needsProductionMutation = useMutation({
    mutationFn: (needsProduction: boolean) =>
      serviceOrdersService.updateNeedsProduction(orderId as string, needsProduction),
    onSuccess: (updated) => {
      queryClient.setQueryData(['company', companyId, 'service-orders', orderId], updated);
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'production-orders'] });
      setSnackbar({ type: 'success', message: 'Produção atualizada' });
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const registerResultMutation = useMutation({
    mutationFn: (data: RegisterServiceOrderResultInput) =>
      serviceOrdersService.registerResult(orderId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'service-orders'] });
      setResultModalVisible(false);
      setSnackbar({ type: 'success', message: 'Resultado registrado com sucesso' });
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => serviceOrdersService.remove(orderId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'service-orders'] });
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Ordem de serviço excluída com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (err) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([orderQuery.refetch(), financialSummaryQuery.refetch()]);
    setRefreshing(false);
  };

  const order = orderQuery.data;
  const statusBadge = order ? SERVICE_ORDER_STATUS_BADGE[order.status] : null;

  // Prazo
  const deliveryDate = (order as any)?.deliveryDate ?? null;
  const prazoReferenceDate = deliveryDate ?? order?.scheduledDate ?? null;
  const prazoBadge = order ? getPrazoBadge(order, prazoReferenceDate) : null;

  // Financeiro
  const financialSummary = financialSummaryQuery.data ?? null;
  const receivedTotal = financialSummary?.received ?? 0;
  const expensesTotal = financialSummary?.realizedCost ?? 0;
  const contractedValue = order?.saleValue ?? null;
  const toReceiveValue = contractedValue != null ? Math.max(0, contractedValue - receivedTotal) : null;

  // Contato Cliente
  const client = clientQuery.data;
  const phone = client?.phone ?? (order?.client as any)?.phone ?? null;
  const whatsapp = (client as any)?.whatsapp ?? phone;

  function openWhatsApp() {
    const number = whatsapp?.replace(/\D/g, '') ?? '';
    if (!number) {
      setSnackbar({ message: 'Telefone não cadastrado', type: 'warning' });
      return;
    }
    const fullNumber = number.startsWith('55') ? number : `55${number}`;
    const msg = encodeURIComponent(
      `Olá ${order?.client?.name ?? ''}, sou da equipe SmartGesso a respeito da sua Ordem de Serviço #${order?.code ?? ''}.`
    );
    Linking.openURL(`https://wa.me/${fullNumber}?text=${msg}`).catch(() => {
      setSnackbar({ message: 'Não foi possível abrir o WhatsApp', type: 'error' });
    });
  }

  function openPhone() {
    const number = phone?.replace(/\D/g, '') ?? '';
    if (!number) {
      setSnackbar({ message: 'Telefone não cadastrado', type: 'warning' });
      return;
    }
    Linking.openURL(`tel:${number}`).catch(() => {
      setSnackbar({ message: 'Não foi possível discar', type: 'error' });
    });
  }

  function openRoute() {
    const address = [
      (client as any)?.street,
      (client as any)?.number,
      (client as any)?.neighborhood,
      (client as any)?.city,
      (client as any)?.state,
    ]
      .filter(Boolean)
      .join(', ');
    const query = address.trim() || order?.work?.name?.trim() || client?.name?.trim() || '';
    if (!query) {
      setSnackbar({ message: 'Endereço não disponível', type: 'warning' });
      return;
    }
    const encoded = encodeURIComponent(query);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`).catch(() => {
      setSnackbar({ message: 'Não foi possível abrir o mapa', type: 'error' });
    });
  }

  // Checklists e Etapas
  function togglePrereq(key: string) {
    if (!order) return;
    const current = order.checklist ?? {};
    checklistMutation.mutate({ ...current, [key]: !current[key] });
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

  function handleStatusPress(transition: StatusTransition) {
    if (transition.to === 'EM_ANDAMENTO' && order?.status === 'PENDENTE') {
      const pending = PREREQ_ITEMS.filter((item) => order.checklist?.[item.key] !== true);
      if (pending.length > 0) {
        setPendingStartTransition(transition);
        setPrereqConfirmVisible(true);
        return;
      }
    }
    if (transition.to === 'PAUSADA') {
      setPendingPauseTransition(transition);
      setPauseModalVisible(true);
      return;
    }
    statusMutation.mutate(transition);
  }

  function confirmPause(reason: string, observation: string) {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const pauseReason = [reason, observation.trim(), dateStr].filter(Boolean).join(' — ');
    if (pendingPauseTransition) {
      statusMutation.mutate(
        { ...pendingPauseTransition, pauseReason },
        {
          onSuccess: () => {
            setPauseModalVisible(false);
            setPendingPauseTransition(null);
          },
        }
      );
    } else {
      pauseReasonMutation.mutate(pauseReason);
      setPauseModalVisible(false);
    }
  }

  async function handlePhotoChange(key: PhotoSlotKey, photo: PhotoAttachment | null) {
    setServicePhotos((prev) => ({ ...prev, [key]: photo }));
    if (photo?.uri) {
      try {
        if (order?.id) await savePhotoLocally(photo, `servicos/${order.id}`);
      } catch {
        // fail-safe
      }
    }
  }

  const statusTransitions = order ? getStatusTransitions(order.status) : [];
  const primaryTransition = statusTransitions.find((t) => t.isPrimary);
  const secondaryTransitions = statusTransitions.filter((t) => !t.isPrimary);

  const etapas = order?.etapas ?? {};
  const currentEtapaIndex = SERVICE_ORDER_ETAPAS.findIndex((e) => !etapas[e.key]);
  const etapasConcluidas = SERVICE_ORDER_ETAPAS.filter((e) => etapas[e.key] === true).length;
  const prereqsConfirmados = PREREQ_ITEMS.filter((i) => order?.checklist?.[i.key] === true).length;
  const checklistConcluidos = CHECKLIST_ITEMS.filter((i) => order?.checklist?.[i] === true).length;

  const cost = order?.cost ?? 0;
  const saleValue = order?.saleValue ?? 0;
  const profit = saleValue - cost;
  const marginPct = saleValue > 0 ? (profit / saleValue) * 100 : 0;
  const hasResult = order != null && order.cost != null && order.saleValue != null;
  const showResultSection = order?.status === 'CONCLUIDA';
  const quoteTotal = originQuote?.total != null ? Number(originQuote.total) : null;

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Cabeçalho Unificado ── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.headerBackBtn}>
            <BackButton />
          </View>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Detalhe da OS</Text>
            {order && (
              <Text style={styles.headerSubtitle}>
                OS #{order.code}
                {order.client?.name ? ` • ${order.client.name}` : ''}
              </Text>
            )}
          </View>
        </View>

        {order && (
          <PermissionGate allow={['COMPANY_OWNER']}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir ordem de serviço"
              onPress={() => setConfirmDeleteVisible(true)}
              style={styles.headerDeleteBtn}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </PermissionGate>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {orderQuery.isLoading ? (
          <LoadingState />
        ) : orderQuery.isError ? (
          <ErrorState
            title="Erro ao carregar OS"
            message={toApiError(orderQuery.error).message}
            onRetry={orderQuery.refetch}
          />
        ) : order ? (
          <>
            {/* ── Cockpit Card (Resumo Executivo Superior) ── */}
            <View style={styles.cockpitCard}>
              <View style={styles.cockpitTopRow}>
                <View style={styles.codeAndQuoteRow}>
                  <View style={styles.osCodeBadge}>
                    <Text style={styles.osCodeText}>OS #{order.code}</Text>
                  </View>
                  {(originQuote || order.quoteId) && (
                    <View style={styles.quoteTag}>
                      <Ionicons name="document-text-outline" size={12} color={colors.textSecondary} />
                      <Text style={styles.quoteTagText}>
                        Orç. #{originQuote?.quoteNumber ?? 'origem'}
                        {originQuote?.version ? ` v${originQuote.version}` : ''}
                      </Text>
                    </View>
                  )}
                </View>

                {statusBadge && (
                  <View
                    style={[
                      styles.currentStatusPill,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusBadge.dotColor }]} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: statusBadge.dotColor }}>
                      {statusBadge.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Cliente e Obra */}
              <View style={styles.clientRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {order.client?.name ? order.client.name.substring(0, 2).toUpperCase() : 'OS'}
                  </Text>
                </View>
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName} numberOfLines={1}>
                    {order.client?.name ?? 'Cliente não informado'}
                  </Text>
                  <Text style={styles.workSubtitle} numberOfLines={1}>
                    {order.work?.name ? `Obra: ${order.work.name}` : 'Obra padrão'}
                  </Text>
                </View>
              </View>

              {/* Contatos Imediatos em 1 Toque */}
              <View style={styles.quickContactsRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Conversar no WhatsApp"
                  onPress={openWhatsApp}
                  style={[styles.contactBtn, styles.contactBtnWhatsApp]}
                >
                  <Ionicons name="logo-whatsapp" size={15} color={isDark ? colors.whatsappDotDark : colors.whatsappDotLight} />
                  <Text style={[styles.contactBtnText, styles.contactBtnTextWhatsApp]}>WhatsApp</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ligar para cliente"
                  onPress={openPhone}
                  style={styles.contactBtn}
                >
                  <Ionicons name="call-outline" size={15} color={colors.primary} />
                  <Text style={styles.contactBtnText}>Ligar</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Abrir rota no mapa"
                  onPress={openRoute}
                  style={styles.contactBtn}
                >
                  <Ionicons name="navigate-outline" size={15} color={colors.info} />
                  <Text style={styles.contactBtnText}>GPS</Text>
                </Pressable>
              </View>

              {/* Linha de Datas e Prazos */}
              <View style={styles.dateRow}>
                <View style={styles.dateItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.dateLabel}>Início:</Text>
                  <Text style={styles.dateValue}>
                    {order.scheduledDate ? formatDayMonth(order.scheduledDate) : 'Não agendado'}
                  </Text>
                </View>

                <View style={styles.dateItem}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.dateLabel}>Entrega:</Text>
                  <Text style={styles.dateValue}>{formatDayMonth(deliveryDate)}</Text>
                </View>

                {prazoBadge && (
                  <Pressable
                    onPress={() => {
                      setPendingPauseTransition(null);
                      setPauseModalVisible(true);
                    }}
                    style={styles.lateBadge}
                  >
                    <Text style={styles.lateBadgeText}>{prazoBadge.label}</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* ── Abas Segmentadas Modernas ── */}
            <View style={styles.tabsContainer}>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel="Aba Resumo Geral"
                onPress={() => setActiveTab('geral')}
                style={[styles.tabItem, activeTab === 'geral' && styles.tabItemActive]}
              >
                <Ionicons
                  name="grid-outline"
                  size={15}
                  color={activeTab === 'geral' ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.tabText, activeTab === 'geral' && styles.tabTextActive]}>
                  Resumo
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityLabel="Aba Execução e Checklist"
                onPress={() => setActiveTab('execucao')}
                style={[styles.tabItem, activeTab === 'execucao' && styles.tabItemActive]}
              >
                <Ionicons
                  name="construct-outline"
                  size={15}
                  color={activeTab === 'execucao' ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.tabText, activeTab === 'execucao' && styles.tabTextActive]}>
                  Em Obra
                </Text>
                {checklistConcluidos > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{checklistConcluidos}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityLabel="Aba Fotos e Financeiro"
                onPress={() => setActiveTab('financeiro')}
                style={[styles.tabItem, activeTab === 'financeiro' && styles.tabItemActive]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={15}
                  color={activeTab === 'financeiro' ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.tabText, activeTab === 'financeiro' && styles.tabTextActive]}>
                  Financeiro
                </Text>
              </Pressable>
            </View>

            {/* ════════════════════════════════════════════════════════════════
                ABA 1: RESUMO (O que o gesseiro precisa no dia a dia)
            ════════════════════════════════════════════════════════════════ */}
            <View style={[styles.tabContent, activeTab !== 'geral' && styles.hiddenTab]}>
              {/* Botão de Ação Direta de Status */}
              <View style={styles.statusActionCard}>
                <View style={styles.statusActionHeader}>
                  <Text style={styles.statusActionTitle}>Avançar Serviço</Text>
                  {order.pauseReason && (
                    <Text style={{ fontSize: 11, color: colors.warning, fontWeight: '600' }} numberOfLines={1}>
                      Pausa: {order.pauseReason}
                    </Text>
                  )}
                </View>

                {primaryTransition && (
                  <AppButton
                    title={primaryTransition.label}
                    variant="primary"
                    size="lg"
                    accessibilityLabel={primaryTransition.label}
                    onPress={() => handleStatusPress(primaryTransition)}
                    loading={statusMutation.isPending}
                    disabled={statusMutation.isPending}
                    style={styles.primaryActionBtn}
                  />
                )}

                {secondaryTransitions.length > 0 && (
                  <View style={styles.statusButtonsRow}>
                    {secondaryTransitions.map((t) => (
                      <AppButton
                        key={t.to}
                        title={t.label}
                        variant="outline"
                        size="sm"
                        accessibilityLabel={t.label}
                        onPress={() => handleStatusPress(t)}
                        loading={statusMutation.isPending}
                        disabled={statusMutation.isPending}
                        style={{ flex: 1 }}
                      />
                    ))}
                  </View>
                )}

                {statusTransitions.length === 0 && (
                  <Text style={{ fontSize: 13, color: colors.success, fontWeight: '700', textAlign: 'center', paddingVertical: 4 }}>
                    ✓ Serviço Concluído
                  </Text>
                )}
              </View>

              {/* Resumo Financeiro Slim */}
              <View style={styles.financeiroCard}>
                <View style={styles.financeiroTitleRow}>
                  <Text style={styles.financeiroCardTitle}>Financeiro da OS</Text>
                  <Pressable onPress={() => setActiveTab('financeiro')}>
                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>Ver detalhes →</Text>
                  </Pressable>
                </View>

                <View style={styles.financeiroRow}>
                  <View style={styles.financeiroItem}>
                    <Text style={styles.financeiroLabel}>Contratado</Text>
                    <Text style={styles.financeiroValue}>{formatCurrency(contractedValue)}</Text>
                  </View>
                  <View style={styles.financeiroItem}>
                    <Text style={styles.financeiroLabel}>Recebido</Text>
                    <Text style={styles.financeiroValueSemibold}>{formatCurrency(receivedTotal)}</Text>
                  </View>
                  <View style={styles.financeiroItem}>
                    <Text style={styles.financeiroLabel}>A receber</Text>
                    <Text
                      style={[
                        styles.financeiroValueSemibold,
                        { color: (toReceiveValue ?? 0) > 0 ? colors.warning : colors.success },
                      ]}
                    >
                      {formatCurrency(toReceiveValue)}
                    </Text>
                  </View>
                </View>

                <View style={styles.financeiroActionsRow}>
                  <AppButton
                    title="+ Pagamento"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/financeiro/novo-recebimento' as any,
                        params: { serviceOrderId: orderId },
                      })
                    }
                    style={styles.financeiroActionBtn}
                  />
                  <AppButton
                    title="+ Despesa"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/despesas/novo' as any,
                        params: { serviceOrderId: orderId },
                      })
                    }
                    style={styles.financeiroActionBtn}
                  />
                </View>
              </View>

              {/* Materiais Necessários */}
              <View style={styles.materialsCard}>
                <View style={styles.materialsHeader}>
                  <Text style={styles.materialsTitle}>
                    Materiais ({order.materials?.length ?? 0})
                  </Text>
                </View>

                {!order.materials || order.materials.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum material listado nesta OS</Text>
                ) : (
                  order.materials.map((m) => (
                    <View key={m.id} style={styles.materialRow}>
                      <View style={styles.materialLeft}>
                        <Ionicons name="cube-outline" size={16} color={colors.primary} />
                        <Text style={styles.materialName} numberOfLines={1}>
                          {m.materialName}
                        </Text>
                      </View>
                      <Text style={styles.materialQuantity}>
                        {formatNumber(m.quantity)} {m.unit}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              {/* Produção Opcional (V3 / V5 Etapa 7 - Preservado para Features & Testes) */}
              {productionFeatureEnabled && (
                <View style={styles.producaoCard}>
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
                        order.needsProduction === true && styles.producaoToggleButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.producaoToggleButtonText,
                          order.needsProduction === true && styles.producaoToggleButtonTextActive,
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
                        order.needsProduction === false && styles.producaoToggleButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.producaoToggleButtonText,
                          order.needsProduction === false && styles.producaoToggleButtonTextActive,
                        ]}
                      >
                        Não
                      </Text>
                    </Pressable>
                  </View>

                  {order.needsProduction === true && (
                    <AppButton
                      title="Criar ordem de produção"
                      variant="outline"
                      size="sm"
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/producao/nova' as any,
                          params: { serviceOrderId: orderId },
                        })
                      }
                      style={{ marginTop: 6 }}
                    />
                  )}
                </View>
              )}

              {/* Observações */}
              {order.observations ? (
                <View style={styles.obsCard}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 }}>
                    Observações
                  </Text>
                  <Text style={styles.obsText}>{order.observations}</Text>
                </View>
              ) : null}
            </View>

            {/* ════════════════════════════════════════════════════════════════
                ABA 2: EM OBRA (Execução, Timeline, Checklists e Produção)
            ════════════════════════════════════════════════════════════════ */}
            <View style={[styles.tabContent, activeTab !== 'execucao' && styles.hiddenTab]}>
              {/* Etapas do Serviço (Timeline) */}
              <View style={styles.etapasCard}>
                <Text style={styles.sectionLabel}>Etapa Atual da Obra</Text>
                {SERVICE_ORDER_ETAPAS.map((etapa, index) => {
                  const done = etapas[etapa.key] === true;
                  const isCurrent = !done && currentEtapaIndex === index;
                  return (
                    <Pressable
                      key={etapa.key}
                      accessibilityRole="button"
                      accessibilityLabel={`${etapa.label}${done ? ' concluída' : ''}`}
                      accessibilityState={{ checked: done }}
                      onPress={() => toggleEtapa(etapa.key)}
                      disabled={etapasMutation.isPending}
                      style={({ pressed }) => [styles.etapaRow, pressed && styles.etapaRowPressed]}
                    >
                      <Ionicons
                        name={done ? 'checkmark-circle' : isCurrent ? 'radio-button-on' : 'ellipse-outline'}
                        size={18}
                        color={done ? colors.success : isCurrent ? colors.primary : colors.textLight}
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
                          <Text style={[styles.etapaBadgeText, styles.etapaBadgeTextDone]}>Concluída</Text>
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
                  {etapasConcluidas} de {SERVICE_ORDER_ETAPAS.length} etapas concluídas
                </Text>
              </View>

              {/* Accordion: Pré-requisitos para Início */}
              {order.status !== 'CONCLUIDA' && order.status !== 'CANCELADA' && (
                <View style={styles.accordionCard}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Expandir pré-requisitos para início"
                    onPress={() => setPrereqExpanded(!prereqExpanded)}
                    style={styles.accordionHeader}
                  >
                    <View style={styles.accordionLeft}>
                      <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                      <Text style={styles.accordionTitle}>Pré-requisitos de Início</Text>
                      <View
                        style={[
                          styles.accordionBadge,
                          prereqsConfirmados === PREREQ_ITEMS.length && styles.accordionBadgeSuccess,
                        ]}
                      >
                        <Text
                          style={[
                            styles.accordionBadgeText,
                            prereqsConfirmados === PREREQ_ITEMS.length && styles.accordionBadgeTextSuccess,
                          ]}
                        >
                          {prereqsConfirmados}/{PREREQ_ITEMS.length}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={prereqExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </Pressable>

                  {prereqExpanded && (
                    <View style={styles.accordionBody}>
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
                              size={18}
                              color={checked ? colors.success : colors.textLight}
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
                    </View>
                  )}
                </View>
              )}

              {/* Accordion: Checklist de Execução */}
              <View style={styles.accordionCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Expandir checklist de execução"
                  onPress={() => setChecklistExpanded(!checklistExpanded)}
                  style={styles.accordionHeader}
                >
                  <View style={styles.accordionLeft}>
                    <Ionicons name="checkbox-outline" size={18} color={colors.primary} />
                    <Text style={styles.accordionTitle}>Checklist de Instalação</Text>
                    <View
                      style={[
                        styles.accordionBadge,
                        checklistConcluidos === CHECKLIST_ITEMS.length && styles.accordionBadgeSuccess,
                      ]}
                    >
                      <Text
                        style={[
                          styles.accordionBadgeText,
                          checklistConcluidos === CHECKLIST_ITEMS.length && styles.accordionBadgeTextSuccess,
                        ]}
                      >
                        {checklistConcluidos}/{CHECKLIST_ITEMS.length}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={checklistExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>

                {checklistExpanded && (
                  <View style={styles.accordionBody}>
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
                            size={18}
                            color={checked ? colors.success : colors.textLight}
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
                  </View>
                )}
              </View>


            </View>

            {/* ════════════════════════════════════════════════════════════════
                ABA 3: FOTOS & FINANCEIRO
            ════════════════════════════════════════════════════════════════ */}
            <View style={[styles.tabContent, activeTab !== 'financeiro' && styles.hiddenTab]}>
              {/* Fotos da Obra */}
              <View style={styles.photosCard}>
                <Text style={styles.sectionLabel}>Fotos da Obra</Text>
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
              </View>

              {/* Custos e Despesas Vinculadas */}
              <PermissionGate allow={COST_VIEW_ROLES}>
                <View style={styles.custosCard}>
                  <View style={styles.custosRow}>
                    <Text style={styles.custosLabel}>Despesas vinculadas</Text>
                    <Text style={styles.custosValue}>{formatCurrency(expensesTotal)}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <AppButton
                      title="+ Despesa"
                      variant="outline"
                      size="sm"
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/despesas/novo' as any,
                          params: { serviceOrderId: orderId },
                        })
                      }
                      style={{ flex: 1 }}
                    />
                    <AppButton
                      title="Garantia / Retorno"
                      variant="outline"
                      size="sm"
                      onPress={() => router.push(`/servicos/${orderId}/garantia` as any)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              </PermissionGate>

              {/* Resultado do Serviço e Planejado x Realizado */}
              {showResultSection && (
                <PermissionGate allow={COST_VIEW_ROLES}>
                  <Text style={styles.sectionLabel}>Resultado do serviço</Text>
                  {hasResult ? (
                    <View style={styles.resultCard}>
                      <View style={styles.resultRow}>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultLabel}>Custo</Text>
                          <Text style={styles.resultValue}>{formatCurrency(cost)}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultLabel}>Venda</Text>
                          <Text style={styles.resultValueSemibold}>{formatCurrency(saleValue)}</Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.resultProfitRow}>
                        <Text style={styles.resultLabel}>Lucro</Text>
                        <Text
                          style={[
                            styles.profitValue,
                            { color: profit >= 0 ? colors.success : colors.danger },
                          ]}
                        >
                          {formatCurrency(profit)}
                        </Text>
                      </View>
                      <Text style={styles.marginText}>Margem: {formatNumber(marginPct)}%</Text>
                    </View>
                  ) : (
                    <AppButton
                      title="Registrar resultado"
                      variant="outline"
                      size="md"
                      onPress={() => setResultModalVisible(true)}
                      style={styles.resultCtaButton}
                    />
                  )}
                </PermissionGate>
              )}

              {showResultSection && order.quoteId && (
                <View style={styles.resultCard}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 }}>
                    Planejado × Realizado
                  </Text>
                  <View style={styles.resultRow}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultLabel}>Custo previsto</Text>
                      <Text style={styles.resultValue}>{formatCurrency(quoteTotal ?? 0)}</Text>
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultLabel}>Custo realizado</Text>
                      <Text style={styles.resultValueSemibold}>{formatCurrency(cost ?? 0)}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.resultProfitRow}>
                    <Text style={styles.resultLabel}>Desvio de custo</Text>
                    <Text
                      style={[
                        styles.profitValue,
                        {
                          color:
                            cost !== null && quoteTotal
                              ? cost > quoteTotal
                                ? colors.danger
                                : colors.success
                              : colors.text,
                        },
                      ]}
                    >
                      {cost !== null && quoteTotal
                        ? `${cost > quoteTotal ? '+' : ''}${formatCurrency(cost - quoteTotal)}`
                        : '—'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* ── Modais ── */}
      <RegisterResultModal
        visible={resultModalVisible}
        loading={registerResultMutation.isPending}
        onConfirm={(c, s) => registerResultMutation.mutate({ cost: c, saleValue: s })}
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
    </ScreenContainer>
  );
}
