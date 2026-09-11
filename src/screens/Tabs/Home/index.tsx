import React, { useCallback, useMemo, useState } from 'react';
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
import { quotesService } from '@/src/services/api/quotes';
import { toApiError } from '@/src/services/api/client';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, spacing } from '@/src/theme';
import { formatCurrency } from '@/src/utils/format';
import { haptics } from '@/src/utils/haptics';
import { createHomeScreenStyles } from './styles';
import {
  buildTodayTimeline,
  computeOverdueServices,
} from '@/src/features/home/homeToday';
import type {
  TimelineItem,
  ServiceOrderSummary,
  OperationalTodayInput,
} from '@/src/features/home/homeToday';
import {
  computeExpiringQuotes,
  computeOverdueReceive,
} from '@/src/features/home/homeAlerts';
import { FeatureGate } from '@/src/components/ui/FeatureGate';

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

  const { data: quotes = [], refetch: refetchQuotes } = useQuery({
    queryKey: ['quotes-expiring', companyId],
    queryFn: () => quotesService.list(),
    enabled: Boolean(companyId),
  });

  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null);

  const activeMonth = useMemo(() => {
    const evolution = overview?.charts?.monthlyEvolution;
    if (!evolution || evolution.length === 0) return null;
    if (selectedMonthIdx !== null && evolution[selectedMonthIdx]) {
      return evolution[selectedMonthIdx];
    }
    return evolution[evolution.length - 1];
  }, [overview?.charts?.monthlyEvolution, selectedMonthIdx]);

  const expiringQuotes = useMemo(() => {
    return computeExpiringQuotes(Array.isArray(quotes) ? quotes : [], new Date());
  }, [quotes]);

  const onRefresh = useCallback(() => {
    refetch();
    refetchQuotes();
  }, [refetch, refetchQuotes]);

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

  // V4 ETAPA 15 — derivados dos helpers puros (src/features/home)
  const overdueReceive = computeOverdueReceive(
    summary ?? { toReceive: { overdue: 0, overdueCount: 0 } },
  );
  const todayServices = (operationalToday?.services ?? []) as ServiceOrderSummary[];
  const overdueServices = computeOverdueServices(todayServices, new Date());
  const todayTimeline = buildTodayTimeline(
    (operationalToday ?? {}) as OperationalTodayInput,
    new Date(),
  );
  const timelineDotStyle: Record<TimelineItem['kind'], object> = {
    visit: styles.timelineDotVisit,
    service: styles.timelineDotService,
    followUp: styles.timelineDotFollowUp,
  };
  const timelineKindLabel: Record<TimelineItem['kind'], string> = {
    visit: 'Visita',
    service: 'Serviço',
    followUp: 'Follow-up',
  };

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


          {/* Banner de Propostas a Vencer */}
          {expiringQuotes.length > 0 && (
            <FadeInView delay={80}>
              <PressableScale
                onPress={() => router.push('/(app)/(tabs)/orcamentos')}
                style={styles.alertBanner}
                scaleTo={0.98}
                accessibilityLabel="Ver orçamentos a vencer"
              >
                <View style={styles.alertIconWrapper}>
                  <Ionicons name="alert-circle" size={22} color="#D97706" />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>
                    {expiringQuotes.length === 1
                      ? '1 orçamento vence em breve'
                      : `${expiringQuotes.length} orçamentos vencem em breve`}
                  </Text>
                  <Text style={styles.alertSubtitle}>
                    Toque para fazer follow-up e garantir o fechamento
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D97706" />
              </PressableScale>
            </FadeInView>
          )}

          {/* Banner de Parcelas Vencidas (A Receber em atraso) */}
          {overdueReceive.hasOverdue && (
            <FadeInView delay={110}>
              <PressableScale
                onPress={() => router.push('/(app)/pagamentos')}
                style={styles.alertBannerDanger}
                scaleTo={0.98}
                accessibilityLabel="Ver pagamentos vencidos"
              >
                <View style={styles.alertIconWrapperDanger}>
                  <Ionicons name="warning" size={22} color={colors.danger} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitleDanger}>
                    {overdueReceive.count === 1
                      ? '1 parcela vencida'
                      : `${overdueReceive.count} parcelas vencidas`}
                  </Text>
                  <Text style={styles.alertSubtitleDanger}>
                    {formatCurrency(overdueReceive.amount)} em atraso — toque para cobrar
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.danger} />
              </PressableScale>
            </FadeInView>
          )}

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
                      <Icon size={24} color={iconColor} strokeWidth={2} />
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



          {/* Grid de KPIs Clicáveis (Em Aberto, OS Hoje, A Receber, Despesas do Mês, Visitas Hoje) */}
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

            {/* 2. OS para Hoje (Clicável -> Serviços) */}
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

            {/* 3. A Receber (Clicável -> Pagamentos) */}
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

            {/* 4. Despesas do Mês (Clicável -> Despesas) */}
            <TouchableOpacity
              style={styles.kpiCardWrapper}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/despesas')}
              accessibilityLabel="Ver despesas do mês"
            >
              <AppCard shadow="light" radius={radius.lg} style={styles.kpiCard}>
                <View style={styles.kpiCardHeader}>
                  <Text style={styles.kpiTitle}>Despesas do Mês</Text>
                  <View style={[styles.kpiIconBadge, { backgroundColor: isDark ? 'rgba(248,113,113,0.18)' : '#FEE2E2' }]}>
                    <Ionicons name="card-outline" size={14} color={colors.danger} />
                  </View>
                </View>
                <Text style={styles.kpiValue}>
                  {formatCurrency(summary?.revenue.monthExpenses ?? 0)}
                </Text>
                <View style={styles.kpiFooterRow}>
                  <Text style={styles.kpiSub}>Ver despesas</Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textLight} />
                </View>
              </AppCard>
            </TouchableOpacity>

            {/* 5. Visitas de Hoje (Clicável -> Agenda) */}
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
          </View>

          {/* Seção Hoje — Timeline do dia (V4 ETAPA 15) */}
          {todayTimeline.length > 0 && (
            <View style={styles.timelineSection}>
              <View style={styles.timelineHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Hoje</Text>
                  <Text style={styles.sectionSubtitle}>
                    Visitas, serviços e follow-ups programados
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push('/(app)/agenda')}
                >
                  <Text style={styles.seeAllText}>Agenda</Text>
                  <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <AppCard shadow="light" radius={radius.lg} style={styles.timelineCard}>
                {todayTimeline.map((item, index) => {
                  const isLast = index === todayTimeline.length - 1;
                  const timeText = item.time
                    ? item.time.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';
                  return (
                    <TouchableOpacity
                      key={`${item.kind}-${item.id}`}
                      style={styles.timelineItem}
                      activeOpacity={0.7}
                      disabled={isLast ? false : false}
                      onPress={() => router.push(item.route as any)}
                      accessibilityRole="button"
                      accessibilityLabel={`${timelineKindLabel[item.kind]}: ${item.title}`}
                    >
                      <View style={styles.timelineTimeCol}>
                        <Text style={styles.timelineTime}>{timeText}</Text>
                      </View>
                      <View style={styles.timelineMarkerCol}>
                        <View style={[styles.timelineDot, timelineDotStyle[item.kind]]} />
                        {!isLast && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {item.subtitle ? (
                          <Text style={styles.timelineSubtitle} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        ) : (
                          <Text style={styles.timelineSubtitle}>
                            {timelineKindLabel[item.kind]}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </AppCard>
            </View>
          )}

          {/* Serviços Atrasados (Clicável -> Serviços) — V4 ETAPA 15 */}
          {overdueServices.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Serviços Atrasados ({overdueServices.length})
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Agendados para dias anteriores e ainda não concluídos
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push('/(app)/(tabs)/servicos')}
                >
                  <Text style={styles.seeAllText}>Ver todos</Text>
                  <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
                {overdueServices.slice(0, 4).map((service, index, array) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.listItem,
                      index < array.length - 1 && styles.listItemBorder,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/(app)/servicos/${service.id}`)}
                    accessibilityLabel={`Ver serviço atrasado OS ${service.code}`}
                  >
                    <View style={[styles.listIconContainer, styles.listIconWarning]}>
                      <Ionicons name="time-outline" size={18} color={colors.danger} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>
                        OS #{service.code} • {service.client?.name ?? 'Cliente'}
                      </Text>
                      <Text style={styles.stockAlertDetail} numberOfLines={1}>
                        {service.scheduledDate
                          ? `Agendado para ${new Date(service.scheduledDate).toLocaleDateString('pt-BR')}`
                          : 'Sem data de agendamento'}
                      </Text>
                    </View>
                    <StatusBadge status="expired" label="Atrasado" size="sm" />
                  </TouchableOpacity>
                ))}
              </AppCard>
            </View>
          )}

          {/* Gráfico de Evolução Mensal Interativo & Moderno */}
          {charts?.monthlyEvolution && charts.monthlyEvolution.length > 0 ? (
            <AppCard shadow="light" radius={radius.lg} style={styles.chartCard}>
              {/* Header com Affordance de Relatórios */}
              <View style={styles.chartHeader}>
                <View style={styles.chartHeaderLeft}>
                  <View style={styles.chartHeaderIconWrapper}>
                    <Ionicons
                      name="stats-chart"
                      size={18}
                      color={isDark ? '#818CF8' : colors.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Evolução Financeira</Text>
                    <Text style={styles.sectionSubtitle}>
                      Faturamento vs Despesas (últimos 6 meses)
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.chartReportLink}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(app)/relatorios')}
                  accessibilityLabel="Ver relatório financeiro completo"
                >
                  <Text style={styles.chartReportLinkText}>Relatórios</Text>
                  <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Inspector Dinâmico do Mês Selecionado */}
              {activeMonth && (
                <View style={styles.chartInspector}>
                  <View style={styles.chartInspectorTop}>
                    <View style={styles.chartInspectorMonthTag}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={isDark ? '#818CF8' : colors.primary}
                      />
                      <Text style={styles.chartInspectorMonthText}>
                        {activeMonth.monthLabel}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.chartInspectorBadge,
                        {
                          backgroundColor:
                            activeMonth.profit > 0
                              ? isDark
                                ? 'rgba(52, 211, 153, 0.15)'
                                : '#ECFDF5'
                              : activeMonth.profit < 0
                              ? isDark
                                ? 'rgba(248, 113, 113, 0.15)'
                                : '#FEF2F2'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chartInspectorBadgeText,
                          {
                            color:
                              activeMonth.profit > 0
                                ? isDark
                                  ? '#34D399'
                                  : '#059669'
                                : activeMonth.profit < 0
                                ? isDark
                                  ? '#F87171'
                                  : '#DC2626'
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {activeMonth.profit > 0
                          ? `+Lucro: ${formatCurrency(activeMonth.profit)}`
                          : activeMonth.profit < 0
                          ? `Déficit: ${formatCurrency(activeMonth.profit)}`
                          : 'Equilibrado: R$ 0,00'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chartInspectorMetrics}>
                    <View style={styles.chartInspectorMetricItem}>
                      <View
                        style={[
                          styles.chartInspectorMetricDot,
                          { backgroundColor: isDark ? '#60A5FA' : '#2563EB' },
                        ]}
                      />
                      <Text style={styles.chartInspectorMetricLabel}>Faturamento:</Text>
                      <Text style={styles.chartInspectorMetricVal}>
                        {formatCurrency(activeMonth.revenue)}
                      </Text>
                    </View>

                    <View style={styles.chartInspectorMetricItem}>
                      <View
                        style={[
                          styles.chartInspectorMetricDot,
                          { backgroundColor: isDark ? '#F87171' : '#E11D48' },
                        ]}
                      />
                      <Text style={styles.chartInspectorMetricLabel}>Despesas:</Text>
                      <Text style={styles.chartInspectorMetricVal}>
                        {formatCurrency(activeMonth.expenses)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Viewport do Gráfico com Linhas Guia e Barras Arredondadas */}
              <View style={styles.chartViewport}>
                {/* Linhas Guia de Fundo */}
                <View style={styles.chartGridLines}>
                  <View style={styles.chartGridLine} />
                  <View style={styles.chartGridLine} />
                  <View
                    style={[
                      styles.chartGridLine,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.08)',
                      },
                    ]}
                  />
                </View>

                {/* Colunas Interativas com Barras */}
                <View style={styles.chartColumnsRow}>
                  {charts.monthlyEvolution.map((item, idx) => {
                    const isSelected =
                      selectedMonthIdx !== null
                        ? selectedMonthIdx === idx
                        : idx === charts.monthlyEvolution.length - 1;

                    const revH =
                      item.revenue > 0
                        ? Math.max(8, Math.round((item.revenue / maxEvolutionValue) * 100))
                        : 0;

                    const expH =
                      item.expenses > 0
                        ? Math.max(8, Math.round((item.expenses / maxEvolutionValue) * 100))
                        : 0;

                    const revColor = isDark ? '#60A5FA' : '#2563EB';
                    const expColor = isDark ? '#F87171' : '#E11D48';

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.chartColBtn,
                          isSelected && styles.chartColBtnActive,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedMonthIdx(idx);
                          haptics.selection();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Mês ${item.monthLabel}: Faturamento ${formatCurrency(item.revenue)}, Despesas ${formatCurrency(item.expenses)}`}
                      >
                        <View style={styles.chartBarsArea}>
                          {/* Barra Faturamento */}
                          {item.revenue > 0 ? (
                            <View
                              style={[
                                styles.chartBar,
                                {
                                  height: `${revH}%`,
                                  backgroundColor: revColor,
                                  opacity: isSelected ? 1 : 0.82,
                                },
                              ]}
                            />
                          ) : (
                            <View style={styles.chartZeroBar} />
                          )}

                          {/* Barra Despesas */}
                          {item.expenses > 0 ? (
                            <View
                              style={[
                                styles.chartBar,
                                {
                                  height: `${expH}%`,
                                  backgroundColor: expColor,
                                  opacity: isSelected ? 1 : 0.82,
                                },
                              ]}
                            />
                          ) : (
                            <View style={styles.chartZeroBar} />
                          )}
                        </View>

                        {/* Rótulo do Mês */}
                        <Text
                          style={[
                            styles.chartMonthLabel,
                            isSelected && styles.chartMonthLabelActive,
                          ]}
                        >
                          {item.monthLabel}
                        </Text>

                        {/* Indicador Ativo */}
                        {isSelected ? (
                          <View style={styles.chartActiveIndicatorDot} />
                        ) : (
                          <View style={{ height: 6 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Legenda e Dica de Interatividade */}
              <View style={styles.chartFooter}>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: isDark ? '#60A5FA' : '#2563EB' },
                      ]}
                    />
                    <Text style={styles.legendLabel}>Faturamento</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: isDark ? '#F87171' : '#E11D48' },
                      ]}
                    />
                    <Text style={styles.legendLabel}>Despesas</Text>
                  </View>
                </View>

                <Text style={styles.chartHint}>Toque na barra p/ detalhes</Text>
              </View>
            </AppCard>
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

          {/* Alertas de Estoque Mínimo (gated pela feature 'inventory') */}
          {alerts?.stockAlerts && alerts.stockAlerts.length > 0 ? (
            <FeatureGate feature="inventory">
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
            </FeatureGate>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
