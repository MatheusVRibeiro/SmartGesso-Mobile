import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  ScrollView,
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
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { toApiError } from '@/src/services/api/client';
import { serviceOrdersService } from '@/src/services/api/serviceOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius } from '@/src/theme';
import { formatCurrency, formatQuoteCode } from '@/src/utils/format';
import { formatDateBr } from '@/src/utils/date';
import { toArray } from '@/src/utils/toArray';
import type { ServiceOrder, ServiceOrderStatus } from '@/src/types/serviceOrder';
import { createServicosStyles } from './styles';

// ─── Visual dos Status de OS ────────────────────────────────────────────────

interface StatusVisualConfig {
  bg: string;
  text: string;
  dot: string;
  label: string;
}

function getStatusVisual(status: ServiceOrderStatus, isDark: boolean): StatusVisualConfig {
  switch (status) {
    case 'PENDENTE':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
        text: isDark ? '#FBBF24' : '#92400E',
        dot: '#F59E0B',
        label: 'Pendente',
      };
    case 'EM_DESLOCAMENTO':
      return {
        bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE',
        text: isDark ? '#60A5FA' : '#1E40AF',
        dot: '#3B82F6',
        label: 'Deslocamento',
      };
    case 'EM_ANDAMENTO':
      return {
        bg: isDark ? 'rgba(99, 102, 241, 0.15)' : '#E0E7FF',
        text: isDark ? '#818CF8' : '#3730A3',
        dot: '#6366F1',
        label: 'Em andamento',
      };
    case 'PAUSADA':
      return {
        bg: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFEDD5',
        text: isDark ? '#FB923C' : '#9A3412',
        dot: '#F97316',
        label: 'Pausada',
      };
    case 'CONCLUIDA':
      return {
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
        text: isDark ? '#34D399' : '#065F46',
        dot: '#10B981',
        label: 'Concluída',
      };
    case 'CANCELADA':
    default:
      return {
        bg: isDark ? 'rgba(107, 114, 128, 0.15)' : '#F3F4F6',
        text: isDark ? '#9CA3AF' : '#4B5563',
        dot: '#9CA3AF',
        label: 'Cancelada',
      };
  }
}

// ─── Card de Ordem de Serviço ───────────────────────────────────────────────

interface ServiceOrderCardProps {
  order: ServiceOrder;
  onPress: () => void;
  styles: ReturnType<typeof createServicosStyles>;
  colors: any;
  isDark: boolean;
}

function ServiceOrderCard({ order, onPress, styles, colors, isDark }: ServiceOrderCardProps) {
  const statusCfg = getStatusVisual(order.status, isDark);

  // Iniciais do cliente
  const clientInitials = useMemo(() => {
    const name = order.client?.name?.trim();
    if (!name) return 'OS';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [order.client?.name]);

  const handleOpenWhatsApp = (e: any) => {
    e?.stopPropagation?.();
    const phone = order.client?.phone?.replace(/\D/g, '');
    if (phone) {
      const msg = encodeURIComponent(
        `Olá ${order.client?.name ?? ''}, tudo bem? Estamos acompanhando sua Ordem de Serviço OS #${formatQuoteCode(order.code)} no SmartGesso.`,
      );
      Linking.openURL(`https://wa.me/55${phone}?text=${msg}`).catch(() => {});
    }
  };

  const materialsCount = order.materials?.length ?? 0;
  const hasSaleValue = order.saleValue != null && Number(order.saleValue) > 0;

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <View style={styles.cardInner}>
        {/* Linha Superior: Clicável para abrir os detalhes da OS */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver ordem de serviço OS #${formatQuoteCode(order.code)} de ${order.client?.name ?? 'cliente não informado'}, status ${statusCfg.label}`}
          onPress={onPress}
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
                {order.client?.name ?? 'Cliente não informado'}
              </Text>
              <View style={styles.codeAndMetaRow}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>OS #{formatQuoteCode(order.code)}</Text>
                </View>

                {order.quote?.quoteNumber ? (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <View style={styles.quoteTag}>
                      <Ionicons name="receipt-outline" size={10} color={colors.textSecondary} />
                      <Text style={styles.quoteTagText}>
                        Orç. #{formatQuoteCode(order.quote.quoteNumber)}
                      </Text>
                    </View>
                  </>
                ) : null}

                {order.work?.name ? (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.workText} numberOfLines={1}>
                      {order.work.name}
                    </Text>
                  </>
                ) : null}

                {order.scheduledDate ? (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.dateText}>
                      Prev. {formatDateBr(order.scheduledDate)}
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

        {/* Linha Inferior: Valor Total Fechado + Materiais + Ações Rápidas */}
        <View style={styles.cardBottomRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Valor do serviço: ${hasSaleValue ? formatCurrency(Number(order.saleValue)) : 'A definir'}`}
            onPress={onPress}
            style={({ pressed }) => [
              styles.valueGroup,
              pressed && { opacity: 0.75 },
            ]}
          >
            {hasSaleValue ? (
              <>
                <Text style={styles.cardTotal}>
                  {formatCurrency(Number(order.saleValue))}
                </Text>
                <Text style={styles.valueLabel}>Valor fechado</Text>
              </>
            ) : (
              <Text style={[styles.cardTotal, { fontSize: 13, color: colors.textSecondary }]}>
                {order.completedDate ? `Concluída em ${formatDateBr(order.completedDate)}` : 'Sem valor registrado'}
              </Text>
            )}
          </Pressable>

          {/* Ações e Metadados à Direita (fora do Pressable para evitar aninhamento de botões) */}
          <View style={styles.actionsGroup}>
            {materialsCount > 0 ? (
              <View style={styles.materialsChip}>
                <Ionicons name="cube-outline" size={11} color={colors.textSecondary} />
                <Text style={styles.materialsChipText}>
                  {materialsCount} {materialsCount === 1 ? 'item' : 'itens'}
                </Text>
              </View>
            ) : null}

            {order.client?.phone ? (
              <TouchableOpacity
                style={[styles.iconActionBtn, styles.whatsappBtn]}
                onPress={handleOpenWhatsApp}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Conversar com ${order.client.name} no WhatsApp`}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#25D366" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Ver detalhes da ordem de serviço"
            >
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppCard>
  );
}

// ─── Screen Principal ───────────────────────────────────────────────────────

type FilterType = 'TODAS' | 'EM_ANDAMENTO' | 'PENDENTES' | 'PAUSADAS' | 'CONCLUIDAS';

export default function ServicosScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createServicosStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'service-orders'],
    queryFn: () => serviceOrdersService.list(),
    select: (result) => toArray<ServiceOrder>(result),
    enabled: Boolean(companyId),
  });

  // Métricas para os KPIs do Topo
  const metrics = useMemo(() => {
    if (!orders) return { total: 0, emAndamento: 0, pendentes: 0, pausadas: 0, concluidas: 0 };
    return {
      total: orders.length,
      emAndamento: orders.filter((o) => o.status === 'EM_ANDAMENTO' || o.status === 'EM_DESLOCAMENTO').length,
      pendentes: orders.filter((o) => o.status === 'PENDENTE').length,
      pausadas: orders.filter((o) => o.status === 'PAUSADA').length,
      concluidas: orders.filter((o) => o.status === 'CONCLUIDA').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchFilter =
        selectedFilter === 'TODAS' ||
        (selectedFilter === 'EM_ANDAMENTO' &&
          (o.status === 'EM_ANDAMENTO' || o.status === 'EM_DESLOCAMENTO')) ||
        (selectedFilter === 'PENDENTES' && o.status === 'PENDENTE') ||
        (selectedFilter === 'PAUSADAS' && o.status === 'PAUSADA') ||
        (selectedFilter === 'CONCLUIDAS' && o.status === 'CONCLUIDA');

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.client?.name?.toLowerCase().includes(q) ||
        o.work?.name?.toLowerCase().includes(q) ||
        String(o.code).includes(q) ||
        (o.quote?.quoteNumber && String(o.quote.quoteNumber).includes(q));

      return matchFilter && matchSearch;
    });
  }, [orders, selectedFilter, searchQuery]);

  const filterTabs: Array<{ key: FilterType; label: string; count: number }> = [
    { key: 'TODAS', label: 'Todas', count: metrics.total },
    { key: 'EM_ANDAMENTO', label: 'Em Andamento', count: metrics.emAndamento },
    { key: 'PENDENTES', label: 'Pendentes', count: metrics.pendentes },
    { key: 'PAUSADAS', label: 'Pausadas', count: metrics.pausadas },
    { key: 'CONCLUIDAS', label: 'Concluídas', count: metrics.concluidas },
  ];

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Ordens de Serviço', headerShown: false }} />

      <View style={styles.headerWrapper}>
        {/* Cabeçalho Emoldurado */}
        <View style={styles.topBar}>
          <View style={styles.titleSection}>
            <View style={styles.titleIconBadge}>
              <Ionicons name="construct" size={20} color={colors.primary} />
            </View>
            <Text style={styles.title}>Ordens de Serviço</Text>
            <View style={styles.titleCountBadge}>
              <Text style={styles.titleCountText}>
                {metrics.total} {metrics.total === 1 ? 'ordem' : 'ordens'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          Execução e acompanhamento operacional dos orçamentos aprovados
        </Text>

        <View style={styles.headerDivider} />

        {/* KPIs Slim no Topo */}
        <View style={styles.kpiStrip}>
          <View style={styles.kpiItem}>
            <View style={[styles.kpiDot, { backgroundColor: '#3B82F6' }]} />
            <View style={styles.kpiContent}>
              <Text style={styles.kpiCount}>{metrics.emAndamento}</Text>
              <Text style={styles.kpiLabel}>Em andamento</Text>
            </View>
          </View>

          <View style={styles.kpiItem}>
            <View style={[styles.kpiDot, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.kpiContent}>
              <Text style={styles.kpiCount}>{metrics.pendentes}</Text>
              <Text style={styles.kpiLabel}>Pendentes</Text>
            </View>
          </View>

          <View style={styles.kpiItem}>
            <View style={[styles.kpiDot, { backgroundColor: '#10B981' }]} />
            <View style={styles.kpiContent}>
              <Text style={styles.kpiCount}>{metrics.concluidas}</Text>
              <Text style={styles.kpiLabel}>Concluídas</Text>
            </View>
          </View>
        </View>

        {/* Barra de Busca Rápida */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, obra, código OS ou orçamento..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filtros em Pílulas com Contadores */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterTabs.map((tab) => {
            const isActive = selectedFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(tab.key)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${tab.label}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                  <Text
                    style={[
                      styles.filterBadgeText,
                      isActive && styles.filterBadgeTextActive,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Conteúdo Principal */}
      {isLoading ? (
        <LoadingState text="Carregando ordens de serviço..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Nenhum serviço encontrado' : 'Nenhuma ordem de serviço'}
          description={
            searchQuery
              ? 'Tente buscar com outro termo, código ou nome de cliente'
              : 'As ordens de serviço são geradas automaticamente a partir dos orçamentos aprovados.'
          }
          icon="construct-outline"
          actionLabel="Ver orçamentos"
          onAction={() => router.push('/(tabs)/orcamentos')}
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceOrderCard
              order={item}
              onPress={() => router.push(`/servicos/${item.id}`)}
              styles={styles}
              colors={colors}
              isDark={isDark}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}
