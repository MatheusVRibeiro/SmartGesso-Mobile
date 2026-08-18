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
import { serviceOrdersService } from '../../../src/services/api/serviceOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, sizes, spacing, typography } from '../../../src/theme';
import { formatNumber } from '../../../src/utils/format';
import type { ServiceOrderStatus } from '../../../src/types/serviceOrder';

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

function canComplete(status: ServiceOrderStatus): boolean {
  return status === 'PENDENTE' || status === 'EM_ANDAMENTO';
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalheOrdemServicoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const orderQuery = useQuery({
    queryKey: ['company', companyId, 'service-orders', orderId],
    queryFn: () => serviceOrdersService.getById(orderId as string),
    enabled: Boolean(companyId && orderId),
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
        <Stack.Screen options={{ title: 'Ordem de serviço', headerShown: false }} />
        <ErrorState message="Ordem de serviço não encontrada" />
      </ScreenContainer>
    );
  }

  const order = orderQuery.data;
  const statusBadge = order ? SERVICE_ORDER_STATUS_BADGE[order.status] : null;

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe da ordem de serviço', headerShown: false }} />

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

              <View style={styles.orderRow}>
                <Ionicons
                  name="person-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.orderText}>
                  {order.client?.name ?? 'Cliente não informado'}
                </Text>
              </View>

              {order.work && (
                <View style={styles.orderRow}>
                  <Ionicons
                    name="construct-outline"
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.orderText}>{order.work.name}</Text>
                </View>
              )}

              <View style={styles.orderRow}>
                <Ionicons
                  name="calendar-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.orderText}>
                  {order.scheduledDate
                    ? `Agendada: ${formatDate(order.scheduledDate)}`
                    : `Criada: ${formatDate(order.createdAt)}`}
                </Text>
              </View>

              {order.completedDate && (
                <View style={styles.orderRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.orderText}>
                    Concluída: {formatDate(order.completedDate)}
                  </Text>
                </View>
              )}
            </AppCard>

            <Text style={styles.sectionLabel}>Materiais</Text>
            {!order.materials || order.materials.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum material adicionado</Text>
            ) : (
              order.materials.map((material) => (
                <AppCard key={material.id} shadow="light" style={styles.materialCard}>
                  <View style={styles.materialHeader}>
                    <Text style={styles.materialName} numberOfLines={2}>
                      {material.materialName}
                    </Text>
                    <Text style={styles.materialQuantity}>
                      {formatNumber(material.quantity)} {material.unit}
                    </Text>
                  </View>
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

            <View style={styles.actions}>
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
              <AppButton
                title="Excluir"
                variant="danger"
                size="md"
                accessibilityLabel="Excluir ordem de serviço"
                onPress={() => setConfirmDeleteVisible(true)}
                style={styles.actionButton}
              />
            </View>
          </>
        ) : null}
      </ScreenContainer>

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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  orderCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  orderNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  orderText: {
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
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  materialCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  materialName: {
    flex: 1,
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
});