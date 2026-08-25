import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AppCard } from '../../../src/components/ui/AppCard';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { dashboardService } from '../../../src/services/api/dashboard';
import { toApiError } from '../../../src/services/api/client';
import { colors, radius, spacing } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';

export default function HomeScreen() {
  const activeCompany = useSessionStore((s) => s.activeCompany);
  const currentUser = useSessionStore((s) => s.currentUser);
  const router = useRouter();

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
  const goals = overview?.goals;
  const operationalToday = overview?.operationalToday;
  const charts = overview?.charts;
  const alerts = overview?.alerts;

  const revenue = summary?.revenue.monthRevenue ?? 0;
  const expenses = summary?.revenue.monthExpenses ?? 0;
  const profit = summary?.revenue.monthProfit ?? 0;
  const profitMarginPct = summary?.revenue.profitMarginPct ?? 0;

  const safeRevenuePct = Math.min(100, Math.max(0, goals?.revenuePct ?? 0));
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
        {/* Header Elegante com Período & Empresa */}
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
            <Ionicons name="calendar-outline" size={13} color="#2563EB" />
            <Text style={styles.periodText}>{overview?.period?.formattedPeriod || 'Mês Atual'}</Text>
          </TouchableOpacity>
        </View>

        {/* ⚡ Barra de Ações Rápidas (1 Toque) */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/orcamentos/novo')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="document-text" size={20} color="#2563EB" />
            </View>
            <Text style={styles.actionLabel}>Orçamento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/servicos/novo')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="hammer" size={20} color="#10B981" />
            </View>
            <Text style={styles.actionLabel}>Nova OS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/pagamentos/novo')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="cash" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.actionLabel}>Receber</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/despesas/novo')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="card" size={20} color="#EF4444" />
            </View>
            <Text style={styles.actionLabel}>Despesa</Text>
          </TouchableOpacity>
        </View>

        {/* 🏆 Hero Card: Resultado Financeiro do Mês (Clicável -> Fluxo de Caixa) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(app)/relatorios/fluxo-caixa')}
        >
          <AppCard shadow="light" radius={radius.xl} style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <View style={styles.cardHeaderWithArrow}>
                  <Text style={styles.heroSubtitle}>Lucro Operacional Líquido</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </View>
                <Text style={styles.profitText}>{formatCurrency(profit)}</Text>
              </View>
              <View style={styles.marginBadge}>
                <Ionicons name="trending-up" size={13} color="#059669" />
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

        {/* 🎯 Meta Mensal de Faturamento (Clicável -> Metas) */}
        {goals?.hasGoal && goals.targetRevenue ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(app)/metas')}
          >
            <AppCard shadow="light" radius={radius.lg} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleRow}>
                  <Ionicons name="trophy" size={17} color="#F59E0B" />
                  <Text style={styles.goalTitle}>Meta de Faturamento</Text>
                </View>
                <View style={styles.rowCentered}>
                  <Text style={styles.goalPctBadge}>{safeRevenuePct.toFixed(0)}%</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${safeRevenuePct}%`,
                      backgroundColor: safeRevenuePct >= 100 ? '#10B981' : '#2563EB',
                    },
                  ]}
                />
              </View>
              <View style={styles.goalFooter}>
                <Text style={styles.goalFooterLabel}>
                  Meta: {formatCurrency(goals.targetRevenue)}
                </Text>
                {goals.targetApprovedQuotes ? (
                  <Text style={styles.goalFooterSub}>
                    {goals.approvedQuotesPct?.toFixed(0)}% de {goals.targetApprovedQuotes} fechados
                  </Text>
                ) : null}
              </View>
            </AppCard>
          </TouchableOpacity>
        ) : null}

        {/* 📊 Grid de KPIs Clicáveis (Orçamentos, Visitas, OS Hoje, A Receber) */}
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
                  <Ionicons name="document-text-outline" size={14} color="#2563EB" />
                </View>
              </View>
              <Text style={styles.kpiValue}>
                {summary?.quotes.openCount ?? 0} orçamentos
              </Text>
              <View style={styles.kpiFooterRow}>
                <Text style={styles.kpiSub}>
                  {formatCurrency(summary?.quotes.openTotal ?? 0)}
                </Text>
                <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
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
                <View style={[styles.kpiIconBadge, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="eye-outline" size={14} color="#9333EA" />
                </View>
              </View>
              <Text style={styles.kpiValue}>
                {operationalToday?.visitsCount ?? 0} agendadas
              </Text>
              <View style={styles.kpiFooterRow}>
                <Text style={styles.kpiSub}>Ver agenda do dia</Text>
                <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
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
                <View style={[styles.kpiIconBadge, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="hammer-outline" size={14} color="#2563EB" />
                </View>
              </View>
              <Text style={styles.kpiValue}>
                {operationalToday?.servicesCount ?? 0} agendadas
              </Text>
              <View style={styles.kpiFooterRow}>
                <Text style={styles.kpiSub}>Em campo</Text>
                <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
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
                <View style={[styles.kpiIconBadge, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="cash-outline" size={14} color="#D97706" />
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
                <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
              </View>
            </AppCard>
          </TouchableOpacity>
        </View>

        {/* 👁️ Seção: Visitas & Medições Técnicas de Hoje */}
        {operationalToday?.visits && operationalToday.visits.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Visitas de Hoje ({operationalToday.visitsCount})</Text>
                <Text style={styles.sectionSubtitle}>Compromissos e medições agendadas</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => router.push('/(app)/agenda')}
              >
                <Text style={styles.seeAllText}>Ver Agenda</Text>
                <Ionicons name="chevron-forward" size={13} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              {operationalToday.visits.map((v, index, array) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.listItem,
                    index < array.length - 1 && styles.listItemBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (v.quoteId) {
                      router.push(`/(app)/orcamentos/${v.quoteId}`);
                    } else if (v.serviceOrderId) {
                      router.push(`/(app)/servicos/${v.serviceOrderId}`);
                    } else {
                      router.push('/(app)/agenda');
                    }
                  }}
                >
                  <View style={[styles.listIconContainer, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="eye" size={18} color="#9333EA" />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>
                      {v.title}
                    </Text>
                    <Text style={styles.listItemValue} numberOfLines={1}>
                      👤 {v.client?.name ?? 'Cliente'} {v.time ? `• ⏰ ${v.time}` : ''}
                    </Text>
                  </View>
                  <StatusBadge status="info" label={v.type} size="sm" />
                </TouchableOpacity>
              ))}
            </AppCard>
          </View>
        ) : null}

        {/* 📈 Mini Gráfico de Evolução 6 Meses (Clicável -> Comparativo) */}
        {charts?.monthlyEvolution && charts.monthlyEvolution.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(app)/relatorios/comparativo')}
          >
            <AppCard shadow="light" radius={radius.xl} style={styles.chartCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Evolução Financeira (6 Meses)</Text>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </View>
              <View style={styles.chartRow}>
                {charts.monthlyEvolution.map((item, idx) => {
                  const revH = Math.max(8, (item.revenue / maxEvolutionValue) * 100);
                  const expH = Math.max(8, (item.expenses / maxEvolutionValue) * 100);
                  return (
                    <View key={idx} style={styles.barCol}>
                      <View style={styles.barsWrapper}>
                        <View style={[styles.barItem, { height: `${revH}%`, backgroundColor: '#2563EB' }]} />
                        <View style={[styles.barItem, { height: `${expH}%`, backgroundColor: '#EF4444' }]} />
                      </View>
                      <Text style={styles.barMonthLabel}>{item.monthLabel}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
                  <Text style={styles.legendLabel}>Faturamento</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendLabel}>Despesas</Text>
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>
        ) : null}

        {/* 💬 Follow-ups Comerciais de Hoje com WhatsApp 1-Clique */}
        {operationalToday?.followUps && operationalToday.followUps.length > 0 ? (
          <View style={styles.section}>
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
          </View>
        ) : null}

        {/* 🔨 Serviços de Hoje (Clicável -> OS) */}
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
              <Ionicons name="chevron-forward" size={13} color="#2563EB" />
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
                    <Ionicons name="hammer-outline" size={18} color="#2563EB" />
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

        {/* ⚠️ Alertas de Estoque Mínimo */}
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
                <Ionicons name="chevron-forward" size={13} color="#2563EB" />
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
                    <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  greeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderWithArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profitText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  marginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 4,
  },
  marginText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.md,
  },
  heroDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroDetailItem: {
    flex: 1,
  },
  heroDetailLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  revenueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
  heroVerticalDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: spacing.md,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  goalPctBadge: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: radius.full,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalFooterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  goalFooterSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpiCardWrapper: {
    width: '48.5%',
  },
  kpiCard: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  kpiIconBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  kpiFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 11,
    color: '#64748B',
  },
  overdueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  okText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginVertical: spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 80,
  },
  barItem: {
    width: 7,
    borderRadius: 3,
  },
  barMonthLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  sectionCard: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  followUpCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.xs,
  },
  followUpInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  followUpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  followUpNotes: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    gap: 4,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  listItemValue: {
    fontSize: 12,
    color: '#64748B',
  },
  listIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIconPrimary: {
    backgroundColor: '#EFF6FF',
  },
  listIconWarning: {
    backgroundColor: '#FFFBEB',
  },
  stockAlertDetail: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
  },
  buyActionBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  buyActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
