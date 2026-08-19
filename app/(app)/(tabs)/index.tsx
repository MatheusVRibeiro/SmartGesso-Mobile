import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '../../../src/components/ui/AppCard';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { dashboardService } from '../../../src/services/api/dashboard';
import { toApiError } from '../../../src/services/api/client';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** "2026-08-19T14:30:00.000Z" → "11:30" (hora local). */
function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** "2026-08-19T14:30:00.000Z" → "19/08" (dd/mm local). */
function formatShortDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

// Status do orçamento → StatusBadge variant
const getQuoteStatusBadge = (status: string): { variant: StatusBadgeVariant; label: string } => {
  switch (status) {
    case 'ENVIADO':
      return { variant: 'warning', label: 'Enviado' };
    case 'APROVADO':
      return { variant: 'active', label: 'Aprovado' };
    case 'RASCUNHO':
      return { variant: 'expired', label: 'Rascunho' };
    default:
      return { variant: 'cancelled', label: status };
  }
};

// Status da OS → "tipo" do serviço (badge)
const SERVICE_STATUS_BADGE: Record<string, { variant: StatusBadgeVariant; label: string }> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

// ─── Card de métrica ────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  valueColor?: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  valueColor,
}: MetricCardProps) {
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

export default function HomeScreen() {
  const activeCompany = useSessionStore((s) => s.activeCompany);
  const currentUser = useSessionStore((s) => s.currentUser);

  const companyId = activeCompany?.company?.id;
  const userName = currentUser?.name?.split(' ')[0] ?? 'usuário';
  const companyName = activeCompany?.company?.tradeName ?? 'SmartGesso';

  const {
    data: metrics,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard', companyId],
    queryFn: () => dashboardService.getMetrics(),
    enabled: Boolean(companyId),
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando dashboard..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const toReceiveCount = metrics?.toReceive?.count ?? 0;
  const todayServicesCount = metrics?.todayServices?.count ?? 0;
  const openQuotesCount = metrics?.openQuotes?.count ?? 0;
  const monthExpensesCount = metrics?.monthExpenses?.count ?? 0;

  const todayServices = metrics?.todayServices?.list ?? [];
  const recentQuotes = metrics?.recentQuotes ?? [];
  const pendingPayments = metrics?.pendingPayments ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
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
        {/* Saudação */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {userName}</Text>
          <Text style={styles.companyName}>{companyName}</Text>
        </View>

        {/* Métricas (grade 2x2) */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="A receber"
            value={formatCurrency(metrics?.toReceive?.total ?? 0)}
            subtitle={
              toReceiveCount > 0
                ? `${toReceiveCount} ${pluralize(
                    toReceiveCount,
                    'pagamento pendente',
                    'pagamentos pendentes',
                  )}`
                : 'Nenhum pagamento pendente'
            }
            icon="cash-outline"
            iconBackground={colors.warningSoft}
            iconColor={colors.warning}
            valueColor={colors.warning}
          />

          <MetricCard
            title="Serviços hoje"
            value={String(todayServicesCount)}
            subtitle={
              todayServicesCount > 0
                ? `${todayServicesCount} ${pluralize(
                    todayServicesCount,
                    'serviço agendado',
                    'serviços agendados',
                  )}`
                : 'Nenhum serviço hoje'
            }
            icon="hammer-outline"
            iconBackground={colors.primarySoft}
            iconColor={colors.primary}
            valueColor={colors.primary}
          />

          <MetricCard
            title="Orçamentos abertos"
            value={String(openQuotesCount)}
            subtitle={
              openQuotesCount > 0
                ? `${openQuotesCount} ${pluralize(
                    openQuotesCount,
                    'orçamento aberto',
                    'orçamentos abertos',
                  )}`
                : 'Nenhum orçamento aberto'
            }
            icon="document-text-outline"
            iconBackground={colors.infoSoft}
            iconColor={colors.info}
            valueColor={colors.info}
          />

          <MetricCard
            title="Despesas do mês"
            value={formatCurrency(metrics?.monthExpenses?.total ?? 0)}
            subtitle={
              monthExpensesCount > 0
                ? `${monthExpensesCount} ${pluralize(
                    monthExpensesCount,
                    'despesa no mês',
                    'despesas no mês',
                  )}`
                : 'Nenhuma despesa no mês'
            }
            icon="receipt-outline"
            iconBackground={colors.dangerSoft}
            iconColor={colors.danger}
            valueColor={colors.danger}
          />
        </View>

        {/* Seção: Serviços de hoje */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços de hoje</Text>
          <Text style={styles.sectionSubtitle}>Serviços agendados para hoje</Text>

          <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
            {todayServices.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum serviço agendado para hoje</Text>
            ) : (
              todayServices.map((service, index, array) => {
                const badge =
                  SERVICE_STATUS_BADGE[service.status] ?? {
                    variant: 'info' as const,
                    label: service.status,
                  };
                return (
                  <View
                    key={service.id}
                    style={[
                      styles.listItem,
                      index < array.length - 1 && styles.listItemBorder,
                    ]}
                  >
                    <View style={[styles.listIconContainer, styles.listIconPrimary]}>
                      <Ionicons
                        name="hammer-outline"
                        size={sizes.icon.md}
                        color={colors.primary}
                        accessibilityElementsHidden
                      />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>
                        {formatTime(service.scheduledDate)} ·{' '}
                        {service.client?.name ?? 'Cliente'}
                      </Text>
                      <Text style={styles.listItemValue} numberOfLines={1}>
                        {service.work?.name ?? 'Serviço'}
                      </Text>
                    </View>
                    <StatusBadge status={badge.variant} label={badge.label} size="sm" />
                  </View>
                );
              })
            )}
          </AppCard>
        </View>

        {/* Seção: Orçamentos recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orçamentos recentes</Text>
          <Text style={styles.sectionSubtitle}>Últimos orçamentos da empresa</Text>

          <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
            {recentQuotes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum orçamento recente</Text>
            ) : (
              recentQuotes.slice(0, 5).map((quote, index, array) => {
                const badge = getQuoteStatusBadge(quote.status);
                return (
                  <View
                    key={quote.id}
                    style={[
                      styles.listItem,
                      index < array.length - 1 && styles.listItemBorder,
                    ]}
                  >
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>
                        #{quote.quoteNumber} v{quote.version} —{' '}
                        {quote.client?.name ?? 'Cliente'}
                      </Text>
                      <Text style={styles.listItemValue}>
                        {formatCurrency(quote.total)}
                      </Text>
                    </View>
                    <StatusBadge status={badge.variant} label={badge.label} size="sm" />
                  </View>
                );
              })
            )}
          </AppCard>
        </View>

        {/* Seção: Pagamentos pendentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagamentos pendentes</Text>
          <Text style={styles.sectionSubtitle}>Recebimentos aguardando confirmação</Text>

          <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
            {pendingPayments.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum pagamento pendente</Text>
            ) : (
              pendingPayments.slice(0, 5).map((payment, index, array) => (
                <View
                  key={payment.id}
                  style={[
                    styles.listItem,
                    index < array.length - 1 && styles.listItemBorder,
                  ]}
                >
                  <View style={[styles.listIconContainer, styles.listIconWarning]}>
                    <Ionicons
                      name="cash-outline"
                      size={sizes.icon.md}
                      color={colors.warning}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>
                      {payment.client?.name ?? 'Cliente'}
                    </Text>
                    <Text style={styles.listItemValue}>
                      {formatCurrency(payment.amount)}
                    </Text>
                  </View>
                  <Text style={styles.dueDateText}>
                    {payment.dueDate ? `Vence ${formatShortDate(payment.dueDate)}` : 'Sem vencimento'}
                  </Text>
                </View>
              ))
            )}
          </AppCard>
        </View>
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
  greeting: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  companyName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
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
    gap: spacing.md,
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
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIconPrimary: {
    backgroundColor: colors.primarySoft,
  },
  listIconWarning: {
    backgroundColor: colors.warningSoft,
  },
  dueDateText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});