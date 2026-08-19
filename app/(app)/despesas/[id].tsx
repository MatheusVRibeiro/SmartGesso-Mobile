import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { expensesService } from '../../../src/services/api/expenses';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { useNetworkStatus } from '../../../src/hooks/useNetworkStatus';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { ExpenseCategory } from '../../../src/types/finance';
import { formatCurrency } from '../../../src/utils/format';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORY_BADGE: Record<
  ExpenseCategory,
  { variant: StatusBadgeVariant; label: string }
> = {
  MATERIAL: { variant: 'active', label: 'Material' },
  MAO_DE_OBRA: { variant: 'warning', label: 'Mão de obra' },
  TRANSPORTE: { variant: 'suspended', label: 'Transporte' },
  ALUGUEL: { variant: 'expired', label: 'Aluguel' },
  ENERGIA: { variant: 'warning', label: 'Energia' },
  AGUA: { variant: 'active', label: 'Água' },
  INTERNET: { variant: 'active', label: 'Internet' },
  TELEFONE: { variant: 'active', label: 'Telefone' },
  MARKETING: { variant: 'suspended', label: 'Marketing' },
  IMPOSTOS: { variant: 'cancelled', label: 'Impostos' },
  OUTROS: { variant: 'expired', label: 'Outros' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalheDespesaScreen() {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const expenseId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const expenseQuery = useQuery({
    queryKey: ['company', companyId, 'expenses', expenseId],
    queryFn: () => expensesService.getById(expenseId as string),
    enabled: Boolean(companyId && expenseId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => expensesService.remove(expenseId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'expenses'],
      });
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Despesa excluída com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  if (!expenseId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Despesa', headerShown: true }} />
        <ErrorState message="Despesa não encontrada" />
      </ScreenContainer>
    );
  }

  const expense = expenseQuery.data;
  const badge = expense ? EXPENSE_CATEGORY_BADGE[expense.category] : null;

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe da despesa', headerShown: true }} />

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
          <Text style={styles.title}>Detalhe da despesa</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir despesa"
              onPress={() => setConfirmDeleteVisible(true)}
              disabled={isOffline}
              accessibilityState={{ disabled: isOffline }}
              hitSlop={8}
              style={styles.headerAction}
            >
              <Ionicons name="trash-outline" size={sizes.icon.lg} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        {isOffline ? (
          <Text style={styles.offlineWarning}>
            Você está offline. Conecte-se para excluir a despesa.
          </Text>
        ) : null}

        {expenseQuery.isLoading ? (
          <LoadingState text="Carregando despesa..." />
        ) : expenseQuery.isError ? (
          <ErrorState
            message={toApiError(expenseQuery.error).message}
            onRetry={expenseQuery.refetch}
          />
        ) : expense ? (
          <>
            <AppCard shadow="light" style={styles.expenseCard}>
              <View style={styles.expenseHeader}>
                <View style={styles.expenseHeaderLeft}>
                  <Text style={styles.expenseLabel}>Descrição</Text>
                  <Text style={styles.expenseDescription} numberOfLines={2}>
                    {expense.description}
                  </Text>
                </View>
                {badge && (
                  <StatusBadge status={badge.variant} label={badge.label} size="sm" />
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Valor da despesa</Text>
                <Text style={styles.expenseAmount}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Data</Text>
                <Text style={styles.fieldValue}>{formatDate(expense.expenseDate)}</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Registrada em</Text>
                <Text style={styles.fieldValue}>{formatDate(expense.createdAt)}</Text>
              </View>
            </AppCard>

            {expense.observations ? (
              <>
                <Text style={styles.sectionLabel}>Observações</Text>
                <AppCard shadow="light" style={styles.obsCard}>
                  <Text style={styles.obsText}>{expense.observations}</Text>
                </AppCard>
              </>
            ) : null}
          </>
        ) : null}
      </ScreenContainer>

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Excluir despesa"
        message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        loading={deleteMutation.isPending}
        confirmDisabled={isOffline}
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
  expenseCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  expenseHeaderLeft: {
    flex: 1,
  },
  expenseLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  expenseDescription: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
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
  expenseAmount: {
    fontSize: typography.sizes.xl,
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
  obsCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  obsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
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
    marginBottom: spacing.lg,
  },
});