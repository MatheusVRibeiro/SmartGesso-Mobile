import { BackButton } from '@/src/components/navigation/BackButton';
import React, { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { expensesService } from '@/src/services/api/expenses';
import { inventoryService } from '@/src/services/api/inventory';
import { paymentsService } from '@/src/services/api/payments';
import { quotesService } from '@/src/services/api/quotes';
import { serviceOrdersService } from '@/src/services/api/serviceOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { usePendingMutationsCount } from '@/src/hooks/usePendingMutationsCount';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type { Expense, Payment, PaymentStatus } from '@/src/types/finance';
import type { QuoteSummary, QuoteStatus } from '@/src/types/quote';
import type { ServiceOrder, ServiceOrderStatus } from '@/src/types/serviceOrder';
import type { MaterialItem } from '@/src/types/catalog';
import { formatCurrency } from '@/src/utils/format';
import { AppButton } from '@/src/components/ui/AppButton';
import { toArray } from '@/src/utils/toArray';
import { createRelatoriosStyles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

const PAYMENT_STATUS_BADGE: Record<
  PaymentStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'warning', label: 'Pendente' },
  CONFIRMADO: { variant: 'active', label: 'Confirmado' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

const QUOTE_STATUS_BADGE: Record<
  QuoteStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  RASCUNHO: { variant: 'expired', label: 'Rascunho' },
  PRONTO_PARA_ENVIAR: { variant: 'warning', label: 'Pronto' },
  ENVIADO: { variant: 'warning', label: 'Enviado' },
  AGUARDANDO_APROVACAO: { variant: 'warning', label: 'Pendente' },
  APROVADO: { variant: 'active', label: 'Aprovado' },
  REJEITADO: { variant: 'cancelled', label: 'Rejeitado' },
  VENCIDO: { variant: 'expired', label: 'Vencido' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

const SERVICE_ORDER_STATUS_BADGE: Record<
  ServiceOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_DESLOCAMENTO: { variant: 'warning', label: 'Em deslocamento' },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento' },
  PAUSADA: { variant: 'suspended', label: 'Pausada' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  valueColor?: string;
  styles: ReturnType<typeof createRelatoriosStyles>;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  valueColor,
  styles,
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
        style={[styles.metricValue, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </AppCard>
  );
}

export default function RelatoriosIndexScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createRelatoriosStyles(colors, isDark), [colors, isDark]);

  const {
    data: payments,
    isLoading: isLoadingPayments,
    isError: isErrorPayments,
    error: errorPayments,
    refetch: refetchPayments,
    isRefetching: isRefetchingPayments,
  } = useQuery({
    queryKey: ['company', companyId, 'payments'],
    queryFn: () => paymentsService.list(),
    select: (result) => toArray<Payment>(result),
    enabled: Boolean(companyId),
  });

  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
    error: errorExpenses,
    refetch: refetchExpenses,
    isRefetching: isRefetchingExpenses,
  } = useQuery({
    queryKey: ['company', companyId, 'expenses'],
    queryFn: () => expensesService.list(),
    select: (result) => toArray<Expense>(result),
    enabled: Boolean(companyId),
  });

  const {
    data: quotes,
    isLoading: isLoadingQuotes,
    isError: isErrorQuotes,
    error: errorQuotes,
    refetch: refetchQuotes,
    isRefetching: isRefetchingQuotes,
  } = useQuery({
    queryKey: ['company', companyId, 'quotes'],
    queryFn: () => quotesService.list(),
    select: (result) => toArray<QuoteSummary>(result),
    enabled: Boolean(companyId),
  });

  const {
    data: serviceOrdersData,
    isLoading: isLoadingServiceOrders,
    isError: isErrorServiceOrders,
    error: errorServiceOrders,
    refetch: refetchServiceOrders,
    isRefetching: isRefetchingServiceOrders,
  } = useQuery({
    queryKey: ['company', companyId, 'service-orders'],
    queryFn: () => serviceOrdersService.list(),
    select: (result) => toArray<ServiceOrder>(result),
    enabled: Boolean(companyId),
  });

  const {
    data: inventoryData,
    isLoading: isLoadingInventory,
    isError: isErrorInventory,
    error: errorInventory,
    refetch: refetchInventory,
    isRefetching: isRefetchingInventory,
  } = useQuery({
    queryKey: ['company', companyId, 'inventory-materials'],
    queryFn: () => inventoryService.listMaterials(),
    select: (result) => toArray<MaterialItem>(result),
    enabled: Boolean(companyId),
  });

  const pendingCount = usePendingMutationsCount();

  const isLoading =
    isLoadingPayments ||
    isLoadingExpenses ||
    isLoadingQuotes ||
    isLoadingServiceOrders ||
    isLoadingInventory;
  const isError =
    isErrorPayments ||
    isErrorExpenses ||
    isErrorQuotes ||
    isErrorServiceOrders ||
    isErrorInventory;
  const error =
    errorPayments ||
    errorExpenses ||
    errorQuotes ||
    errorServiceOrders ||
    errorInventory;
  const isRefetching =
    isRefetchingPayments ||
    isRefetchingExpenses ||
    isRefetchingQuotes ||
    isRefetchingServiceOrders ||
    isRefetchingInventory;

  const handleRefresh = useCallback(() => {
    refetchPayments();
    refetchExpenses();
    refetchQuotes();
    refetchServiceOrders();
    refetchInventory();
  }, [
    refetchPayments,
    refetchExpenses,
    refetchQuotes,
    refetchServiceOrders,
    refetchInventory,
  ]);

  const {
    totalReceived,
    totalToReceive,
    totalExpenses,
    netBalance,
    recentPayments,
  } = useMemo(() => {
    const paymentList = payments ?? [];
    const expenseList = expenses ?? [];

    let received = 0;
    let toReceive = 0;

    for (const payment of paymentList) {
      if (payment.status === 'CONFIRMADO') {
        received += payment.amount;
      } else if (payment.status === 'PENDENTE') {
        toReceive += payment.amount;
      }
    }

    let exp = 0;
    for (const expense of expenseList) {
      exp += expense.amount;
    }

    const net = received - exp;

    const recent = [...paymentList]
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      )
      .slice(0, 5);

    return {
      totalReceived: received,
      totalToReceive: toReceive,
      totalExpenses: exp,
      netBalance: net,
      recentPayments: recent,
    };
  }, [payments, expenses]);

  const {
    approvedQuotes,
    pendingQuotes,
    REJEITADOQuotes,
    recentQuotes,
  } = useMemo(() => {
    const quoteList = quotes ?? [];

    const approved = quoteList.filter((q) => q.status === 'APROVADO');
    const pending = quoteList.filter((q) => q.status === 'AGUARDANDO_APROVACAO');
    const REJEITADO = quoteList.filter((q) => q.status === 'REJEITADO');

    const recent = [...quoteList]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return {
      approvedQuotes: approved,
      pendingQuotes: pending,
      REJEITADOQuotes: REJEITADO,
      recentQuotes: recent,
    };
  }, [quotes]);

  const {
    serviceOrders,
    inProgressServiceOrders,
    completedServiceOrders,
    recentServiceOrders,
  } = useMemo(() => {
    const list = serviceOrdersData ?? [];
    const inProgress = list.filter((so) => so.status === 'EM_ANDAMENTO');
    const completed = list.filter((so) => so.status === 'CONCLUIDA');
    const recent = [...list]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return {
      serviceOrders: list,
      inProgressServiceOrders: inProgress,
      completedServiceOrders: completed,
      recentServiceOrders: recent,
    };
  }, [serviceOrdersData]);

  const { inventoryMaterials, lowStockMaterials } = useMemo(() => {
    const materials = inventoryData ?? [];
    const lowStock = materials.filter(
      (m) => (m.stockQty ?? 0) <= (m.minStockQty ?? 0),
    );
    return {
      inventoryMaterials: materials,
      lowStockMaterials: lowStock,
    };
  }, [inventoryData]);

  const hasData =
    (payments && payments.length > 0) ||
    (expenses && expenses.length > 0) ||
    (quotes && quotes.length > 0) ||
    serviceOrders.length > 0 ||
    inventoryMaterials.length > 0;

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatórios</Text>
            <Text style={styles.subtitle}>Visão consolidada da operação</Text>
          </View>
          {pendingCount > 0 ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>
                {pendingCount} {pendingCount === 1 ? 'pendência' : 'pendências'}
              </Text>
            </View>
          ) : null}
        </View>

        {isLoading ? (
          <LoadingState text="Carregando dados consolidados..." />
        ) : isError ? (
          <ErrorState message={toApiError(error).message} onRetry={handleRefresh} />
        ) : !hasData ? (
          <EmptyState
            title="Nenhum dado registrado"
            description="Cadastre pagamentos, despesas ou orçamentos para visualizar relatórios consolidados"
            icon="analytics-outline"
          />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financeiro</Text>
              <Text style={styles.sectionSubtitle}>
                Fluxo de caixa e saldos consolidados
              </Text>

              <View style={styles.metricsGrid}>
                <SummaryCard
                  title="Recebido"
                  value={formatCurrency(totalReceived)}
                  subtitle="Total confirmado"
                  icon="cash-outline"
                  iconBackground={colors.successSoft}
                  iconColor={colors.success}
                  valueColor={colors.success}
                  styles={styles}
                />
                <SummaryCard
                  title="A receber"
                  value={formatCurrency(totalToReceive)}
                  subtitle="Total pendente"
                  icon="time-outline"
                  iconBackground={colors.warningSoft}
                  iconColor={colors.warning}
                  valueColor={colors.warning}
                  styles={styles}
                />
                <SummaryCard
                  title="Despesas"
                  value={formatCurrency(totalExpenses)}
                  subtitle="Total registrado"
                  icon="receipt-outline"
                  iconBackground={colors.dangerSoft}
                  iconColor={colors.danger}
                  valueColor={colors.danger}
                  styles={styles}
                />
                <SummaryCard
                  title="Saldo líquido"
                  value={formatCurrency(netBalance)}
                  subtitle="Recebido menos despesas"
                  icon="wallet-outline"
                  iconBackground={netBalance >= 0 ? colors.successSoft : colors.dangerSoft}
                  iconColor={netBalance >= 0 ? colors.success : colors.danger}
                  valueColor={netBalance >= 0 ? colors.success : colors.danger}
                  styles={styles}
                />
              </View>

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
                            {payment.client?.name ?? 'Cliente não informado'}
                          </Text>
                          <Text style={styles.listItemValue}>
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

            {quotes && quotes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Orçamentos</Text>
                <Text style={styles.sectionSubtitle}>
                  Conversão e status de propostas
                </Text>

                <View style={styles.metricsGrid}>
                  <SummaryCard
                    title="Total"
                    value={String(quotes.length)}
                    subtitle="Propostas emitidas"
                    icon="document-text-outline"
                    iconBackground={colors.infoSoft}
                    iconColor={colors.info}
                    styles={styles}
                  />
                  <SummaryCard
                    title="Aprovados"
                    value={String(approvedQuotes.length)}
                    subtitle="Orçamentos fechados"
                    icon="checkmark-circle-outline"
                    iconBackground={colors.successSoft}
                    iconColor={colors.success}
                    valueColor={colors.success}
                    styles={styles}
                  />
                  <SummaryCard
                    title="Pendentes"
                    value={String(pendingQuotes.length)}
                    subtitle="Aguardando aprovação"
                    icon="time-outline"
                    iconBackground={colors.warningSoft}
                    iconColor={colors.warning}
                    valueColor={colors.warning}
                    styles={styles}
                  />
                  <SummaryCard
                    title="Rejeitados"
                    value={String(REJEITADOQuotes.length)}
                    subtitle="Orçamentos rejeitados"
                    icon="close-circle-outline"
                    iconBackground={colors.dangerSoft}
                    iconColor={colors.danger}
                    valueColor={colors.danger}
                    styles={styles}
                  />
                </View>

                <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                  {recentQuotes.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum orçamento registrado</Text>
                  ) : (
                    recentQuotes.map((quote, index, array) => {
                      const badge = QUOTE_STATUS_BADGE[quote.status] || { variant: 'expired', label: 'Rascunho' };
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

            {serviceOrders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Serviços</Text>
                <Text style={styles.sectionSubtitle}>Resumo de ordens de serviço</Text>

                <View style={styles.metricsGrid}>
                  <SummaryCard
                    title="Total"
                    value={String(serviceOrders.length)}
                    subtitle="Ordens de serviço"
                    icon="hammer-outline"
                    iconBackground={colors.infoSoft}
                    iconColor={colors.info}
                    styles={styles}
                  />
                  <SummaryCard
                    title="Em andamento"
                    value={String(inProgressServiceOrders.length)}
                    subtitle="Serviços ativos"
                    icon="play-circle-outline"
                    iconBackground={colors.warningSoft}
                    iconColor={colors.warning}
                    valueColor={colors.warning}
                    styles={styles}
                  />
                  <SummaryCard
                    title="Concluídos"
                    value={String(completedServiceOrders.length)}
                    subtitle="Serviços finalizados"
                    icon="checkmark-done-outline"
                    iconBackground={colors.successSoft}
                    iconColor={colors.success}
                    valueColor={colors.success}
                    styles={styles}
                  />
                </View>

                <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                  {recentServiceOrders.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhuma ordem de serviço registrada</Text>
                  ) : (
                    recentServiceOrders.map((serviceOrder, index, array) => {
                      const badge = SERVICE_ORDER_STATUS_BADGE[serviceOrder.status] || { variant: 'expired', label: 'Agendado' };
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

            <View style={styles.buttonContainer}>
              <AppButton
                title="Ver Fluxo de Caixa"
                variant="primary"
                onPress={() => router.push('/(app)/relatorios/fluxo-caixa')}
                style={styles.button}
              />
            </View>

            <View style={styles.buttonContainer}>
              <AppButton
                title="Ver Comparativo entre Períodos"
                variant="secondary"
                onPress={() => router.push('/(app)/relatorios/comparativo')}
                style={styles.button}
              />
            </View>

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
    </ScreenContainer>
  );
}
