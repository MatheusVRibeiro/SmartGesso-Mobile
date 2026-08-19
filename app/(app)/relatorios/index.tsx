import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { expensesService } from '../../../src/services/api/expenses';
import { paymentsService } from '../../../src/services/api/payments';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { Expense, Payment, PaymentStatus } from '../../../src/types/finance';
import { formatCurrency } from '../../../src/utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real retorna array puro em GET /payments e GET /expenses (Prisma
 * findMany), enquanto os tipos declarados são { data, total }. Normaliza ambos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const PAYMENT_STATUS_BADGE: Record<
  PaymentStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  CONFIRMADO: { variant: 'active', label: 'Confirmado' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

// ─── Card de resumo ─────────────────────────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  valueColor?: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  valueColor,
}: SummaryCardProps) {
  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.metricCard}>
      <View style={[styles.metricIconContainer, { backgroundColor: iconBackground }]}>
        <Ionicons
          name={icon}
          size={sizes.icon.md}
          color={iconColor}
          accessibilityElementsHidden
        />
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text
        style={[styles.metricValue, valueColor ? { color: valueColor } : undefined]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </AppCard>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function RelatoriosScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['relatorios', companyId],
    queryFn: async () => {
      // Busca pagamentos e despesas em paralelo.
      const [paymentsResult, expensesResult] = await Promise.all([
        paymentsService.list(),
        expensesService.list(),
      ]);
      return {
        payments: toArray<Payment>(paymentsResult),
        expenses: toArray<Expense>(expensesResult),
      };
    },
    enabled: Boolean(companyId),
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando relatórios..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const payments = data?.payments ?? [];
  const expenses = data?.expenses ?? [];

  const pendingPayments = payments.filter((p) => p.status === 'PENDENTE');
  const confirmedPayments = payments.filter((p) => p.status === 'CONFIRMADO');

  const toReceive = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const received = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = received - totalExpenses;

  // Últimos 5 registros por data de criação.
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const hasData = payments.length > 0 || expenses.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Relatórios', headerShown: true }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
          <Text style={styles.subtitle}>Visão geral financeira</Text>
        </View>

        {!hasData ? (
          <EmptyState
            title="Nenhum dado financeiro"
            description="Registre pagamentos e despesas para acompanhar o resumo financeiro da empresa"
            icon="bar-chart-outline"
          />
        ) : (
          <>
            {/* Cards de resumo (grade 2x2) */}
            <View style={styles.metricsGrid}>
              <SummaryCard
                title="A receber"
                value={formatCurrency(toReceive)}
                subtitle={`${pendingPayments.length} ${pluralize(
                  pendingPayments.length,
                  'pagamento pendente',
                  'pagamentos pendentes'
                )}`}
                icon="cash-outline"
                iconBackground={colors.warningSoft}
                iconColor={colors.warning}
                valueColor={colors.warning}
              />

              <SummaryCard
                title="Recebido"
                value={formatCurrency(received)}
                subtitle={`${confirmedPayments.length} ${pluralize(
                  confirmedPayments.length,
                  'recebimento confirmado',
                  'recebimentos confirmados'
                )}`}
                icon="checkmark-circle-outline"
                iconBackground={colors.successSoft}
                iconColor={colors.success}
                valueColor={colors.success}
              />

              <SummaryCard
                title="Despesas"
                value={formatCurrency(totalExpenses)}
                subtitle={`${expenses.length} ${pluralize(
                  expenses.length,
                  'despesa registrada',
                  'despesas registradas'
                )}`}
                icon="receipt-outline"
                iconBackground={colors.dangerSoft}
                iconColor={colors.danger}
                valueColor={colors.danger}
              />

              <SummaryCard
                title="Saldo"
                value={formatCurrency(balance)}
                subtitle="Recebimentos menos despesas"
                icon="wallet-outline"
                iconBackground={colors.primarySoft}
                iconColor={colors.primary}
                valueColor={balance >= 0 ? colors.success : colors.danger}
              />
            </View>

            {/* Últimos pagamentos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Últimos pagamentos</Text>
              <Text style={styles.sectionSubtitle}>Últimos recebimentos registrados</Text>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {recentPayments.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum pagamento registrado</Text>
                ) : (
                  recentPayments.map((payment, index, array) => {
                    const badge = PAYMENT_STATUS_BADGE[payment.status];
                    return (
                      <View
                        key={payment.id}
                        style={[
                          styles.listItem,
                          index < array.length - 1 && styles.listItemBorder,
                        ]}
                      >
                        <View style={styles.listItemContent}>
                          <Text style={styles.listItemTitle} numberOfLines={1}>
                            {payment.client?.name ?? 'Cliente'}
                          </Text>
                          <Text
                            style={[
                              styles.listItemValue,
                              payment.status === 'CONFIRMADO' &&
                                styles.listItemValueSuccess,
                            ]}
                          >
                            {formatCurrency(payment.amount)}
                          </Text>
                        </View>
                        <StatusBadge status={badge.variant} label={badge.label} size="sm" />
                      </View>
                    );
                  })
                )}
              </AppCard>
            </View>

            {/* Últimas despesas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Últimas despesas</Text>
              <Text style={styles.sectionSubtitle}>Últimos gastos registrados</Text>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {recentExpenses.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma despesa registrada</Text>
                ) : (
                  recentExpenses.map((expense, index, array) => (
                    <View
                      key={expense.id}
                      style={[
                        styles.listItem,
                        index < array.length - 1 && styles.listItemBorder,
                      ]}
                    >
                      <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle} numberOfLines={1}>
                          {expense.description}
                        </Text>
                        <Text style={styles.listItemValue}>
                          {formatCurrency(expense.amount)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </AppCard>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: sizes.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
    paddingTop: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  metricCard: {
    width: '48%',
    padding: spacing.lg,
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  metricTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionCard: {
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listItemContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  listItemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  listItemValue: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listItemValueSuccess: {
    color: colors.success,
    fontWeight: typography.weights.semibold,
  },
});
