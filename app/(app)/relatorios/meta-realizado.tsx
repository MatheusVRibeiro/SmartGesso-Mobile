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
import { dashboardService } from '../../../src/services/api/dashboard';
import { quotesService } from '../../../src/services/api/quotes';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { QuoteSummary, QuoteItemType } from '../../../src/types/quote';
import { formatCurrency } from '../../../src/utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Filtros ────────────────────────────────────────────────────────────────

type PeriodFilter = 'month' | 'quarter' | 'semester' | 'year';
type CategoryFilter = 'all' | QuoteItemType;

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'Mês atual', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Semestre', value: 'semester' },
  { label: 'Ano', value: 'year' },
];

const CATEGORY_OPTIONS: { label: string; value: CategoryFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Serviços', value: 'SERVICO' },
  { label: 'Produtos', value: 'PRODUTO' },
  { label: 'Materiais', value: 'MATERIAL' },
];

// ─── Tipos de dados ─────────────────────────────────────────────────────────

interface CategoryData {
  category: CategoryFilter;
  label: string;
  meta: number;
  realizado: number;
  percentual: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real retorna array puro em GET /quotes (Prisma
 * findMany), enquanto os tipos declarados são { data, total }. Normaliza ambos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

/**
 * Filtra itens por período
 */
function isInPeriod(dateStr: string, period: PeriodFilter): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'semester':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return date >= startDate;
}

/**
 * Calcula a meta mensal com base na média histórica
 */
function calculateMonthlyGoal(quotes: QuoteSummary[], period: PeriodFilter): number {
  const filteredQuotes = quotes.filter(q => 
    q.status === 'APROVADO' && isInPeriod(q.createdAt, period)
  );
  
  if (filteredQuotes.length === 0) return 0;
  
  const total = filteredQuotes.reduce((sum, q) => sum + q.total, 0);
  
  // Converte para mensal
  switch (period) {
    case 'month':
      return total;
    case 'quarter':
      return total / 3;
    case 'semester':
      return total / 6;
    case 'year':
      return total / 12;
    default:
      return total;
  }
}

// ─── Componentes auxiliares ─────────────────────────────────────────────────

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

// ─── Barra de progresso ─────────────────────────────────────────────────────

interface ProgressBarProps {
  percentual: number;
}

function ProgressBar({ percentual }: ProgressBarProps) {
  const clampedPercentual = Math.min(Math.max(percentual, 0), 100);
  
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill,
            { 
              width: `${clampedPercentual}%`,
              backgroundColor: clampedPercentual >= 100 
                ? colors.success 
                : clampedPercentual >= 80 
                  ? colors.warning 
                  : colors.danger,
            },
          ]} 
        />
      </View>
      <Text style={styles.progressBarText}>{clampedPercentual.toFixed(1)}%</Text>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function MetaRealizadoScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['meta-realizado', companyId],
    queryFn: async () => {
      const [metricsResult, quotesResult] = await Promise.all([
        dashboardService.getMetrics(),
        quotesService.list(),
      ]);
      return {
        metrics: metricsResult,
        quotes: toArray<QuoteSummary>(quotesResult),
      };
    },
    enabled: Boolean(companyId),
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Calcular totais do período
  const periodTotals = useMemo(() => {
    const quotes = data?.quotes ?? [];
    
    const filteredQuotes = quotes.filter(q => 
      isInPeriod(q.createdAt, periodFilter)
    );
    
    const approvedQuotes = filteredQuotes.filter(q => q.status === 'APROVADO');
    
    const totalRealizado = approvedQuotes.reduce((sum, q) => sum + q.total, 0);
    
    // Meta baseada no histórico (simplificado - idealmente viria da API)
    const metaMensal = calculateMonthlyGoal(quotes, 'month');
    
    return {
      realizado: totalRealizado,
      meta: metaMensal,
      percentual: metaMensal > 0 ? (totalRealizado / metaMensal) * 100 : 0,
      diferenca: totalRealizado - metaMensal,
    };
  }, [data, periodFilter]);

  // Calcular dados por categoria
  const categoryData = useMemo((): CategoryData[] => {
    const quotes = data?.quotes ?? [];
    
    const filteredQuotes = quotes.filter(q => 
      isInPeriod(q.createdAt, periodFilter)
    );
    
    const approvedQuotes = filteredQuotes.filter(q => q.status === 'APROVADO');
    
    // Meta por categoria (simplificado - idealmente viria da API)
    const metaPorCategoria = {
      SERVICO: calculateMonthlyGoal(quotes.filter(q => 
        q.items?.some(item => item.itemType === 'SERVICO')
      ), 'month'),
      PRODUTO: calculateMonthlyGoal(quotes.filter(q => 
        q.items?.some(item => item.itemType === 'PRODUTO')
      ), 'month'),
      MATERIAL: calculateMonthlyGoal(quotes.filter(q => 
        q.items?.some(item => item.itemType === 'MATERIAL')
      ), 'month'),
    };
    
    // Realizado por categoria
    const realizadoPorCategoria = {
      SERVICO: 0,
      PRODUTO: 0,
      MATERIAL: 0,
    };
    
    approvedQuotes.forEach(quote => {
      quote.items?.forEach(item => {
        if (item.itemType === 'SERVICO') realizadoPorCategoria.SERVICO += item.total;
        if (item.itemType === 'PRODUTO') realizadoPorCategoria.PRODUTO += item.total;
        if (item.itemType === 'MATERIAL') realizadoPorCategoria.MATERIAL += item.total;
      });
    });
    
    const categories: CategoryData[] = [
      {
        category: 'SERVICO',
        label: 'Serviços',
        meta: metaPorCategoria.SERVICO,
        realizado: realizadoPorCategoria.SERVICO,
        percentual: metaPorCategoria.SERVICO > 0 
          ? (realizadoPorCategoria.SERVICO / metaPorCategoria.SERVICO) * 100 
          : 0,
      },
      {
        category: 'PRODUTO',
        label: 'Produtos',
        meta: metaPorCategoria.PRODUTO,
        realizado: realizadoPorCategoria.PRODUTO,
        percentual: metaPorCategoria.PRODUTO > 0 
          ? (realizadoPorCategoria.PRODUTO / metaPorCategoria.PRODUTO) * 100 
          : 0,
      },
      {
        category: 'MATERIAL',
        label: 'Materiais',
        meta: metaPorCategoria.MATERIAL,
        realizado: realizadoPorCategoria.MATERIAL,
        percentual: metaPorCategoria.MATERIAL > 0 
          ? (realizadoPorCategoria.MATERIAL / metaPorCategoria.MATERIAL) * 100 
          : 0,
      },
    ];
    
    // Filtrar por categoria selecionada
    if (categoryFilter !== 'all') {
      return categories.filter(c => c.category === categoryFilter);
    }
    
    return categories;
  }, [data, periodFilter, categoryFilter]);

  // Verificar se há dados
  const hasData = data?.quotes && data.quotes.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando meta vs realizado..." />
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
      <Stack.Screen options={{ title: 'Meta vs Realizado', headerShown: true }} />

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
          <Text style={styles.title}>Meta vs Realizado</Text>
          <Text style={styles.subtitle}>Comparativo de desempenho</Text>
        </View>

        {!hasData ? (
          <EmptyState
            title="Nenhum orçamento aprovado"
            description="Aprova orçamentos para visualizar o comparativo de metas"
            icon="target-outline"
          />
        ) : (
          <>
            {/* Cards de resumo */}
            <View style={styles.metricsGrid}>
              <SummaryCard
                title="Meta do período"
                value={formatCurrency(periodTotals.meta)}
                subtitle="Objetivo mensal"
                icon="flag-outline"
                iconBackground={colors.primarySoft}
                iconColor={colors.primary}
              />
              
              <SummaryCard
                title="Realizado"
                value={formatCurrency(periodTotals.realizado)}
                subtitle="Vendas aprovadas"
                icon="checkmark-circle-outline"
                iconBackground={colors.successSoft}
                iconColor={colors.success}
                valueColor={periodTotals.realizado >= periodTotals.meta ? colors.success : colors.warning}
              />
              
              <SummaryCard
                title="Diferença"
                value={formatCurrency(periodTotals.diferenca)}
                subtitle={periodTotals.diferenca >= 0 ? 'Acima da meta' : 'Abaixo da meta'}
                icon={periodTotals.diferenca >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
                iconBackground={periodTotals.diferenca >= 0 ? colors.successSoft : colors.dangerSoft}
                iconColor={periodTotals.diferenca >= 0 ? colors.success : colors.danger}
                valueColor={periodTotals.diferenca >= 0 ? colors.success : colors.danger}
              />
              
              <SummaryCard
                title="% Atingimento"
                value={`${periodTotals.percentual.toFixed(1)}%`}
                subtitle={periodTotals.percentual >= 100 ? 'Meta atingida' : 'Meta não atingida'}
                icon="speedometer-outline"
                iconBackground={colors.infoSoft}
                iconColor={colors.info}
                valueColor={periodTotals.percentual >= 100 
                  ? colors.success 
                  : periodTotals.percentual >= 80 
                    ? colors.warning 
                    : colors.danger}
              />
            </View>

            {/* Barra de progresso geral */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progresso Geral</Text>
              <Text style={styles.sectionSubtitle}>Percentual de atingimento da meta</Text>
              
              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                <ProgressBar percentual={periodTotals.percentual} />
              </AppCard>
            </View>

            {/* Filtros */}
            <View style={styles.filtersSection}>
              <Text style={styles.filterLabel}>Período:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {PERIOD_OPTIONS.map((option) => (
                  <View
                    key={option.value}
                    style={[
                      styles.filterChip,
                      periodFilter === option.value && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        periodFilter === option.value && styles.filterChipTextActive,
                      ]}
                      onPress={() => setPeriodFilter(option.value)}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              
              <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>Categoria:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {CATEGORY_OPTIONS.map((option) => (
                  <View
                    key={option.value}
                    style={[
                      styles.filterChip,
                      categoryFilter === option.value && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        categoryFilter === option.value && styles.filterChipTextActive,
                      ]}
                      onPress={() => setCategoryFilter(option.value)}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Detalhamento por categoria */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Por Categoria</Text>
              <Text style={styles.sectionSubtitle}>Detalhamento de metas por tipo de item</Text>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {categoryData.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum dado para a categoria selecionada</Text>
                ) : (
                  categoryData.map((category, index, array) => (
                    <View
                      key={category.category}
                      style={[
                        styles.listItem,
                        index < array.length - 1 && styles.listItemBorder,
                      ]}
                    >
                      <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle}>{category.label}</Text>
                        <View style={styles.categoryDetails}>
                          <View style={styles.categoryDetail}>
                            <Text style={styles.categoryDetailLabel}>Meta:</Text>
                            <Text style={styles.categoryDetailValue}>{formatCurrency(category.meta)}</Text>
                          </View>
                          <View style={styles.categoryDetail}>
                            <Text style={styles.categoryDetailLabel}>Realizado:</Text>
                            <Text style={styles.categoryDetailValue}>{formatCurrency(category.realizado)}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.categoryPercentual}>
                        <Text style={[
                          styles.categoryPercentualValue,
                          category.percentual >= 100 && styles.positiveBalance,
                          category.percentual >= 80 && category.percentual < 100 && styles.neutralBalance,
                          category.percentual < 80 && styles.negativeBalance,
                        ]}>
                          {category.percentual.toFixed(1)}%
                        </Text>
                        <ProgressBar percentual={category.percentual} />
                      </View>
                    </View>
                  ))
                )}
              </AppCard>
            </View>

            {/* Resumo final */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo</Text>
              <Text style={styles.sectionSubtitle}>Totais no período selecionado</Text>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Meta:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(periodTotals.meta)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Realizado:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(periodTotals.realizado)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                  <Text style={styles.summaryLabel}>Diferença:</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      periodTotals.diferenca >= 0 ? styles.positiveBalance : styles.negativeBalance,
                    ]}
                  >
                    {formatCurrency(periodTotals.diferenca)}
                  </Text>
                </View>
              </AppCard>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionCard: {
    padding: spacing.md,
  },
  listItem: {
    paddingVertical: spacing.md,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemContent: {
    marginBottom: spacing.sm,
  },
  listItemTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  categoryDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  categoryDetail: {
    flexDirection: 'row',
  },
  categoryDetailLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  categoryDetailValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.text,
  },
  categoryPercentual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryPercentualValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.bold,
    minWidth: 60,
    textAlign: 'right',
  },
  positiveBalance: {
    color: colors.success,
  },
  neutralBalance: {
    color: colors.warning,
  },
  negativeBalance: {
    color: colors.danger,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  filtersSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  filterScroll: {
    marginBottom: spacing.sm,
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
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryRowTotal: {
    borderBottomWidth: 0,
    paddingTop: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.bold,
    color: colors.text,
  },
});
