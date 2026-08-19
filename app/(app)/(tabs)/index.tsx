import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '../../../src/components/ui/AppCard';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { dashboardService } from '../../../src/services/api/dashboard';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';

// Formatação BRL
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
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
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando dashboard..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          message={error?.message || 'Erro ao carregar dados do dashboard'}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  const toReceiveCount = metrics?.toReceive?.count ?? 0;
  const todayServicesCount = metrics?.todayServices?.count ?? 0;

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

        {/* Métricas */}
        <View style={styles.metricsContainer}>
          {/* Card: A Receber */}
          <AppCard shadow="light" radius={radius.lg} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, styles.metricIconSuccess]}>
                <Ionicons
                  name="cash-outline"
                  size={sizes.icon.md}
                  color={colors.success}
                  accessibilityElementsHidden
                />
              </View>
              <StatusBadge
                status={toReceiveCount > 0 ? 'warning' : 'active'}
                label={toReceiveCount > 0 ? 'Pendente' : 'Quitado'}
                size="sm"
              />
            </View>
            <Text style={styles.metricTitle}>A receber</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(metrics?.toReceive?.total ?? 0)}
            </Text>
            <Text style={styles.metricSubtitle}>
              {toReceiveCount > 0
                ? `${toReceiveCount} pagamentos pendentes`
                : 'Nenhum pagamento pendente'}
            </Text>
          </AppCard>

          {/* Card: Serviços do Dia */}
          <AppCard shadow="light" radius={radius.lg} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, styles.metricIconPrimary]}>
                <Ionicons
                  name="hammer-outline"
                  size={sizes.icon.md}
                  color={colors.primary}
                  accessibilityElementsHidden
                />
              </View>
              <StatusBadge
                status={todayServicesCount > 0 ? 'warning' : 'active'}
                label={todayServicesCount > 0 ? 'Agendado' : 'Sem serviços'}
                size="sm"
              />
            </View>
            <Text style={styles.metricTitle}>Serviços do dia</Text>
            <Text style={styles.metricValue}>{todayServicesCount}</Text>
            <Text style={styles.metricSubtitle}>
              {todayServicesCount > 0
                ? `${todayServicesCount} serviços agendados`
                : 'Nenhum serviço hoje'}
            </Text>
          </AppCard>
        </View>

        {/* Seção: Orçamentos Recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orçamentos recentes</Text>
          <Text style={styles.sectionSubtitle}>Últimos orçamentos da empresa</Text>

          {!metrics?.recentQuotes || metrics.recentQuotes.length === 0 ? (
            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              <Text style={styles.emptyText}>Nenhum orçamento recente</Text>
            </AppCard>
          ) : (
            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              {metrics.recentQuotes.slice(0, 5).map((quote, index, array) => {
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
                      <Text style={styles.listItemTitle}>
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
              })}
            </AppCard>
          )}
        </View>

        {/* Seção: Alertas de Estoque */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de estoque</Text>
          <Text style={styles.sectionSubtitle}>Materiais abaixo do estoque mínimo</Text>

          {!metrics?.stockAlerts || metrics.stockAlerts.length === 0 ? (
            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              <Text style={styles.emptyText}>Nenhum alerta de estoque</Text>
            </AppCard>
          ) : (
            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              {metrics.stockAlerts.map((alert) => (
                <View key={alert.id} style={[styles.listItem, styles.listItemAlert]}>
                  <View style={styles.alertIconContainer}>
                    <Ionicons
                      name="alert"
                      size={sizes.icon.md}
                      color={colors.danger}
                      accessibilityElementsHidden
                    />
                  </View>
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
            </AppCard>
          )}
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
  metricsContainer: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
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
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconSuccess: {
    backgroundColor: colors.successSoft,
  },
  metricIconPrimary: {
    backgroundColor: colors.primarySoft,
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
  listItemAlert: {
    gap: spacing.md,
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
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
