import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { serviceOrdersService } from '@/src/services/api/serviceOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes, spacing, typography } from '@/src/theme';
import { toArray } from '@/src/utils/toArray';
import type { ServiceOrder, ServiceOrderStatus } from '@/src/types/serviceOrder';
import { createServicosStyles } from './styles';

const SERVICE_ORDER_STATUS_BADGE: Record<
  ServiceOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_DESLOCAMENTO: { variant: 'info', label: 'Em deslocamento' },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento' },
  PAUSADA: { variant: 'suspended', label: 'Pausada' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

interface ServiceOrderCardProps {
  order: ServiceOrder;
  onPress: () => void;
  styles: ReturnType<typeof createServicosStyles>;
  colors: any;
}

function ServiceOrderCard({ order, onPress, styles, colors }: ServiceOrderCardProps) {
  const badge = SERVICE_ORDER_STATUS_BADGE[order.status];

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ordem de serviço ${order.code}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="hammer-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                OS #{order.code}
              </Text>
              <StatusBadge status={badge.variant} label={badge.label} size="sm" />
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="person-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardText} numberOfLines={1}>
                {order.client?.name ?? 'Cliente não informado'}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.cardDate}>
                {order.scheduledDate
                  ? formatDate(order.scheduledDate)
                  : formatDate(order.createdAt)}
              </Text>
              {order.materials && order.materials.length > 0 ? (
                <Text style={styles.cardMaterials}>
                  {order.materials.length}{' '}
                  {order.materials.length === 1 ? 'material' : 'materiais'}
                </Text>
              ) : null}
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={sizes.icon.md}
            color={colors.textLight}
            accessibilityElementsHidden
          />
        </View>
      </Pressable>
    </AppCard>
  );
}

export default function ServicosScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createServicosStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const [selectedFilter, setSelectedFilter] = useState<'TODAS' | 'EM_ANDAMENTO' | 'PENDENTES' | 'CONCLUIDAS'>('TODAS');
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

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchFilter =
        selectedFilter === 'TODAS' ||
        (selectedFilter === 'EM_ANDAMENTO' && (o.status === 'EM_ANDAMENTO' || o.status === 'EM_DESLOCAMENTO')) ||
        (selectedFilter === 'PENDENTES' && (o.status === 'PENDENTE' || o.status === 'PAUSADA')) ||
        (selectedFilter === 'CONCLUIDAS' && o.status === 'CONCLUIDA');

      const matchSearch =
        !searchQuery.trim() ||
        o.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(o.code).includes(searchQuery);

      return matchFilter && matchSearch;
    });
  }, [orders, selectedFilter, searchQuery]);

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Serviços', headerShown: false }} />

      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Ordens de Serviço</Text>
        </View>

        {/* Busca Rápida */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente ou código..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Chips de Status */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['TODAS', 'EM_ANDAMENTO', 'PENDENTES', 'CONCLUIDAS'] as const).map((fil) => {
            const isActive = selectedFilter === fil;
            const labelMap = {
              TODAS: 'Todas',
              EM_ANDAMENTO: 'Em Andamento',
              PENDENTES: 'Pendentes',
              CONCLUIDAS: 'Concluídas',
            };
            return (
              <TouchableOpacity
                key={fil}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(fil)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {labelMap[fil]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando ordens de serviço..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Nenhum serviço encontrado' : 'Nenhuma ordem de serviço'}
          description={
            searchQuery
              ? 'Tente buscar com outro código ou cliente'
              : 'Ordens de serviço são geradas automaticamente a partir de orçamentos aprovados'
          }
          icon="hammer-outline"
          actionLabel="Ver orçamentos"
          onAction={() => router.push('/orcamentos')}
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
