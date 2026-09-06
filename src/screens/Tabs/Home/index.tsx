import React, { useCallback, useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  QuickDocumentIcon,
  QuickWrenchIcon,
  QuickDollarIcon,
  QuickCalculatorIcon,
  QuickCreditCardIcon,
  LucideIconComponent,
} from '@/src/components/ui/LucideIcons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AppCard } from '@/src/components/ui/AppCard';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { FadeInView } from '@/src/components/ui/FadeInView';
import { AnimatedCounter } from '@/src/components/ui/AnimatedCounter';
import { useSessionStore } from '@/src/store/useSessionStore';
import { dashboardService } from '@/src/services/api/dashboard';
import { toApiError } from '@/src/services/api/client';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, spacing } from '@/src/theme';
import { formatCurrency } from '@/src/utils/format';
import { createHomeScreenStyles } from './styles';

interface QuickActionItem {
  id: string;
  label: string;
  Icon: LucideIconComponent;
  route: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'orcamento',
    label: 'Orçamento',
    Icon: QuickDocumentIcon,
    route: '/(app)/orcamentos/novo',
  },
  {
    id: 'os',
    label: 'Nova OS',
    Icon: QuickWrenchIcon,
    route: '/(app)/servicos/novo',
  },
  {
    id: 'receber',
    label: 'Receber',
    Icon: QuickDollarIcon,
    route: '/(app)/pagamentos/novo',
  },
  {
    id: 'calc',
    label: 'Calculadora',
    Icon: QuickCalculatorIcon,
    route: '/(app)/ferramentas/calculadora',
  },
  {
    id: 'despesa',
    label: 'Despesa',
    Icon: QuickCreditCardIcon,
    route: '/(app)/despesas/novo',
  },
];

export default function HomeScreen() {
  const activeCompany = useSessionStore((s) => s.activeCompany);
  const currentUser = useSessionStore((s) => s.currentUser);
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const styles = useMemo(() => createHomeScreenStyles(colors, isDark), [colors, isDark]);

  const companyId = activeCompany?.company?.id;
  const userName = currentUser?.name?.split(' ')[0] ?? 'Usuário';
  const companyName = activeCompany?.company?.tradeName ?? 'Minha Empresa';

  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-overview', companyId],
    queryFn: () => dashboardService.getOverview(),
    enabled: Boolean(companyId),
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !overview) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando dashboard..." />
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

  const summary = overview?.summary;
  const operationalToday = overview?.operationalToday;
  const charts = overview?.charts;
  const alerts = overview?.alerts;

  const revenue = summary?.revenue.monthRevenue ?? 0;
  const expenses = summary?.revenue.monthExpenses ?? 0;
  const profit = summary?.revenue.monthProfit ?? 0;
  const profitMarginPct = summary?.revenue.profitMarginPct ?? 0;

  const maxEvolutionValue = Math.max(
    ...(charts?.monthlyEvolution?.map((m) => Math.max(m.revenue, m.expenses, 1)) ?? [1]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.responsiveContainer}>
          {/* Header Elegante com Período & Empresa */}
          <FadeInView>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Olá, {userName} 👋</Text>
                <Text style={styles.companyName}>{companyName}</Text>
              </View>
              <TouchableOpacity
                style={styles.periodBadge}
                activeOpacity={0.7}
                onPress={() => router.push('/(app)/relatorios')}
              >
                <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                <Text style={styles.periodText}>{overview?.period?.formattedPeriod || 'Mês Atual'}</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>

          {/* Seção de Ações Rápidas */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
            <View style={styles.quickActionsRow}>
              {QUICK_ACTIONS.map(({ id, label, Icon, route }) => {
                const iconColor = isDark ? '#818CF8' : colors.primary;
                return (
                  <PressableScale
                    key={id}
                    style={styles.quickActionItem}
                    onPress={() => router.push(route as any)}
                    scaleTo={0.93}
                  >
                    <View style={styles.actionCard}>
                      <Icon size={26} color={iconColor} strokeWidth={2} />
                    </View>
                    <Text
                      style={styles.actionLabel}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          {/* Hero Card: Resultado Financeiro do Mês (Clicável -> Fluxo de Caixa) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(app)/relatorios/fluxo-caixa')}
          >
            <AppCard shadow="light" radius={radius.xl} style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View>
                  <View style={styles.cardHeaderWithArrow}>
                    <Text style={styles.heroSubtitle}>Lucro Operacional Líquido</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textLight} />
                  </View>
                  <Text style={styles.profitText}>{formatCurrency(profit)}</Text>
                </View>
                <View style={styles.marginBadge}>
                  <Ionicons name="trending-up" size={13} color={colors.success} />
                  <Text style={styles.marginText}>{profitMarginPct.toFixed(1)}% margem</Text>
                </View>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroDetailsRow}>
                <View style={styles.heroDetailItem}>
                  <Text style={styles.heroDetailLabel}>Faturamento</Text>
                  <Text style={styles.revenueText}>{formatCurrency(revenue)}</Text>
                </View>
                <View style={styles.heroVerticalDivider} />
                <View style={styles.heroDetailItem}>
                  <Text style={styles.heroDetailLabel}>Despesas</Text>
                  <Text style={styles.expenseText}>{formatCurrency(expenses)}</Text>
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>



          {/* Grid de KPIs Clicáveis (Orçamentos, Visitas, OS Hoje, A Receber) */}
          <View style={styles.kpiGrid}>
            {/* 1. Orçamentos em Aberto (Clicável -> Orçamentos) */}
            <TouchableOpacity
              style={styles.kpiCardWrapper}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/(tabs)/orcamentos')}
            >
              <AppCard shadow="light" radius={radius.lg} style={styles.kpiCard}>
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiTitle}>Em Aberto</Text>
                  <View style={styles.kpiIconBadge}>
                    <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                  </View>
                </View>
                <Text style={styles.kpiValue}>
                  <AnimatedCounter value={summary?.quotes.openCount ?? 0} /> orçamentos
                </Text>
                <View style={styles.kpiFooterRow}>
                  <Text style={styles.kpiSub}>
                    {formatCurrency(summary?.quotes.openTotal ?? 0)}
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textLight} />
                </View>
              </AppCard>
            </TouchableOpacity>

            {/* 2. Visitas de Hoje (Clicável -> Agenda) */}
            <TouchableOpacity
              style={styles.kpiCardWrapper}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/agenda')}
            >
              <AppCard shadow="light" radius={radius.lg} style={styles.kpiCard}>
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiTitle}>Visitas Hoje</Text>
                  <View style={[styles.kpiIconBadge, { backgroundColor: isDark ? 'rgba(168,85,247,0.18)' : '#F3E8FF' }]}>
                    <Ionicons name="eye-outline" size={14} color="#9333EA" />
                  </View>
                </View>
                <Text style={styles.kpiValue}>
                  <AnimatedCounter value={operationalToday?.visitsCount ?? 0} /> agendadas
                </Text>
                <View style={styles.kpiFooterRow}>
                  <Text style={styles.kpiSub}>Ver agenda do dia</Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textLight} />
                </View>
              </AppCard>
            </TouchableOpacity>

            {/* 3. OS para Hoje (Clicável -> Serviços) */}
            <TouchableOpacity
              style={styles.kpiCardWrapper}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/(tabs)/servicos')}
            >
              <AppCard shadow="light" radius={radius.lg} style={styles.kpiCard}>
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiTitle}>OS Hoje</Text>
                  <View style={[styles.kpiIconBadge, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="hammer-outline" size={14} color={colors.primary} />
                  </View>
                </View>
                <Text style={styles.kpiValue}>
                  <AnimatedCounter value={operationalToday?.servicesCount ?? 0} /> agendadas
                </Text>
                <View style={styles.kpiFooterRow}>
                  <Text style={styles.kpiSub}>Em campo</Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textLight} />
                </View>
              </AppCard>
            </TouchableOpacity>

            {/* 4. A Receber (Clicável -> Pagamentos) */}
            <TouchableOpacity
              style={styles.kpiCardWrapper}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/pagamentos')}
            >
              <AppCard shadow="light" radius={radius.lg} style={styles.kpiCard}>
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiTitle}>A Receber</Text>
                  <View style={[styles.kpiIconBadge, { backgroundColor: colors.warningSoft }]}>
                    <Ionicons name="cash-outline" size={14} color={colors.warning} />
                  </View>
                </View>
                <Text style={styles.kpiValue}>
                  {formatCurrency(summary?.toReceive.total ?? 0)}
                </Text>
                <View style={styles.kpiFooterRow}>
                  {(summary?.toReceive.overdue ?? 0) > 0 ? (
                    <Text style={styles.overdueText}>
                      ⚠️ {formatCurrency(summary?.toReceive.overdue ?? 0)} vencidos
                    </Text>
                  ) : (
                    <Text style={styles.okText}>✓ Em dia</Text>
                  )}
                  <Ionicons name="arrow-forward" size={12} color={colors.textLight} />
                </View>
              </AppCard>
            </TouchableOpacity>
          </View>

          {/* Gráfico de Evolução Mensal */}
          {charts?.monthlyEvolution && charts.monthlyEvolution.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(app)/relatorios')}
            >
              <AppCard shadow="light" radius={radius.lg} style={styles.chartCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Evolução Financeira</Text>
                    <Text style={styles.sectionSubtitle}>Faturamento vs Despesas (últimos 6 meses)</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.textLight} />
                </View>
                <View style={styles.chartRow}>
                  {charts.monthlyEvolution.map((item, idx) => {
                    const revH = Math.max(8, (item.revenue / maxEvolutionValue) * 100);
                    const expH = Math.max(8, (item.expenses / maxEvolutionValue) * 100);
                    return (
                      <View key={idx} style={styles.barCol}>
                        <View style={styles.barsWrapper}>
                          <View style={[styles.barItem, { height: `${revH}%`, backgroundColor: colors.primary }]} />
                          <View style={[styles.barItem, { height: `${expH}%`, backgroundColor: colors.danger }]} />
                        </View>
                        <Text style={styles.barMonthLabel}>{item.monthLabel}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendLabel}>Faturamento</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                    <Text style={styles.legendLabel}>Despesas</Text>
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          ) : null}

          {/* Follow-ups Comerciais de Hoje com WhatsApp 1-Clique */}
          {operationalToday?.followUps && operationalToday.followUps.length > 0 ? (
            <FadeInView delay={150} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Follow-ups Pendentes</Text>
                  <Text style={styles.sectionSubtitle}>Contate os clientes para fechar orçamentos</Text>
                </View>
              </View>

              {operationalToday.followUps.map((fu) => (
                <AppCard key={fu.id} shadow="light" radius={radius.lg} style={styles.followUpCard}>
                  <TouchableOpacity
                    style={styles.followUpInfo}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(app)/orcamentos/${fu.quoteId}`)}
                  >
                    <Text style={styles.followUpTitle}>
                      Orçamento #{fu.quoteNumber} • {fu.client?.name ?? 'Cliente'}
                    </Text>
                    {fu.notes ? (
                      <Text style={styles.followUpNotes} numberOfLines={1}>
                        {fu.notes}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                  {fu.client?.whatsAppUrl ? (
                    <TouchableOpacity
                      style={styles.whatsappBtn}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (fu.client?.whatsAppUrl) {
                          Linking.openURL(fu.client.whatsAppUrl).catch(() => {});
                        }
                      }}
                    >
                      <Ionicons name="logo-whatsapp" size={15} color="#FFF" />
                      <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                  ) : null}
                </AppCard>
              ))}
            </FadeInView>
          ) : null}

          {/* Serviços de Hoje (Clicável -> OS) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Serviços de Hoje ({operationalToday?.servicesCount ?? 0})</Text>
                <Text style={styles.sectionSubtitle}>Ordens de serviço agendadas</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => router.push('/(app)/(tabs)/servicos')}
              >
                <Text style={styles.seeAllText}>Ver todas</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              {!operationalToday?.services || operationalToday.services.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum serviço agendado para hoje</Text>
              ) : (
                operationalToday.services.map((service, index, array) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.listItem,
                      index < array.length - 1 && styles.listItemBorder,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(app)/servicos/${service.id}`)}
                  >
                    <View style={[styles.listIconContainer, styles.listIconPrimary]}>
                      <Ionicons name="hammer-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>
                        OS #{service.code} • {service.client?.name ?? 'Cliente'}
                      </Text>
                      <Text style={styles.listItemValue} numberOfLines={1}>
                        {service.work?.name ? `📍 ${service.work.name}` : formatCurrency(service.saleValue)}
                      </Text>
                    </View>
                    <StatusBadge
                      status={service.status === 'CONCLUIDA' ? 'active' : 'warning'}
                      label={service.status}
                      size="sm"
                    />
                  </TouchableOpacity>
                ))
              )}
            </AppCard>
          </View>

          {/* Alertas de Estoque Mínimo */}
          {alerts?.stockAlerts && alerts.stockAlerts.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Alertas de Estoque</Text>
                  <Text style={styles.sectionSubtitle}>Materiais abaixo do estoque de segurança</Text>
                </View>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push('/(app)/compras')}
                >
                  <Text style={styles.seeAllText}>Compras</Text>
                  <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {alerts.stockAlerts.map((mat, index, array) => (
                  <View
                    key={mat.id}
                    style={[
                      styles.listItem,
                      index < array.length - 1 && styles.listItemBorder,
                    ]}
                  >
                    <View style={[styles.listIconContainer, styles.listIconWarning]}>
                      <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>
                        {mat.name}
                      </Text>
                      <Text style={styles.stockAlertDetail}>
                        Estoque: {mat.stockQty} {mat.unit} (Mín: {mat.minStockQty})
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.buyActionBtn}
                      onPress={() => router.push('/(app)/compras/novo')}
                    >
                      <Text style={styles.buyActionText}>Comprar</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </AppCard>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
