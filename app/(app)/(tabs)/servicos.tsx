import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { serviceOrdersService } from '../../../src/services/api/serviceOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { ServiceOrder, ServiceOrderStatus } from '../../../src/types/serviceOrder';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

/**
 * A API real retorna array puro em GET /service-orders (Prisma findMany),
 * enquanto o tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

// ─── Card de ordem de serviço ───────────────────────────────────────────────

interface ServiceOrderCardProps {
  order: ServiceOrder;
  onPress: () => void;
}

function ServiceOrderCard({ order, onPress }: ServiceOrderCardProps) {
  const badge = SERVICE_ORDER_STATUS_BADGE[order.status];

  return (
    <AppCard shadow="light" style={styles.card}>
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

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ServicosScreen() {
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
    queryKey: ['company', companyId, 'service-orders'],
    queryFn: () => serviceOrdersService.list(),
    select: (result) => toArray<ServiceOrder>(result),
    enabled: Boolean(companyId),
  });

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Serviços', headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.title}>Serviços</Text>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando ordens de serviço..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : orders && orders.length === 0 ? (
        <EmptyState
          title="Nenhuma ordem de serviço"
          description="Ordens de serviço são geradas automaticamente a partir de orçamentos aprovados"
          icon="hammer-outline"
          actionLabel="Ver orçamentos"
          onAction={() => router.push('/orcamentos')}
        />
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceOrderCard
              order={item}
              onPress={() => router.push(`/servicos/${item.id}`)}
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
  cardMaterials: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});