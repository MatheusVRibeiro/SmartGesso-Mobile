import React, { useCallback, useMemo, useState } from 'react';
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
import { toApiError } from '../../../src/services/api/client';
import { expensesService } from '../../../src/services/api/expenses';
import { paymentsService } from '../../../src/services/api/payments';
import { quotesService } from '../../../src/services/api/quotes';
import { serviceOrdersService } from '../../../src/services/api/serviceOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { Expense, Payment } from '../../../src/types/finance';
import type { QuoteSummary } from '../../../src/types/quote';
import type { ServiceOrder } from '../../../src/types/serviceOrder';
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

// ─── Tipos de filtros ───────────────────────────────────────────────────────

type GranularityFilter = 'monthly' | 'quarterly';
type MetricsFilter = 'all' | 'financial' | 'operational';

// ─── Opções de filtros ──────────────────────────────────────────────────────

const GRANULARITY_OPTIONS: { label: string; value: GranularityFilter }[] = [
  { label: 'Mensal', value: 'monthly' },
  { label: 'Trimestral', value: 'quarterly' },
];

const METRICS_OPTIONS: { label: string; value: MetricsFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Financeiro', value: 'financial' },
  { label: 'Operacional', value: 'operational' },
];

// ─── Geração de períodos ────────────────────────────────────────────────────

interface PeriodOption {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

function generatePeriodOptions(granularity: GranularityFilter): PeriodOption[] {
  const now = new Date();
  const periods: PeriodOption[] = [];

  if (granularity === 'monthly') {
    // Últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      periods.push({
        label: `${getMonthName(date.getMonth())}/${date.getFullYear()}`,
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: nextMonth,
      });
    }
  } else {
    // Últimos 4 trimestres
    for (let i = 0; i < 4; i++) {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterIndex = currentQuarter - i;
      const year = now.getFullYear() + Math.floor(quarterIndex / 3);
      const adjustedQuarter = ((quarterIndex % 3) + 3) % 3;
      
      const startMonth = adjustedQuarter * 3;
      const endMonth = startMonth + 2;
      
      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth + 1, 0); // Último dia do mês
      
      const quarterLabel = `T${adjustedQuarter + 1}/${year}`;
      
      periods.push({
        label: quarterLabel,
        value: `${year}-Q${adjustedQuarter + 1}`,
        startDate,
        endDate,
      });
    }
  }

  return periods;
}

// ─── Card de comparação ─────────────────────────────────────────────────────

interface ComparisonCardProps {
  title: string;
  valueA: string;
  valueB: string;
  variation: number | null;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
}

function ComparisonCard({
  title,
  valueA,
  valueB,
  variation,
  icon,
  iconBackground,
  iconColor,
}: ComparisonCardProps) {
  const variationColor = variation !== null
    ? variation >= 0 ? colors.success : colors.danger
    : colors.textSecondary;
  
  const variationIcon = variation !== null
    ? variation >= 0 ? 'arrow-up' : 'arrow-down'
    : 'remove-outline';
  
  const variationText = variation !== null
    ? `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`
    : '—';

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.comparisonCard}>
      <View style={styles.comparisonHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
          <Ionicons
            name={icon}
            size={sizes.icon.md}
            color={iconColor}
            accessibilityElementsHidden
          />
        </View>
        <Text style={styles.comparisonTitle}>{title}</Text>
      </View>
      
      <View style={styles.comparisonValues}>
        <View style={styles.periodValue}>
          <Text style={styles.periodLabel}>Período A</Text>
          <Text style={styles.periodValueText}>{valueA}</Text>
        </View>
        
        <View style={styles.variationContainer}>
          <Ionicons
            name={variationIcon}
            size={16}
            color={variationColor}
            accessibilityElementsHidden
          />
          <Text style={[styles.variationText, { color: variationColor }]}>
            {variationText}
          </Text>
        </View>
        
        <View style={styles.periodValue}>
          <Text style={styles.periodLabel}>Período B</Text>
          <Text style={styles.periodValueText}>{valueB}</Text>
        </View>
      </View>
    </AppCard>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ComparativoScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [granularity, setGranularity] = useState<GranularityFilter>('monthly');
  const [metricsFilter, setMetricsFilter] = useState<MetricsFilter>('all');
  const [selectedPeriodA, setSelectedPeriodA] = useState<string>('');
  const [selectedPeriodB, setSelectedPeriodB] = useState<string>('');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['comparativo', companyId],
    queryFn: async () => {
      const [paymentsResult, expensesResult, quotesResult, serviceOrdersResult] = await Promise.all([
        paymentsService.list(),
        expensesService.list(),
        quotesService.list(),
        serviceOrdersService.list(),
      ]);
      return {
        payments: toArray<Payment>(paymentsResult),
        expenses: toArray<Expense>(expensesResult),
        quotes: toArray<QuoteSummary>(quotesResult),
        serviceOrders: toArray<ServiceOrder>(serviceOrdersResult.data),
      };
    },
    enabled: Boolean(companyId),
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Gerar opções de períodos
  const periodOptions = useMemo(() => {
    return generatePeriodOptions(granularity);
  }, [granularity]);

  // Selecionar períodos padrão
  useMemo(() => {
    if (periodOptions.length >= 2 && !selectedPeriodA && !selectedPeriodB) {
      setSelectedPeriodA(periodOptions[1].value); // Período anterior
      setSelectedPeriodB(periodOptions[0].value); // Período atual
    }
  }, [periodOptions, selectedPeriodA, selectedPeriodB]);

  // Filtrar dados por períodos
  const comparisonData = useMemo(() => {
    const payments = data?.payments ?? [];
    const expenses = data?.expenses ?? [];
    const quotes = data?.quotes ?? [];
    const serviceOrders = data?.serviceOrders ?? [];

    const periodA = periodOptions.find(p => p.value === selectedPeriodA);
    const periodB = periodOptions.find(p => p.value === selectedPeriodB);

    if (!periodA || !periodB) {
      return null;
    }

    // Filtrar pagamentos por período
    const paymentsA = payments.filter(p => {
      const date = new Date(p.paymentDate);
      return date >= periodA.startDate && date <= periodA.endDate;
    });
    const paymentsB = payments.filter(p => {
      const date = new Date(p.paymentDate);
      return date >= periodB.startDate && date <= periodB.endDate;
    });

    // Filtrar despesas por período
    const expensesA = expenses.filter(e => {
      const date = new Date(e.expenseDate);
      return date >= periodA.startDate && date <= periodA.endDate;
    });
    const expensesB = expenses.filter(e => {
      const date = new Date(e.expenseDate);
      return date >= periodB.startDate && date <= periodB.endDate;
    });

    // Filtrar orçamentos aprovados por período
    const quotesA = quotes.filter(q => {
      const date = new Date(q.createdAt);
      return date >= periodA.startDate && date <= periodA.endDate && q.status === 'APROVADO';
    });
    const quotesB = quotes.filter(q => {
      const date = new Date(q.createdAt);
      return date >= periodB.startDate && date <= periodB.endDate && q.status === 'APROVADO';
    });

    // Filtrar serviços concluídos por período
    const servicesA = serviceOrders.filter(so => {
      const date = new Date(so.completedDate || so.createdAt);
      return date >= periodA.startDate && date <= periodA.endDate && so.status === 'CONCLUIDA';
    });
    const servicesB = serviceOrders.filter(so => {
      const date = new Date(so.completedDate || so.createdAt);
      return date >= periodB.startDate && date <= periodB.endDate && so.status === 'CONCLUIDA';
    });

    // Calcular totais financeiros
    const totalPaymentsA = paymentsA.reduce((sum, p) => sum + p.amount, 0);
    const totalPaymentsB = paymentsB.reduce((sum, p) => sum + p.amount, 0);
    const totalExpensesA = expensesA.reduce((sum, e) => sum + e.amount, 0);
    const totalExpensesB = expensesB.reduce((sum, e) => sum + e.amount, 0);
    const balanceA = totalPaymentsA - totalExpensesA;
    const balanceB = totalPaymentsB - totalExpensesB;

    // Calcular variações percentuais
    const calculateVariation = (a: number, b: number): number | null => {
      if (a === 0 && b === 0) return null;
      if (a === 0) return 100; // 100% de melhoria
      return ((b - a) / Math.abs(a)) * 100;
    };

    return {
      periodA,
      periodB,
      payments: {
        a: totalPaymentsA,
        b: totalPaymentsB,
        variation: calculateVariation(totalPaymentsA, totalPaymentsB),
      },
      expenses: {
        a: totalExpensesA,
        b: totalExpensesB,
        variation: calculateVariation(totalExpensesA, totalExpensesB),
      },
      balance: {
        a: balanceA,
        b: balanceB,
        variation: calculateVariation(balanceA, balanceB),
      },
      quotes: {
        a: quotesA.length,
        b: quotesB.length,
        variation: calculateVariation(quotesA.length, quotesB.length),
      },
      services: {
        a: servicesA.length,
        b: servicesB.length,
        variation: calculateVariation(servicesA.length, servicesB.length),
      },
    };
  }, [data, periodOptions, selectedPeriodA, selectedPeriodB]);

  const hasData = data && (data.payments.length > 0 || data.expenses.length > 0 || data.quotes.length > 0 || data.serviceOrders.length > 0);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando comparativo..." />
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Comparativo entre Períodos', headerShown: true }} />

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
          <Text style={styles.title}>Comparativo entre Períodos</Text>
          <Text style={styles.subtitle}>Compare métricas entre dois períodos</Text>
        </View>

        {!hasData ? (
          <EmptyState
            title="Nenhum dado disponível"
            description="Registre pagamentos, despesas, orçamentos e serviços para visualizar o comparativo"
            icon="bar-chart-outline"
          />
        ) : (
          <>
            {/* Filtros de período */}
            <View style={styles.filtersSection}>
              <Text style={styles.filterLabel}>Granularidade:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {GRANULARITY_OPTIONS.map((option) => (
                  <View
                    key={option.value}
                    style={[
                      styles.filterChip,
                      granularity === option.value && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        granularity === option.value && styles.filterChipTextActive,
                      ]}
                      onPress={() => {
                        setGranularity(option.value);
                        setSelectedPeriodA('');
                        setSelectedPeriodB('');
                      }}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>Métricas:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {METRICS_OPTIONS.map((option) => (
                  <View
                    key={option.value}
                    style={[
                      styles.filterChip,
                      metricsFilter === option.value && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        metricsFilter === option.value && styles.filterChipTextActive,
                      ]}
                      onPress={() => setMetricsFilter(option.value)}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Seleção de períodos */}
            <View style={styles.periodsSection}>
              <Text style={styles.sectionTitle}>Selecionar Períodos</Text>
              
              <View style={styles.periodSelectors}>
                <View style={styles.periodSelector}>
                  <Text style={styles.periodSelectorLabel}>Período A:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
                    {periodOptions.map((option) => (
                      <View
                        key={option.value}
                        style={[
                          styles.periodChip,
                          selectedPeriodA === option.value && styles.periodChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodChipText,
                            selectedPeriodA === option.value && styles.periodChipTextActive,
                          ]}
                          onPress={() => setSelectedPeriodA(option.value)}
                        >
                          {option.label}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.periodSelector}>
                  <Text style={styles.periodSelectorLabel}>Período B:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
                    {periodOptions.map((option) => (
                      <View
                        key={option.value}
                        style={[
                          styles.periodChip,
                          selectedPeriodB === option.value && styles.periodChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodChipText,
                            selectedPeriodB === option.value && styles.periodChipTextActive,
                          ]}
                          onPress={() => setSelectedPeriodB(option.value)}
                        >
                          {option.label}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Resultados do comparativo */}
            {comparisonData && (
              <View style={styles.resultsSection}>
                <Text style={styles.sectionTitle}>
                  Comparativo: {comparisonData.periodA.label} vs {comparisonData.periodB.label}
                </Text>
                
                <Text style={styles.sectionSubtitle}>
                  Variação percentual entre os períodos selecionados
                </Text>

                {/* Cards de comparação */}
                {(metricsFilter === 'all' || metricsFilter === 'financial') && (
                  <>
                    <ComparisonCard
                      title="Recebimentos"
                      valueA={formatCurrency(comparisonData.payments.a)}
                      valueB={formatCurrency(comparisonData.payments.b)}
                      variation={comparisonData.payments.variation}
                      icon="cash-outline"
                      iconBackground={colors.successSoft}
                      iconColor={colors.success}
                    />

                    <ComparisonCard
                      title="Despesas"
                      valueA={formatCurrency(comparisonData.expenses.a)}
                      valueB={formatCurrency(comparisonData.expenses.b)}
                      variation={comparisonData.expenses.variation}
                      icon="receipt-outline"
                      iconBackground={colors.dangerSoft}
                      iconColor={colors.danger}
                    />

                    <ComparisonCard
                      title="Saldo"
                      valueA={formatCurrency(comparisonData.balance.a)}
                      valueB={formatCurrency(comparisonData.balance.b)}
                      variation={comparisonData.balance.variation}
                      icon="wallet-outline"
                      iconBackground={colors.primarySoft}
                      iconColor={colors.primary}
                    />
                  </>
                )}

                {(metricsFilter === 'all' || metricsFilter === 'operational') && (
                  <>
                    <ComparisonCard
                      title="Orçamentos Aprovados"
                      valueA={String(comparisonData.quotes.a)}
                      valueB={String(comparisonData.quotes.b)}
                      variation={comparisonData.quotes.variation}
                      icon="document-text-outline"
                      iconBackground={colors.infoSoft}
                      iconColor={colors.info}
                    />

                    <ComparisonCard
                      title="Serviços Concluídos"
                      valueA={String(comparisonData.services.a)}
                      valueB={String(comparisonData.services.b)}
                      variation={comparisonData.services.variation}
                      icon="checkmark-done-outline"
                      iconBackground={colors.warningSoft}
                      iconColor={colors.warning}
                    />
                  </>
                )}
              </View>
            )}

            {/* Legenda */}
            <View style={styles.legendSection}>
              <Text style={styles.legendTitle}>Legenda:</Text>
              <View style={styles.legendItem}>
                <Ionicons name="arrow-up" size={16} color={colors.success} accessibilityElementsHidden />
                <Text style={styles.legendText}>Melhoria (variação positiva)</Text>
              </View>
              <View style={styles.legendItem}>
                <Ionicons name="arrow-down" size={16} color={colors.danger} accessibilityElementsHidden />
                <Text style={styles.legendText}>Piora (variação negativa)</Text>
              </View>
              <View style={styles.legendItem}>
                <Ionicons name="remove-outline" size={16} color={colors.textSecondary} accessibilityElementsHidden />
                <Text style={styles.legendText}>Sem variação</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Utilitários ────────────────────────────────────────────────────────────

function getMonthName(month: number): string {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  return months[month];
}

// ─── Estilos ────────────────────────────────────────────────────────────────

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
  filtersSection: {
    marginBottom: spacing['2xl'],
  },
  filterLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterScroll: {
    marginBottom: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
  },
  periodsSection: {
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
  periodSelectors: {
    gap: spacing.md,
  },
  periodSelector: {
    // Container for each period selector
  },
  periodSelectorLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  periodScroll: {
    marginBottom: spacing.xs,
  },
  periodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  periodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  periodChipTextActive: {
    color: colors.textOnPrimary,
  },
  resultsSection: {
    marginBottom: spacing['2xl'],
  },
  comparisonCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  comparisonTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    flex: 1,
  },
  comparisonValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodValue: {
    flex: 1,
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  periodValueText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  variationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  variationText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  legendSection: {
    marginTop: spacing['2xl'],
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  legendTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});