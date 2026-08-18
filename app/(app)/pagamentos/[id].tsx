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
import { colors, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';
import type { PaymentStatus } from '../../../src/types/finance';
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
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const paymentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
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

  if (!paymentId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Pagamento', headerShown: false }} />
        <ErrorState message="Pagamento não encontrado" />
      </ScreenContainer>
    );
  }

  const payment = paymentQuery.data;
  const statusBadge = payment ? PAYMENT_STATUS_BADGE[payment.status] : null;

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe do pagamento', headerShown: false }} />

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
                <Text style={styles.paymentAmount}>
                  {formatCurrency(payment.amount)}
                </Text>
                {statusBadge && (
                  <StatusBadge status={statusBadge.variant} label={statusBadge.label} size="sm" />
                )}
              </View>

              <View style={styles.paymentRow}>
                <Ionicons
                  name="person-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.paymentText}>
                  {payment.client?.name ?? 'Cliente não informado'}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Ionicons
                  name="wallet-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.paymentText}>
                  {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Ionicons
                  name="calendar-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.paymentText}>
                  {payment.paymentDate
                    ? `Pago em: ${formatDate(payment.paymentDate)}`
                    : 'Data de pagamento não informada'}
                </Text>
              </View>

              {payment.dueDate && (
                <View style={styles.paymentRow}>
                  <Ionicons
                    name="alarm-outline"
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.paymentText}>
                    Vencimento: {formatDate(payment.dueDate)}
                  </Text>
                </View>
              )}

              {payment.quoteId && (
                <View style={styles.paymentRow}>
                  <Ionicons
                    name="document-text-outline"
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.paymentText}>
                    Orçamento: #{payment.quoteId.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.paymentRow}>
                <Ionicons
                  name="time-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.paymentText}>
                  Registrado em: {formatDate(payment.createdAt)}
                </Text>
              </View>
            </AppCard>

            {payment.notes ? (
              <>
                <Text style={styles.sectionLabel}>Observações</Text>
                <AppCard shadow="light" style={styles.obsCard}>
                  <Text style={styles.obsText}>{payment.notes}</Text>
                </AppCard>
              </>
            ) : null}

            <View style={styles.actions}>
              {canConfirm(payment.status) && (
                <AppButton
                  title="Confirmar pagamento"
                  size="md"
                  accessibilityLabel="Confirmar pagamento"
                  onPress={() => confirmMutation.mutate()}
                  loading={confirmMutation.isPending}
                  disabled={confirmMutation.isPending}
                  style={styles.actionButton}
                />
              )}
              <AppButton
                title="Excluir"
                variant="danger"
                size="md"
                accessibilityLabel="Excluir pagamento"
                onPress={() => setConfirmDeleteVisible(true)}
                style={styles.actionButton}
              />
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  paymentCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  paymentAmount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  paymentText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
  actionButton: {
    marginBottom: spacing.xs,
  },
});