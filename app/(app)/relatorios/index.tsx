import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { expensesService } from '../../../src/services/api/expenses';
import { inventoryService } from '../../../src/services/api/inventory';
import { paymentsService } from '../../../src/services/api/payments';
import { quotesService } from '../../../src/services/api/quotes';
import { serviceOrdersService } from '../../../src/services/api/serviceOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { usePendingMutationsCount } from '../../../src/hooks/usePendingMutationsCount';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { Expense, Payment, PaymentStatus } from '../../../src/types/finance';
import type { QuoteSummary, QuoteStatus } from '../../../src/types/quote';
import type { ServiceOrder, ServiceOrderStatus } from '../../../src/types/serviceOrder';
import type { MaterialItem } from '../../../src/types/catalog';
import { formatCurrency } from '../../../src/utils/format';
import AppButton from '../../../src/components/ui/AppButton';

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

const QUOTE_STATUS_BADGE: Record<
  QuoteStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  RASCUNHO: { variant: 'info', label: 'Rascunho' },
  PRONTO_PARA_ENVIAR: { variant: 'info', label: 'Pronto p/ enviar' },
  ENVIADO: { variant: 'warning', label: 'Enviado' },
  AGUARDANDO_APROVACAO: { variant: 'warning', label: 'Aguardando' },
  APROVADO: { variant: 'active', label: 'Aprovado' },
  REJEITADO: { variant: 'cancelled', label: 'Rejeitado' },
  VENCIDO: { variant: 'expired', label: 'Vencido' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

const SERVICE_ORDER_STATUS_BADGE: Record<
  ServiceOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'warning', label: 'Pendente' },
  EM_DESLOCAMENTO: { variant: 'info', label: 'Deslocamento' },
  EM_ANDAMENTO: { variant: 'active', label: 'Em andamento' },
  PAUSADA: { variant: 'suspended', label: 'Pausada' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
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
  const router = useRouter();
  const pendingCount = usePendingMutationsCount();

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
      // Busca pagamentos, despesas, orçamentos, ordens de serviço e estoque em paralelo.
      const [paymentsResult, expensesResult, quotesResult, serviceOrdersResult, inventoryMaterialsResult] = await Promise.all([
        paymentsService.list(),
        expensesService.list(),
        quotesService.list(),
        serviceOrdersService.list(),
        inventoryService.listMaterials(),
      ]);
      return {
        payments: toArray<Payment>(paymentsResult),
        expenses: toArray<Expense>(expensesResult),
        quotes: toArray<QuoteSummary>(quotesResult),
        serviceOrders: toArray<ServiceOrder>(serviceOrdersResult.data),
        inventoryMaterials: toArray<MaterialItem>(inventoryMaterialsResult),
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
  const quotes = data?.quotes ?? [];
  const serviceOrders = data?.serviceOrders ?? [];
  const inventoryMaterials = data?.inventoryMaterials ?? [];

  // Processamento de pagamentos e despesas (existente)
  const pendingPayments = payments.filter((p) => p.status === 'PENDENTE');
  const confirmedPayments = payments.filter((p) => p.status === 'CONFIRMADO');

  const toReceive = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const received = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = received - totalExpenses;

  // Processamento de orçamentos (V3 §64)
  const approvedQuotes = quotes.filter((q) => q.status === 'APROVADO');
  const pendingQuotes = quotes.filter((q) => 
    q.status === 'ENVIADO' || q.status === 'AGUARDANDO_APROVACAO'
  );
  const rejectedQuotes = quotes.filter((q) => q.status === 'REJEITADO');
  const expiredQuotes = quotes.filter((q) => q.status === 'VENCIDO');

  // Processamento de ordens de serviço (V3 §64)
  const inProgressServiceOrders = serviceOrders.filter((so) => 
    so.status === 'EM_ANDAMENTO' || so.status === 'EM_DESLOCAMENTO'
  );
  const completedServiceOrders = serviceOrders.filter((so) => so.status === 'CONCLUIDA');

  // Processamento de estoque (V3 §64) - itens com estoque baixo
  const lowStockMaterials = inventoryMaterials.filter((m) => 
    m.minStockQty && m.stockQty != null && m.stockQty < m.minStockQty
  );

  // Últimos 5 registros por data de criação.
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentServiceOrders = [...serviceOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const hasData = payments.length > 0 || expenses.length > 0 || quotes.length > 0 || serviceOrders.length > 0 || inventoryMaterials.length > 0;

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
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>
                {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
              </Text>
            </View>
          )}
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

            {/* Orçamentos (V3 §64) */}
            {quotes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Orçamentos</Text>
              <Text style={styles.sectionSubtitle}>Resumo de orçamentos</Text>

              {/* Cards de resumo de orçamentos */}
              <View style={styles.metricsGrid}>
                <SummaryCard
                  title="Total"
                  value={String(quotes.length)}
                  subtitle="Orçamentos registrados"
                  icon="document-text-outline"
                  iconBackground={colors.infoSoft}
                  iconColor={colors.info}
                />
                <SummaryCard
                  title="Aprovados"
                  value={String(approvedQuotes.length)}
                  subtitle="Orçamentos aprovados"
                  icon="checkmark-circle-outline"
                  iconBackground={colors.successSoft}
                  iconColor={colors.success}
                  valueColor={colors.success}
                />
                <SummaryCard
                  title="Pendentes"
                  value={String(pendingQuotes.length)}
                  subtitle="Aguardando aprovação"
                  icon="time-outline"
                  iconBackground={colors.warningSoft}
                  iconColor={colors.warning}
                  valueColor={colors.warning}
                />
                <SummaryCard
                  title="Rejeitados"
                  value={String(rejectedQuotes.length)}
                  subtitle="Orçamentos rejeitados"
                  icon="close-circle-outline"
                  iconBackground={colors.dangerSoft}
                  iconColor={colors.danger}
                  valueColor={colors.danger}
                />
              </View>

              {/* Últimos orçamentos */}
              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {recentQuotes.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum orçamento registrado</Text>
                ) : (
                  recentQuotes.map((quote, index, array) => {
                    const badge = QUOTE_STATUS_BADGE[quote.status];
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
                            {`#${quote.quoteNumber} - ${quote.client?.name ?? 'Cliente'}`}
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
            )}

            {/* Ordens de Serviço (V3 §64) */}
            {serviceOrders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Serviços</Text>
              <Text style={styles.sectionSubtitle}>Resumo de ordens de serviço</Text>

              {/* Cards de resumo de serviços */}
              <View style={styles.metricsGrid}>
                <SummaryCard
                  title="Total"
                  value={String(serviceOrders.length)}
                  subtitle="Ordens de serviço"
                  icon="hammer-outline"
                  iconBackground={colors.infoSoft}
                  iconColor={colors.info}
                />
                <SummaryCard
                  title="Em andamento"
                  value={String(inProgressServiceOrders.length)}
                  subtitle="Serviços ativos"
                  icon="play-circle-outline"
                  iconBackground={colors.warningSoft}
                  iconColor={colors.warning}
                  valueColor={colors.warning}
                />
                <SummaryCard
                  title="Concluídos"
                  value={String(completedServiceOrders.length)}
                  subtitle="Serviços finalizados"
                  icon="checkmark-done-outline"
                  iconBackground={colors.successSoft}
                  iconColor={colors.success}
                  valueColor={colors.success}
                />
              </View>

              {/* Últimos serviços */}
              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {recentServiceOrders.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma ordem de serviço registrada</Text>
                ) : (
                  recentServiceOrders.map((serviceOrder, index, array) => {
                    const badge = SERVICE_ORDER_STATUS_BADGE[serviceOrder.status];
                    return (
                      <View
                        key={serviceOrder.id}
                        style={[
                          styles.listItem,
                          index < array.length - 1 && styles.listItemBorder,
                        ]}
                      >
                        <View style={styles.listItemContent}>
                          <Text style={styles.listItemTitle} numberOfLines={1}>
                            {`OS #${serviceOrder.code} - ${serviceOrder.client?.name ?? 'Cliente'}`}
                          </Text>
                          <Text style={styles.listItemValue}>
                            {serviceOrder.saleValue ? formatCurrency(serviceOrder.saleValue) : 'Sem valor'}
                          </Text>
                        </View>
                        <StatusBadge status={badge.variant} label={badge.label} size="sm" />
                      </View>
                    );
                  })
                )}
              </AppCard>
            </View>
            )}

            {/* Estoque (V3 §64) */}
            {inventoryMaterials.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estoque</Text>
              <Text style={styles.sectionSubtitle}>Materiais com estoque baixo</Text>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {lowStockMaterials.length === 0 ? (
                  <Text style={styles.emptyText}>Todos os materiais com estoque adequado</Text>
                ) : (
                  lowStockMaterials.slice(0, 5).map((material, index, array) => (
                    <View
                      key={material.id}
                      style={[
                        styles.listItem,
                        index < array.length - 1 && styles.listItemBorder,
                      ]}
                    >
                      <View style={styles.listItemContent}>
                        <Text style={styles.listItemTitle} numberOfLines={1}>
                          {material.name}
                        </Text>
                        <Text style={styles.listItemValue}>
                          {`Estoque: ${material.stockQty ?? 0} | Mínimo: ${material.minStockQty ?? 0}`}
                        </Text>
                      </View>
                      <StatusBadge status="warning" label="Estoque baixo" size="sm" />
                    </View>
                  ))
                )}
              </AppCard>
            </View>
            )}

            {/* Botão de navegação para Fluxo de Caixa */}
            <View style={styles.buttonContainer}>
              <AppButton
                title="Ver Fluxo de Caixa"
                variant="primary"
                onPress={() => router.push('/(app)/relatorios/fluxo-caixa')}
                style={styles.button}
              />
            </View>

            {/* Botão de navegação para Comparativo */}
            <View style={styles.buttonContainer}>
              <AppButton
                title="Ver Comparativo entre Períodos"
                variant="secondary"
                onPress={() => router.push('/(app)/relatorios/comparativo')}
                style={styles.button}
              />
            </View>

            {/* Botão de navegação para Meta vs Realizado */}
            <View style={styles.buttonContainer}>
              <AppButton
                title="Ver Meta vs Realizado"
                variant="secondary"
                onPress={() => router.push('/(app)/relatorios/meta-realizado')}
                style={styles.button}
              />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  pendingBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  pendingBadgeText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
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
  buttonContainer: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
});
