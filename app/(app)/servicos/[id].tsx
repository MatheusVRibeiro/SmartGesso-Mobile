import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { serviceOrdersService } from '../../../src/services/api/serviceOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency, formatNumber } from '../../../src/utils/format';
import type {
  RegisterServiceOrderResultInput,
  ServiceOrderStatus,
} from '../../../src/types/serviceOrder';

// ─── Helpers ────────────────────────────────────────────────────────────────

const SERVICE_ORDER_STATUS_BADGE: Record<
  ServiceOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

function canStart(status: ServiceOrderStatus): boolean {
  return status === 'PENDENTE';
}

function canComplete(status: ServiceOrderStatus): boolean {
  return status === 'PENDENTE' || status === 'EM_ANDAMENTO';
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

  const startMutation = useMutation({
    mutationFn: () =>
      serviceOrdersService.update(orderId as string, {
        status: 'EM_ANDAMENTO',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setSnackbar({ type: 'success', message: 'Serviço iniciado com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      serviceOrdersService.update(orderId as string, {
        status: 'CONCLUIDA',
        completedDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setSnackbar({ type: 'success', message: 'Ordem de serviço concluída com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
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

            {(canStart(order.status) || canComplete(order.status)) && (
              <View style={styles.actions}>
                {canStart(order.status) && (
                  <AppButton
                    title="Iniciar serviço"
                    variant="outline"
                    size="md"
                    accessibilityLabel="Iniciar ordem de serviço"
                    onPress={() => startMutation.mutate()}
                    loading={startMutation.isPending}
                    disabled={startMutation.isPending}
                    style={styles.actionButton}
                  />
                )}
                {canComplete(order.status) && (
                  <AppButton
                    title="Concluir"
                    size="md"
                    accessibilityLabel="Concluir ordem de serviço"
                    onPress={() => completeMutation.mutate()}
                    loading={completeMutation.isPending}
                    disabled={completeMutation.isPending}
                    style={styles.actionButton}
                  />
                )}
              </View>
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  actionButton: {
    marginBottom: spacing.xs,
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