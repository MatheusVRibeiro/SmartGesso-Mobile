import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { toApiError } from '@/src/services/api/client';
import { quotesService } from '@/src/services/api/quotes';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { colors as defaultColors, radius, sizes } from '@/src/theme';
import { formatCurrency, formatQuoteCode } from '@/src/utils/format';
import { toArray } from '@/src/utils/toArray';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import type { QuotePaymentMethod, QuoteStatus, QuoteSummary } from '@/src/types/quote';
import { createOrcamentosStyles } from './styles';

const CLOSED_QUOTE_STATUSES: ReadonlySet<QuoteStatus> = new Set([
  'APROVADO',
  'CANCELADO',
]);

function isQuoteExpired(quote: {
  validUntil?: string | null;
  status: QuoteStatus;
}): boolean {
  if (!quote.validUntil) return false;
  if (CLOSED_QUOTE_STATUSES.has(quote.status)) return false;
  const validUntil = new Date(quote.validUntil);
  if (Number.isNaN(validUntil.getTime())) return false;
  validUntil.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return validUntil.getTime() < today.getTime();
}

function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const PAYMENT_METHOD_LABEL: Record<QuotePaymentMethod, string> = {
  AVISTA: 'À vista',
  AVISTA_DESCONTO: 'À vista c/ desc.',
  ENTRADA_SALDO: 'Entrada + Saldo',
  QUINZENAL_2X: 'Quinzenal 2x',
  MENSAL: 'Mensal',
  PARCELADO: 'Parcelado',
  PERSONALIZADO: 'Personalizado',
};

const STATUS_VISUAL: Record<
  QuoteStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  RASCUNHO: {
    label: 'Rascunho',
    bg: 'rgba(100, 116, 139, 0.14)',
    text: defaultColors.disabled,
    dot: defaultColors.textSecondary,
  },
  PRONTO_PARA_ENVIAR: {
    label: 'Pronto',
    bg: 'rgba(59, 130, 246, 0.14)',
    text: defaultColors.secondaryLight,
    dot: defaultColors.primaryLight,
  },
  ENVIADO: {
    label: 'Enviado',
    bg: 'rgba(245, 158, 11, 0.14)',
    text: defaultColors.warningLight,
    dot: defaultColors.warning,
  },
  AGUARDANDO_APROVACAO: {
    label: 'Aguardando',
    bg: 'rgba(245, 158, 11, 0.14)',
    text: defaultColors.warningLight,
    dot: defaultColors.warning,
  },
  APROVADO: {
    label: 'Aprovado',
    bg: 'rgba(16, 185, 129, 0.14)',
    text: defaultColors.chartSuccess,
    dot: defaultColors.success,
  },
  REJEITADO: {
    label: 'Recusado',
    bg: 'rgba(239, 68, 68, 0.14)',
    text: defaultColors.dangerLight,
    dot: defaultColors.dangerBright,
  },
  VENCIDO: {
    label: 'Vencido',
    bg: 'rgba(239, 68, 68, 0.14)',
    text: defaultColors.dangerLight,
    dot: defaultColors.dangerBright,
  },
  CANCELADO: {
    label: 'Cancelado',
    bg: 'rgba(148, 163, 184, 0.14)',
    text: defaultColors.disabled,
    dot: defaultColors.textSecondary,
  },
};

interface QuoteCardProps {
  quote: QuoteSummary;
  /** Callback estável (recebe o id) — permite React.memo sem re-render por tecla. */
  onPress: (quoteId: string) => void;
  styles: ReturnType<typeof createOrcamentosStyles>;
  colors: any;
}

const QuoteCard = React.memo(function QuoteCard({ quote, onPress, styles, colors }: QuoteCardProps) {
  const expired = isQuoteExpired(quote);
  const statusCfg = expired ? STATUS_VISUAL.VENCIDO : STATUS_VISUAL[quote.status];

  // Iniciais do cliente
  const clientInitials = useMemo(() => {
    const name = quote.client?.name?.trim();
    if (!name) return 'OR';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [quote.client?.name]);

  const handleShareWhatsApp = async (e: any) => {
    e?.stopPropagation?.();
    try {
      const shareData = await quotesService.share(quote.id);
      const url = shareData?.url || '';
      const msg = `Olá! Segue o link do orçamento ${formatQuoteCode(quote.quoteNumber)} (v${quote.version}) no valor de ${formatCurrency(quote.total)}:\n${url}`;
      await Share.share({ message: msg, title: `Orçamento ${formatQuoteCode(quote.quoteNumber)}` });
    } catch {
      const msg = `Orçamento ${formatQuoteCode(quote.quoteNumber)} (v${quote.version}) - Valor: ${formatCurrency(quote.total)}`;
      await Share.share({ message: msg });
    }
  };

  const handleShareGeneral = async (e: any) => {
    e?.stopPropagation?.();
    try {
      const shareData = await quotesService.share(quote.id);
      const url = shareData?.url || '';
      await Share.share({
        message: `Orçamento ${formatQuoteCode(quote.quoteNumber)} - ${formatCurrency(quote.total)}\n${url}`,
        url,
      });
    } catch {
      onPress(quote.id);
    }
  };

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <View style={styles.cardInner}>
        {/* Linha Superior: Clicável para abrir detalhes */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver orçamento ${formatQuoteCode(quote.quoteNumber)} versão ${quote.version} de ${quote.client?.name ?? 'cliente não informado'}, status ${statusCfg.label}, total ${formatCurrency(quote.total)}`}
          onPress={() => onPress(quote.id)}
          style={({ pressed }) => [
            styles.cardTopRow,
            pressed && { opacity: 0.75 },
          ]}
        >
          <View style={styles.cardClientGroup}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{clientInitials}</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName} numberOfLines={1}>
                {quote.client?.name ?? 'Cliente não informado'}
              </Text>
              <View style={styles.codeAndMetaRow}>
                <Text style={styles.codeText}>{formatQuoteCode(quote.quoteNumber)}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>v{quote.version}</Text>
                {quote.createdAt ? (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{formatRelativeDate(quote.createdAt)}</Text>
                  </>
                ) : null}
                {quote.work?.name ? (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.workText} numberOfLines={1}>
                      {quote.work.name}
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
          </View>

          {/* Badge de Status */}
          <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusCfg.dot }]} />
            <Text style={[styles.statusPillText, { color: statusCfg.text }]}>
              {statusCfg.label}
            </Text>
          </View>
        </Pressable>

        {/* Linha Inferior: Valor Total + Condição + Ações Rápidas (NÃO aninhadas em outro button) */}
        <View style={styles.cardBottomRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Total do orçamento: ${formatCurrency(quote.total)}`}
            onPress={() => onPress(quote.id)}
            style={({ pressed }) => [
              styles.valueGroup,
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={styles.cardTotal}>{formatCurrency(quote.total)}</Text>
            {quote.paymentMethod ? (
              <View style={styles.paymentChip}>
                <Text style={styles.paymentChipText}>
                  {PAYMENT_METHOD_LABEL[quote.paymentMethod] ?? quote.paymentMethod}
                </Text>
              </View>
            ) : null}
          </Pressable>

          {/* Ações Rápidas Compactas */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={[styles.iconActionBtn, styles.whatsappBtn]}
              onPress={handleShareWhatsApp}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Enviar orçamento ${formatQuoteCode(quote.quoteNumber)} por WhatsApp`}
            >
              <Ionicons name="logo-whatsapp" size={15} color={defaultColors.whatsapp} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconActionBtn, styles.shareBtn]}
              onPress={handleShareGeneral}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Compartilhar orçamento ${formatQuoteCode(quote.quoteNumber)}`}
            >
              <Ionicons name="share-social-outline" size={15} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => onPress(quote.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Ver detalhes do orçamento"
            >
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppCard>
  );
});

// ─── Skeleton de carregamento (Fase 4 — impeccable: substitui spinner) ──────

function QuoteCardSkeleton({ colors }: { colors: any }) {
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.card }]}>
      {/* Linha superior: avatar + nome/código + pill de status */}
      <View style={skeletonStyles.topRow}>
        <Skeleton width={40} height={40} radius={radius.full} />
        <View style={skeletonStyles.lines}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="38%" height={11} />
        </View>
        <Skeleton width={84} height={24} radius={radius.full} />
      </View>
      {/* Linha inferior: valor + ações rápidas */}
      <View style={skeletonStyles.bottomRow}>
        <Skeleton width={110} height={18} radius={radius.sm} />
        <Skeleton width={96} height={30} radius={radius.sm} />
      </View>
    </View>
  );
}

function QuotesListSkeleton({ colors }: { colors: any }) {
  return (
    <View style={skeletonStyles.list}>
      {Array.from({ length: 5 }).map((_, i) => (
        <QuoteCardSkeleton key={i} colors={colors} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lines: {
    flex: 1,
    gap: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    paddingHorizontal: sizes.screenPadding,
    paddingTop: 4,
    gap: 12,
  },
});

type FilterType = 'TODOS' | 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'RECUSADO';
type SortType = 'RECENTES' | 'MAIOR_VALOR' | 'MENOR_VALOR';

export default function OrcamentosScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createOrcamentosStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  // Debounce da busca (P0 audit impeccable): evita refiltrar a lista a cada tecla
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [sortOrder, setSortOrder] = useState<SortType>('RECENTES');

  const {
    data: quotes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'quotes'],
    queryFn: () => quotesService.list(),
    select: (result) => toArray<QuoteSummary>(result),
    enabled: Boolean(companyId),
  });

  // Métricas do Mini-Dashboard Slim
  const metrics = useMemo(() => {
    const list = toArray<QuoteSummary>(quotes);

    let totalNegociacao = 0;
    let countNegociacao = 0;

    let totalAprovado = 0;
    let countAprovado = 0;

    let countAguardando = 0;

    for (const q of list) {
      const val = q.total || 0;
      if (q.status === 'APROVADO') {
        totalAprovado += val;
        countAprovado += 1;
      } else if (q.status === 'ENVIADO' || q.status === 'AGUARDANDO_APROVACAO') {
        totalNegociacao += val;
        countNegociacao += 1;
        countAguardando += 1;
      } else if (q.status === 'RASCUNHO') {
        totalNegociacao += val;
        countNegociacao += 1;
      }
    }

    return {
      totalNegociacao,
      countNegociacao,
      totalAprovado,
      countAprovado,
      countAguardando,
      totalGeral: list.length,
    };
  }, [quotes]);

  // Contagens para os chips de filtro
  const counts = useMemo(() => {
    const list = toArray<QuoteSummary>(quotes);
    return {
      TODOS: list.length,
      RASCUNHO: list.filter((q) => q.status === 'RASCUNHO').length,
      ENVIADO: list.filter((q) => q.status === 'ENVIADO' || q.status === 'AGUARDANDO_APROVACAO').length,
      APROVADO: list.filter((q) => q.status === 'APROVADO').length,
      RECUSADO: list.filter((q) => q.status === 'REJEITADO' || q.status === 'CANCELADO' || isQuoteExpired(q)).length,
    };
  }, [quotes]);

  // Filtragem e Ordenação
  const filteredQuotes = useMemo(() => {
    const list = toArray<QuoteSummary>(quotes);
    // Pré-computa a query uma vez (não por item) — lowercase fica barato
    const query = debouncedSearch.trim().toLowerCase();
    const filtered = list.filter((q) => {
      const matchFilter =
        selectedFilter === 'TODOS' ||
        (selectedFilter === 'RASCUNHO' && q.status === 'RASCUNHO') ||
        (selectedFilter === 'ENVIADO' && (q.status === 'ENVIADO' || q.status === 'AGUARDANDO_APROVACAO')) ||
        (selectedFilter === 'APROVADO' && q.status === 'APROVADO') ||
        (selectedFilter === 'RECUSADO' && (q.status === 'REJEITADO' || q.status === 'CANCELADO' || isQuoteExpired(q)));

      const matchSearch =
        !query ||
        q.client?.name?.toLowerCase().includes(query) ||
        String(q.quoteNumber).includes(query) ||
        formatQuoteCode(q.quoteNumber).toLowerCase().includes(query) ||
        (q.work?.name && q.work.name.toLowerCase().includes(query));

      return matchFilter && matchSearch;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'MAIOR_VALOR') {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortOrder === 'MENOR_VALOR') {
        return (a.total || 0) - (b.total || 0);
      }
      // RECENTES (default): id ou data desc
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return (b.quoteNumber || 0) - (a.quoteNumber || 0);
    });
  }, [quotes, selectedFilter, debouncedSearch, sortOrder]);

  const cycleSortOrder = () => {
    if (sortOrder === 'RECENTES') setSortOrder('MAIOR_VALOR');
    else if (sortOrder === 'MAIOR_VALOR') setSortOrder('MENOR_VALOR');
    else setSortOrder('RECENTES');
  };

  // Navegação estável — referência fixa p/ React.memo do QuoteCard (sem re-render por tecla)
  const openQuote = useCallback(
    (quoteId: string) => {
      router.push(`/orcamentos/${quoteId}`);
    },
    [router],
  );

  const sortLabelMap: Record<SortType, string> = {
    RECENTES: 'Recentes',
    MAIOR_VALOR: 'Maior R$',
    MENOR_VALOR: 'Menor R$',
  };

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Orçamentos', headerShown: false }} />

      <View style={styles.headerWrapper}>
        {/* Header Superior: Título + Botão Criar Orçamento */}
        <View style={styles.topBar}>
          <View style={styles.titleSection}>
            <View style={styles.titleIconBadge}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.titleTextWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Orçamentos</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{metrics.totalGeral}</Text>
                </View>
              </View>
              <Text style={styles.subtitle} numberOfLines={1}>Propostas e negociações comerciais</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/orcamentos/novo')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Criar novo orçamento"
          >
            <Ionicons name="add" size={17} color={colors.white} />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>

        {/* Linha Divisória de Separação do Topo */}
        <View style={styles.headerDivider} />

        {/* Mini-Dashboard de KPIs Slim */}
        <View style={styles.kpiSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kpiScroll}
          >
            {/* KPI 1: Em Negociação */}
            <TouchableOpacity
              style={[
                styles.kpiCard,
                selectedFilter === 'ENVIADO' && styles.kpiCardActive,
              ]}
              onPress={() => setSelectedFilter((prev) => (prev === 'ENVIADO' ? 'TODOS' : 'ENVIADO'))}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar orçamentos em negociação, ${metrics.countNegociacao} em aberto, total ${formatCurrency(metrics.totalNegociacao)}`}
            >
              <View style={[styles.kpiIconWrap, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : colors.primarySoft }]}>
                <Ionicons name="trending-up" size={14} color={colors.primaryLight} />
              </View>
              <View style={styles.kpiContent}>
                <View style={styles.kpiLabelRow}>
                  <Text style={styles.kpiLabel}>Aberto</Text>
                  <Text style={[styles.kpiBadge, { backgroundColor: colors.primaryBadge, color: colors.primaryLight }]}>
                    {metrics.countNegociacao}
                  </Text>
                </View>
                <Text style={styles.kpiValue} numberOfLines={1}>{formatCurrency(metrics.totalNegociacao)}</Text>
              </View>
            </TouchableOpacity>

            {/* KPI 2: Aprovados */}
            <TouchableOpacity
              style={[
                styles.kpiCard,
                selectedFilter === 'APROVADO' && styles.kpiCardActive,
              ]}
              onPress={() => setSelectedFilter((prev) => (prev === 'APROVADO' ? 'TODOS' : 'APROVADO'))}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar orçamentos aprovados, ${metrics.countAprovado} aprovados, total ${formatCurrency(metrics.totalAprovado)}`}
            >
              <View style={[styles.kpiIconWrap, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : colors.successSoft }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              </View>
              <View style={styles.kpiContent}>
                <View style={styles.kpiLabelRow}>
                  <Text style={styles.kpiLabel}>Aprovado</Text>
                  <Text style={[styles.kpiBadge, { backgroundColor: colors.successBadge, color: colors.success }]}>
                    {metrics.countAprovado}
                  </Text>
                </View>
                <Text style={[styles.kpiValue, { color: colors.success }]} numberOfLines={1}>{formatCurrency(metrics.totalAprovado)}</Text>
              </View>
            </TouchableOpacity>

            {/* KPI 3: Aguardando Resposta */}
            <TouchableOpacity
              style={[
                styles.kpiCard,
                selectedFilter === 'ENVIADO' && styles.kpiCardActive,
              ]}
              onPress={() => setSelectedFilter((prev) => (prev === 'ENVIADO' ? 'TODOS' : 'ENVIADO'))}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar orçamentos aguardando resposta, ${metrics.countAguardando === 1 ? '1 proposta' : `${metrics.countAguardando} propostas`} aguardando`}
            >
              <View style={[styles.kpiIconWrap, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : colors.warningSoft }]}>
                <Ionicons name="time" size={14} color={colors.warning} />
              </View>
              <View style={styles.kpiContent}>
                <View style={styles.kpiLabelRow}>
                  <Text style={styles.kpiLabel}>Aguardando</Text>
                  <Text style={[styles.kpiBadge, { backgroundColor: colors.warningBadge, color: colors.warning }]}>
                    {metrics.countAguardando}
                  </Text>
                </View>
                <Text style={styles.kpiValue} numberOfLines={1}>
                  {metrics.countAguardando === 1 ? '1 proposta' : `${metrics.countAguardando} propostas`}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Linha de Busca e Ordenação Compacta */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por cliente, código ou obra..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Buscar orçamentos"
              accessibilityHint="Busca por cliente, código ou obra"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
              >
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.sortButton, sortOrder !== 'RECENTES' && styles.sortButtonActive]}
            onPress={cycleSortOrder}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Ordenar: ${sortLabelMap[sortOrder]}`}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={14}
              color={sortOrder !== 'RECENTES' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.sortButtonText,
                sortOrder !== 'RECENTES' && { color: colors.primary },
              ]}
            >
              {sortLabelMap[sortOrder]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chips de Filtro por Status */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['TODOS', 'RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO'] as const).map((fil) => {
            const isActive = selectedFilter === fil;
            const labelMap = {
              TODOS: 'Todos',
              RASCUNHO: 'Rascunhos',
              ENVIADO: 'Enviados',
              APROVADO: 'Aprovados',
              RECUSADO: 'Recusados',
            };
            const count = counts[fil];
            return (
              <TouchableOpacity
                key={fil}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(fil)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filtrar por status: ${labelMap[fil]}, ${count} orçamentos`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {labelMap[fil]}
                </Text>
                {count > 0 ? (
                  <View style={[styles.filterChipBadge, isActive && styles.filterChipBadgeActive]}>
                    <Text
                      style={[
                        styles.filterChipBadgeText,
                        isActive && styles.filterChipBadgeTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Conteúdo Principal / Lista de Alta Densidade */}
      {isLoading ? (
        <QuotesListSkeleton colors={colors} />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filteredQuotes.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento cadastrado'}
          description={
            searchQuery
              ? 'Tente buscar com outro termo ou alterar o filtro'
              : 'Comece criando seu primeiro orçamento profissional para encantar seus clientes'
          }
          icon="document-text-outline"
          actionLabel="+ Criar primeiro orçamento"
          onAction={() => router.push('/orcamentos/novo')}
        />
      ) : (
        <FlatList
          data={filteredQuotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuoteCard
              quote={item}
              onPress={openQuote}
              styles={styles}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
    </ScreenContainer>
  );
}
