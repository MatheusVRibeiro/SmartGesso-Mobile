import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { expensesService } from '@/src/services/api/expenses';
import { paymentsService } from '@/src/services/api/payments';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { Expense, Payment, PaymentStatus } from '@/src/types/finance';
import { formatCurrency } from '@/src/utils/format';
import { createRelatorioFluxoCaixaStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

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

// ─── Filtros ────────────────────────────────────────────────────────────────

type PeriodFilter = '1m' | '3m' | '6m' | '1y';
type TypeFilter = 'all' | 'payments' | 'expenses';

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'Último mês', value: '1m' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: '1 ano', value: '1y' },
];

const TYPE_OPTIONS: { label: string; value: TypeFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Recebimentos', value: 'payments' },
  { label: 'Despesas', value: 'expenses' },
];

// ─── Tipos de dados ─────────────────────────────────────────────────────────

interface PeriodData {
  period: string; // Ex: "Jan/2024"
  income: number;
  expense: number;
  balance: number;
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
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createRelatorioFluxoCaixaStyles(colors, isDark), [colors, isDark]);
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

export default function FluxoCaixaScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createRelatorioFluxoCaixaStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('1m');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['fluxo-caixa', companyId],
    queryFn: async () => {
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

  // Filtrar dados por período
  const filteredData = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch (periodFilter) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const payments = (data?.payments ?? []).filter(
      (p) => new Date(p.paymentDate) >= startDate
    );
    
    const expenses = (data?.expenses ?? []).filter(
      (e) => new Date(e.expenseDate) >= startDate
    );

    return { payments, expenses };
  }, [data, periodFilter]);

  // Calcular totais
  const totals = useMemo(() => {
    const { payments, expenses } = filteredData;
    
    const pendingPayments = payments.filter((p) => p.status === 'PENDENTE');
    const confirmedPayments = payments.filter((p) => p.status === 'CONFIRMADO');
    
    const pendingExpenses = expenses.filter((e) => {
      // Despesas sem data de pagamento são consideradas pendentes
      return !e.expenseDate || new Date(e.expenseDate) > new Date();
    });
    
    const paidExpenses = expenses.filter((e) => {
      return e.expenseDate && new Date(e.expenseDate) <= new Date();
    });

    const toReceive = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const received = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPendingExpenses = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaidExpenses = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const balance = received - totalPaidExpenses;

    return {
      balance,
      toReceive,
      totalPendingExpenses,
      received,
      totalPaidExpenses,
    };
  }, [filteredData]);

  // Agregar dados por período (mês)
  const periodData = useMemo(() => {
    const { payments, expenses } = filteredData;
    const periodMap = new Map<string, PeriodData>();

    // Processar pagamentos
    if (typeFilter !== 'expenses') {
      payments.forEach((payment) => {
        const date = new Date(payment.paymentDate);
        const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const periodLabel = `${getMonthName(date.getMonth())}/${date.getFullYear()}`;
        
        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, {
            period: periodLabel,
            income: 0,
            expense: 0,
            balance: 0,
          });
        }
        
        const period = periodMap.get(periodKey)!;
        if (payment.status === 'CONFIRMADO') {
          period.income += payment.amount;
        } else if (payment.status === 'PENDENTE') {
          // Pagamentos pendentes são contabilizados como entrada futura
          period.income += payment.amount;
        }
      });
    }

    // Processar despesas
    if (typeFilter !== 'payments') {
      expenses.forEach((expense) => {
        const date = new Date(expense.expenseDate);
        const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const periodLabel = `${getMonthName(date.getMonth())}/${date.getFullYear()}`;
        
        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, {
            period: periodLabel,
            income: 0,
            expense: 0,
            balance: 0,
          });
        }
        
        const period = periodMap.get(periodKey)!;
        period.expense += expense.amount;
      });
    }

    // Calcular saldo de cada período
    const periods = Array.from(periodMap.values());
    periods.forEach((period) => {
      period.balance = period.income - period.expense;
    });

    // Ordenar por período (mais recente primeiro)
    periods.sort((a, b) => {
      const [aMonth, aYear] = a.period.split('/');
      const [bMonth, bYear] = b.period.split('/');
      const aDate = new Date(`${aYear}-${getMonthNumber(aMonth)}-01`);
      const bDate = new Date(`${bYear}-${getMonthNumber(bMonth)}-01`);
      return bDate.getTime() - aDate.getTime();
    });

    return periods;
  }, [filteredData, typeFilter]);

  // Verificar se há dados
  const hasData = filteredData.payments.length > 0 || filteredData.expenses.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando fluxo de caixa..." />
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
      <Stack.Screen options={{ title: 'Fluxo de Caixa', headerShown: true }} />

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
          <Text style={styles.title}>Fluxo de Caixa</Text>
          <Text style={styles.subtitle}>Acompanhamento financeiro detalhado</Text>
        </View>

        {!hasData ? (
          <EmptyState
            title="Nenhum dado financeiro"
            description="Registre pagamentos e despesas para visualizar o fluxo de caixa"
            icon="cash-outline"
          />
        ) : (
          <>
            {/* Cards de resumo */}
            <View style={styles.metricsGrid}>
              <SummaryCard
                title="Saldo Atual"
                value={formatCurrency(totals.balance)}
                subtitle="Recebimentos menos despesas"
                icon="wallet-outline"
                iconBackground={colors.primarySoft}
                iconColor={colors.primary}
                valueColor={totals.balance >= 0 ? colors.success : colors.danger}
              />
              
              <SummaryCard
                title="A Receber"
                value={formatCurrency(totals.toReceive)}
                subtitle="Pagamentos pendentes"
                icon="cash-outline"
                iconBackground={colors.warningSoft}
                iconColor={colors.warning}
                valueColor={colors.warning}
              />
              
              <SummaryCard
                title="A Pagar"
                value={formatCurrency(totals.totalPendingExpenses)}
                subtitle="Despesas pendentes"
                icon="receipt-outline"
                iconBackground={colors.dangerSoft}
                iconColor={colors.danger}
                valueColor={colors.danger}
              />
              
              <SummaryCard
                title="Recebido"
                value={formatCurrency(totals.received)}
                subtitle="Pagamentos confirmados"
                icon="checkmark-circle-outline"
                iconBackground={colors.successSoft}
                iconColor={colors.success}
                valueColor={colors.success}
              />
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
              
              <Text style={[styles.filterLabel, { marginTop: spacing.md }]}>Tipo:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {TYPE_OPTIONS.map((option) => (
                  <View
                    key={option.value}
                    style={[
                      styles.filterChip,
                      typeFilter === option.value && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        typeFilter === option.value && styles.filterChipTextActive,
                      ]}
                      onPress={() => setTypeFilter(option.value)}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Lista temporal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fluxo por Período</Text>
              <Text style={styles.sectionSubtitle}>Entradas, saídas e saldo mensal</Text>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {periodData.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum dado para o período selecionado</Text>
                ) : (
                  periodData.map((period, index, array) => (
                    <View
                      key={period.period}
                      style={[
                        styles.listItem,
                        index < array.length - 1 && styles.listItemBorder,
                      ]}
                    >
                      <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle}>{period.period}</Text>
                        <View style={styles.periodDetails}>
                          <View style={styles.periodDetail}>
                            <Text style={styles.periodDetailLabel}>Entradas:</Text>
                            <Text style={styles.periodDetailValue}>{formatCurrency(period.income)}</Text>
                          </View>
                          <View style={styles.periodDetail}>
                            <Text style={styles.periodDetailLabel}>Saídas:</Text>
                            <Text style={styles.periodDetailValue}>{formatCurrency(period.expense)}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.periodBalance}>
                        <Text style={styles.periodBalanceLabel}>Saldo:</Text>
                        <Text
                          style={[
                            styles.periodBalanceValue,
                            period.balance >= 0 ? styles.positiveBalance : styles.negativeBalance,
                          ]}
                        >
                          {formatCurrency(period.balance)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </AppCard>
            </View>

            {/* Resumo por tipo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo</Text>
              <Text style={styles.sectionSubtitle}>Totais no período selecionado</Text>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Recebimentos:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(totals.received)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Despesas:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(totals.totalPaidExpenses)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                  <Text style={styles.summaryLabel}>Saldo do Período:</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      totals.balance >= 0 ? styles.positiveBalance : styles.negativeBalance,
                    ]}
                  >
                    {formatCurrency(totals.balance)}
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

// ─── Utilitários ────────────────────────────────────────────────────────────

function getMonthName(month: number): string {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  return months[month];
}

function getMonthNumber(monthName: string): string {
  const months: Record<string, string> = {
    'Jan': '01', 'Fev': '02', 'Mar': '03', 'Abr': '04', 'Mai': '05', 'Jun': '06',
    'Jul': '07', 'Ago': '08', 'Set': '09', 'Out': '10', 'Nov': '11', 'Dez': '12',
  };
  return months[monthName] || '01';
}

// ─── Estilos ────────────────────────────────────────────────────────────────
