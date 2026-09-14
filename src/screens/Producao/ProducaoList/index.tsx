import { BackButton } from '@/src/components/navigation/BackButton';
import React, { useMemo } from 'react';
import { FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';
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
import { productionOrdersService } from '@/src/services/api/productionOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type { ProductionOrder, ProductionOrderStatus } from '@/src/types/serviceOrder';
import { toArray } from '@/src/utils/toArray';
import { createProducaoStyles } from './styles';

const PRODUCTION_STATUS_BADGE: Record<
  ProductionOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_PRODUCAO: { variant: 'warning', label: 'Em produção' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

function ProductionOrderCard({
  order,
  styles,
  colors,
  onPress,
}: {
  order: ProductionOrder;
  styles: ReturnType<typeof createProducaoStyles>;
  colors: ActivePalette;
  onPress: () => void;
}) {
  const badge = PRODUCTION_STATUS_BADGE[order.status] || { variant: 'expired', label: 'Pendente' };
  const itemsCount = order.items?.length ?? 0;

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ordem de produção ${order.id}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="layers-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {order.client?.name ?? 'Cliente não informado'}
              </Text>
              <StatusBadge status={badge.variant} label={badge.label} size="sm" />
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="document-text-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardText} numberOfLines={1}>
                OP #{order.code}{order.work?.name ? ' • ' + order.work.name : ''}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.cardDate}>{formatDate(order.createdAt)}</Text>
              <Text style={styles.cardItems}>
                {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={sizes.icon.md}
            color={colors.textSecondary}
            accessibilityElementsHidden
          />
        </View>
      </Pressable>
    </AppCard>
  );
}

export default function ProducaoScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createProducaoStyles(colors, isDark), [colors, isDark]);

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'production-orders'],
    queryFn: () => productionOrdersService.list(),
    select: (result) => toArray<ProductionOrder>(result),
    enabled: Boolean(companyId),
  });

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton fallback="/(app)/(tabs)/mais" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Produção</Text>
            <Text style={styles.subtitle}>Ordens de fabricação de placas e perfis</Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Nova ordem de produção"
          onPress={() => router.push('/producao/novo')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.md} color={colors.textOnPrimary} accessibilityElementsHidden />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando ordens de produção..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : orders && orders.length === 0 ? (
        <EmptyState
          title="Nenhuma ordem de produção"
          description="Comece criando sua primeira ordem de produção"
          icon="layers-outline"
          actionLabel="Nova ordem"
          onAction={() => router.push('/producao/novo')}
        />
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductionOrderCard
              order={item}
              styles={styles}
              colors={colors}
              onPress={() => router.push(`/producao/${item.id}`)}
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
