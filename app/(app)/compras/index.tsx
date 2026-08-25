import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { purchaseOrdersService } from '../../../src/services/api/purchaseOrders';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { PurchaseOrder, PurchaseOrderStatus } from '../../../src/types/purchaseOrder';
import { formatCurrency } from '../../../src/utils/format';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real pode retornar array puro em GET /purchase-orders (Prisma findMany),
 * enquanto o tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const PO_STATUS_BADGE: Record<
  PurchaseOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  DRAFT: { variant: 'cancelled', label: 'Rascunho' },
  ORDERED: { variant: 'info', label: 'Encomendado' },
  RECEIVED: { variant: 'active', label: 'Recebido' },
  CANCELLED: { variant: 'cancelled', label: 'Cancelado' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

// ─── Badge de status do pedido ──────────────────────────────────────────────

/**
 * DRAFT usa um pill cinza (o StatusBadge não tem variante cinza);
 * os demais reutilizam o StatusBadge padrão.
 */
function PoStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  if (status === 'DRAFT') {
    return (
      <View style={styles.draftBadge}>
        <Text style={styles.draftBadgeText}>Rascunho</Text>
      </View>
    );
  }
  const badge = PO_STATUS_BADGE[status];
  return <StatusBadge status={badge.variant} label={badge.label} size="sm" />;
}

// ─── Card de pedido de compra ───────────────────────────────────────────────

interface PurchaseOrderCardProps {
  order: PurchaseOrder;
}

function PurchaseOrderCard({ order }: PurchaseOrderCardProps) {
  const itemCount = order.items?.length ?? 0;

  return (
    <AppCard shadow="light" radius={radius.md} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardIcon}>
          <Ionicons
            name="cart-outline"
            size={sizes.icon.md}
            color={colors.primary}
            accessibilityElementsHidden
          />
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              #{order.id}
            </Text>
            <PoStatusBadge status={order.status} />
          </View>

          <View style={styles.cardRow}>
            <Ionicons
              name="business-outline"
              size={sizes.icon.sm}
              color={colors.textSecondary}
              accessibilityElementsHidden
            />
            <Text style={styles.cardText} numberOfLines={1}>
              {order.supplierName?.trim() || 'Fornecedor não informado'}
            </Text>
          </View>

          <View style={styles.cardRow}>
            <Ionicons
              name="calendar-outline"
              size={sizes.icon.sm}
              color={colors.textSecondary}
              accessibilityElementsHidden
            />
            <Text style={styles.cardText} numberOfLines={1}>
              {formatDate(order.createdAt) || 'Data não informada'}
              {itemCount > 0
                ? ` · ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`
                : ''}
            </Text>
          </View>

          <Text style={styles.cardAmount}>{formatCurrency(order.total)}</Text>
        </View>
      </View>
    </AppCard>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ComprasScreen() {
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
    queryKey: ['company', companyId, 'purchase-orders'],
    queryFn: () => purchaseOrdersService.list(),
    select: (result) => toArray<PurchaseOrder>(result),
    enabled: Boolean(companyId),
  });

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Compras', headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.title}>Compras</Text>
        <AppButton
          title="+"
          size="md"
          accessibilityLabel="Novo pedido de compra"
          onPress={() => router.push('/compras/novo')}
          style={styles.addButton}
        />
      </View>

      {isLoading ? (
        <LoadingState text="Carregando pedidos de compra..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : orders && orders.length === 0 ? (
        <EmptyState
          title="Nenhum pedido de compra"
          description="Comece criando seu primeiro pedido de compra"
          icon="cart-outline"
          actionLabel="Novo pedido"
          onAction={() => router.push('/compras/novo')}
        />
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PurchaseOrderCard order={item} />}
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
  cardAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  draftBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.disabledBackground,
  },
  draftBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
});
