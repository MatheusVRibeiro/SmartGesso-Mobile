import React, { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { serviceOrdersService } from '../../../src/services/api/serviceOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency, formatNumber } from '../../../src/utils/format';
import type {
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

/** Slots de fotos (antes/durante/depois) — estrutura visual sem câmera. */
const PHOTO_SLOTS = [
  { key: 'antes', label: 'Antes' },
  { key: 'durante', label: 'Durante' },
  { key: 'depois', label: 'Depois' },
] as const;

interface StatusTransition {
  to: ServiceOrderStatus;
  label: string;
  completedDate?: boolean;
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

// ─── Modal de registro de resultado ─────────────────────────────────────────

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

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalheOrdemServicoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const orderQuery = useQuery({
    queryKey: ['company', companyId, 'service-orders', orderId],
    queryFn: () => serviceOrdersService.getById(orderId as string),
    enabled: Boolean(companyId && orderId),
  });

  const statusMutation = useMutation({
    mutationFn: (transition: StatusTransition) =>
      serviceOrdersService.update(orderId as string, {
        status: transition.to,
        ...(transition.completedDate
          ? { completedDate: new Date().toISOString() }
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

  // Cliente completo (telefone/WhatsApp/endereço) para as ações rápidas.
  const clientQuery = useQuery({
    queryKey: ['company', companyId, 'clients', orderQuery.data?.clientId],
    queryFn: () => clientsService.getById(orderQuery.data!.clientId),
    enabled: Boolean(companyId && orderQuery.data?.clientId),
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

  // Índice do status atual no timeline expandido (para o stepper)
  const currentStepIndex = order
    ? SERVICE_ORDER_STATUS_STEPS.findIndex((s) => s.status === order.status)
    : -1;
  const statusTransitions = order ? getStatusTransitions(order.status) : [];

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe da ordem de serviço', headerShown: true }} />

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

            <Text style={styles.sectionLabel}>Status</Text>
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
                          onPress={() => statusMutation.mutate(transition)}
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

            <Text style={styles.sectionLabel}>Checklist de execução</Text>
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

            <Text style={styles.sectionLabel}>Fotos</Text>
            <View style={styles.photoSlots}>
              {PHOTO_SLOTS.map((slot) => (
                <Pressable
                  key={slot.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Fotos ${slot.label}`}
                  onPress={() =>
                    setSnackbar({
                      type: 'info',
                      message: 'Registro de fotos disponível em breve',
                    })
                  }
                  style={({ pressed }) => [
                    styles.photoSlot,
                    pressed && styles.photoSlotPressed,
                  ]}
                >
                  <Ionicons
                    name="camera-outline"
                    size={sizes.icon.lg}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.photoSlotLabel}>{slot.label}</Text>
                  <Text style={styles.photoSlotHint}>Em breve</Text>
                </Pressable>
              ))}
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
              <>
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
              </>
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
  // Fotos (antes / durante / depois)
  photoSlots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoSlot: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inputBorder,
  },
  photoSlotPressed: {
    backgroundColor: colors.primarySoft,
  },
  photoSlotLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  photoSlotHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
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
});