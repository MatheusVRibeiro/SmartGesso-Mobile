import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { dashboardService } from '../../../src/services/api/dashboard';
import { colors, radius, spacing, typography } from '../../../src/theme';

// Formatação BRL
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formatação data
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
};

// Status do orçamento → StatusBadge variant
const getQuoteStatusBadge = (status: string) => {
  switch (status) {
    case 'ENVIADO':
      return { variant: 'warning' as const, label: 'Enviado' };
    case 'APROVADO':
      return { variant: 'active' as const, label: 'Aprovado' };
    case 'RASCUNHO':
      return { variant: 'expired' as const, label: 'Rascunho' };
    default:
      return { variant: 'cancelled' as const, label: status };
  }
};

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
      <ScreenContainer>
        <LoadingState text="Carregando dashboard..." />
      </ScreenContainer>
    );
  }

  // Error state
  if (isError) {
    return (
      <ScreenContainer>
        <ErrorState
          message={error?.message || 'Erro ao carregar dados do dashboard'}
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />

      {/* Saudação */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {userName}</Text>
        <Text style={styles.companyName}>{companyName}</Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* Card: A Receber */}
        <AppCard shadow="light" radius={radius.md} style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
            </View>
            <StatusBadge
              status={metrics?.toReceive?.total && metrics.toReceive.total > 0 ? 'warning' : 'active'}
              label={metrics?.toReceive?.count && metrics.toReceive.count > 0 ? 'Pendente' : 'Quitado'}
              size="sm"
            />
          </View>
          <Text style={styles.metricTitle}>A receber</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(metrics?.toReceive?.total ?? 0)}
          </Text>
          <Text style={styles.metricSubtitle}>
            {metrics?.toReceive?.count && metrics.toReceive.count > 0
              ? `${metrics.toReceive.count} pagamentos pendentes`
              : 'Nenhum pagamento pendente'}
          </Text>
        </AppCard>

        {/* Card: Serviços do Dia */}
        <AppCard shadow="light" radius={radius.md} style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="hammer-outline" size={20} color={colors.primary} />
            </View>
            <StatusBadge
              status={metrics?.todayServices?.count && metrics.todayServices.count > 0 ? 'warning' : 'active'}
              label={metrics?.todayServices?.count && metrics.todayServices.count > 0 ? 'Agendado' : 'Sem serviços'}
              size="sm"
            />
          </View>
          <Text style={styles.metricTitle}>Serviços do dia</Text>
          <Text style={styles.metricValue}>
            {metrics?.todayServices?.count ?? 0}
          </Text>
          <Text style={styles.metricSubtitle}>
            {metrics?.todayServices?.count && metrics.todayServices.count > 0
              ? `${metrics.todayServices.count} serviços agendados`
              : 'Nenhum serviço hoje'}
          </Text>
        </AppCard>

        {/* Card: Orçamentos Recentes */}
        <AppCard shadow="light" radius={radius.md} style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.metricTitle}>Orçamentos recentes</Text>
          
          {!metrics?.recentQuotes || metrics.recentQuotes.length === 0 ? (
            <EmptyState
              title="Nenhum orçamento recente"
              icon="document-text-outline"
              style={styles.emptyState}
            />
          ) : (
            <View style={styles.listContainer}>
              {metrics.recentQuotes.slice(0, 5).map((quote) => {
                const badge = getQuoteStatusBadge(quote.status);
                return (
                  <View key={quote.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>
                        #{quote.quoteNumber} v{quote.version} — {quote.client?.name ?? 'Cliente'}
                      </Text>
                      <Text style={styles.listItemValue}>
                        {formatCurrency(quote.total)}
                      </Text>
                    </View>
                    <StatusBadge status={badge.variant} label={badge.label} size="sm" />
                  </View>
                );
              })}
            </View>
          )}
        </AppCard>

        {/* Card: Alertas de Estoque */}
        <AppCard shadow="light" radius={radius.md} style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
            </View>
          </View>
          <Text style={styles.metricTitle}>Alertas de estoque</Text>
          
          {!metrics?.stockAlerts || metrics.stockAlerts.length === 0 ? (
            <EmptyState
              title="Nenhum alerta de estoque"
              icon="alert-circle-outline"
              style={styles.emptyState}
            />
          ) : (
            <View style={styles.listContainer}>
              {metrics.stockAlerts.map((alert) => (
                <View key={alert.id} style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{alert.name}</Text>
                    <Text style={styles.listItemValue}>
                      {alert.stockQty} {alert.unit} (mín: {alert.minStockQty})
                    </Text>
                  </View>
                  <StatusBadge
                    status={alert.stockQty <= alert.minStockQty * 0.5 ? 'suspended' : 'expired'}
                    label={alert.stockQty <= alert.minStockQty * 0.5 ? 'Crítico' : 'Baixo'}
                    size="sm"
                  />
                </View>
              ))}
            </View>
          )}
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  metricsContainer: {
    gap: spacing.md,
  },
  metricCard: {
    padding: spacing.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  listContainer: {
    marginTop: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  emptyState: {
    paddingVertical: spacing.lg,
  },
});
