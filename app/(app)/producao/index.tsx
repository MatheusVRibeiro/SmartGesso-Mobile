import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { productionOrdersService } from '../../../src/services/api/productionOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { ProductionOrder, ProductionOrderStatus } from '../../../src/types/serviceOrder';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real retorna array puro em GET /production-orders (Prisma findMany),
 * enquanto o tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const PRODUCTION_STATUS_BADGE: Record<
  ProductionOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_PRODUCAO: { variant: 'warning', label: 'Em produção' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

// ─── Card de ordem de produção ──────────────────────────────────────────────

interface ProductionOrderCardProps {
  order: ProductionOrder;
  onPress: () => void;
}

function ProductionOrderCard({ order, onPress }: ProductionOrderCardProps) {
  const badge = PRODUCTION_STATUS_BADGE[order.status];

  return (
    <AppCard shadow="light" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ordem de produção ${order.code}`}
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
                PO #{order.code}
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
                {order.responsiblePerson?.trim() || 'Responsável não informado'}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.cardRow}>
                <Ionicons
                  name="calendar-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.cardDate}>
                  {order.dueDate
                    ? `Prazo: ${formatDate(order.dueDate)}`
                    : 'Sem prazo definido'}
                </Text>
              </View>
              {order.items && order.items.length > 0 ? (
                <Text style={styles.cardItems}>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
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

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ProducaoScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

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
      <Stack.Screen options={{ title: 'Produção', headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.title}>Produção</Text>
        <AppButton
          title="+"
          size="md"
          accessibilityLabel="Nova ordem de produção"
          onPress={() => router.push('/producao/novo')}
          style={styles.addButton}
        />
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  addButton: {
    minWidth: sizes.touchTarget,
    paddingHorizontal: 0,
  },
  listContent: {
    padding: sizes.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing['3xl'],
  },
  card: {
    marginBottom: spacing.md,
  },
  cardPressable: {
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardDate: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  cardItems: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});
