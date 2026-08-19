import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { paymentsService } from '../../../src/services/api/payments';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { useNetworkStatus } from '../../../src/hooks/useNetworkStatus';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';
import type {
  PaymentInstallmentStatus,
  PaymentStatus,
} from '../../../src/types/finance';
import { PAYMENT_METHOD_LABELS } from './index';

// ─── Helpers ────────────────────────────────────────────────────────────────

const PAYMENT_STATUS_BADGE: Record<
  PaymentStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  CONFIRMADO: { variant: 'active', label: 'Confirmado' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

const INSTALLMENT_STATUS_BADGE: Record<
  PaymentInstallmentStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  CONFIRMADO: { variant: 'active', label: 'Confirmado' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

function canConfirm(status: PaymentStatus): boolean {
  return status === 'PENDENTE';
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalhePagamentoScreen() {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const paymentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const paymentQuery = useQuery({
    queryKey: ['company', companyId, 'payments', paymentId],
    queryFn: () => paymentsService.getById(paymentId as string),
    enabled: Boolean(companyId && paymentId),
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      paymentsService.update(paymentId as string, { status: 'CONFIRMADO' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'payments'],
      });
      setSnackbar({ type: 'success', message: 'Pagamento confirmado com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const payInstallmentMutation = useMutation({
    mutationFn: (installmentId: string) =>
      paymentsService.payInstallment(paymentId as string, installmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'payments'],
      });
      setSnackbar({ type: 'success', message: 'Parcela recebida com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => paymentsService.remove(paymentId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'payments'],
      });
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Pagamento excluído com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function handleReceiveInstallment(installmentId: string) {
    setReceivingId(installmentId);
    payInstallmentMutation.mutate(installmentId, {
      onSettled: () => setReceivingId(null),
    });
  }

  if (!paymentId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Pagamento', headerShown: true }} />
        <ErrorState message="Pagamento não encontrado" />
      </ScreenContainer>
    );
  }

  const payment = paymentQuery.data;
  const statusBadge = payment ? PAYMENT_STATUS_BADGE[payment.status] : null;

  const installments = payment?.installments?.length
    ? payment.installments
    : [];
  const hasInstallments = installments.length > 0;
  const paidCount = installments.filter(
    (item) => item.status === 'CONFIRMADO',
  ).length;
  const payingInstallment = payInstallmentMutation.isPending;

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe do pagamento', headerShown: true }} />

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
          <Text style={styles.title}>Detalhe do pagamento</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir pagamento"
              onPress={() => setConfirmDeleteVisible(true)}
              hitSlop={8}
              style={styles.headerAction}
            >
              <Ionicons name="trash-outline" size={sizes.icon.lg} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        {paymentQuery.isLoading ? (
          <LoadingState text="Carregando pagamento..." />
        ) : paymentQuery.isError ? (
          <ErrorState
            message={toApiError(paymentQuery.error).message}
            onRetry={paymentQuery.refetch}
          />
        ) : payment ? (
          <>
            <AppCard shadow="light" style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentHeaderLeft}>
                  <Text style={styles.paymentLabel}>
                    {hasInstallments ? 'Valor total' : 'Valor recebido'}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  {hasInstallments ? (
                    <Text style={styles.installmentsSummary}>
                      {paidCount} de {installments.length} parcelas recebidas
                    </Text>
                  ) : null}
                </View>
                {statusBadge && (
                  <StatusBadge status={statusBadge.variant} label={statusBadge.label} size="sm" />
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Cliente</Text>
                <Text style={styles.fieldValue}>
                  {payment.client?.name ?? 'Cliente não informado'}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Método de pagamento</Text>
                <Text style={styles.fieldValue}>
                  {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Data do pagamento</Text>
                <Text style={styles.fieldValue}>
                  {payment.paymentDate
                    ? formatDate(payment.paymentDate)
                    : 'Não informada'}
                </Text>
              </View>

              {payment.dueDate ? (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Vencimento</Text>
                  <Text style={styles.fieldValue}>{formatDate(payment.dueDate)}</Text>
                </View>
              ) : null}

              {payment.quoteId ? (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Orçamento</Text>
                  <Text style={styles.fieldValue}>
                    #{payment.quoteId.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
              ) : null}

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Registrado em</Text>
                <Text style={styles.fieldValue}>{formatDate(payment.createdAt)}</Text>
              </View>
            </AppCard>

            {hasInstallments ? (
              <>
                <Text style={styles.sectionLabel}>Parcelas</Text>
                {installments.map((item) => {
                  const badge = INSTALLMENT_STATUS_BADGE[item.status];
                  return (
                    <AppCard key={item.id} shadow="light" style={styles.installmentCard}>
                      <View style={styles.installmentHeader}>
                        <Text style={styles.installmentTitle}>
                          Parcela {item.installmentNumber}/{installments.length}
                        </Text>
                        <StatusBadge
                          status={badge.variant}
                          label={badge.label}
                          size="sm"
                        />
                      </View>
                      <View style={styles.installmentBody}>
                        <View style={styles.installmentInfo}>
                          <Text style={styles.fieldLabel}>Valor</Text>
                          <Text style={styles.installmentAmount}>
                            {formatCurrency(item.amount)}
                          </Text>
                        </View>
                        <View style={styles.installmentInfo}>
                          <Text style={styles.fieldLabel}>Vencimento</Text>
                          <Text style={styles.installmentDue}>
                            {formatDate(item.dueDate)}
                          </Text>
                        </View>
                      </View>
                      {item.status === 'PENDENTE' ? (
                        <AppButton
                          title="Receber parcela"
                          size="sm"
                          variant="outline"
                          accessibilityLabel={`Receber parcela ${item.installmentNumber}`}
                          onPress={() => handleReceiveInstallment(item.id)}
                          loading={receivingId === item.id}
                          disabled={payingInstallment || isOffline}
                          style={styles.receiveButton}
                        />
                      ) : null}
                    </AppCard>
                  );
                })}
              </>
            ) : null}

            {payment.notes ? (
              <>
                <Text style={styles.sectionLabel}>Observações</Text>
                <AppCard shadow="light" style={styles.obsCard}>
                  <Text style={styles.obsText}>{payment.notes}</Text>
                </AppCard>
              </>
            ) : null}

            <View style={styles.actions}>
              {isOffline && payment.status === 'PENDENTE' ? (
                <Text style={styles.offlineWarning}>
                  Você está offline. Conecte-se para confirmar o pagamento.
                </Text>
              ) : null}
              {canConfirm(payment.status) && !hasInstallments && (
                <AppButton
                  title="Confirmar pagamento"
                  size="lg"
                  accessibilityLabel="Confirmar pagamento"
                  onPress={() => confirmMutation.mutate()}
                  loading={confirmMutation.isPending}
                  disabled={confirmMutation.isPending || isOffline}
                />
              )}
            </View>
          </>
        ) : null}
      </ScreenContainer>

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Excluir pagamento"
        message="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
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
  paymentCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  paymentHeaderLeft: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  paymentAmount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
  installmentsSummary: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldValue: {
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
  installmentCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  installmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  installmentTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  installmentBody: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  installmentInfo: {
    flex: 1,
  },
  installmentAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  installmentDue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  receiveButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  offlineWarning: {
    backgroundColor: colors.warningSoft,
    color: colors.warning,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
});