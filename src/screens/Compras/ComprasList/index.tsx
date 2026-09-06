import { BackButton } from '@/src/components/navigation/BackButton';
import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  Text,
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
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { purchaseOrdersService } from '@/src/services/api/purchaseOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/src/types/purchaseOrder';
import { formatCurrency } from '@/src/utils/format';
import { createComprasStyles } from './styles';

function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const PURCHASE_STATUS_BADGE: Record<
  PurchaseOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  DRAFT: { variant: 'expired', label: 'Rascunho' },
  ORDERED: { variant: 'warning', label: 'Enviado' },
  RECEIVED: { variant: 'active', label: 'Recebido' },
  CANCELLED: { variant: 'cancelled', label: 'Cancelado' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

function PurchaseOrderCard({
  order,
  styles,
  colors,
}: {
  order: PurchaseOrder;
  styles: ReturnType<typeof createComprasStyles>;
  colors: ActivePalette;
}) {
  const badge = PURCHASE_STATUS_BADGE[order.status] || { variant: 'expired', label: 'Rascunho' };

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
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
              {order.supplierName ?? 'Fornecedor não informado'}
            </Text>
            <StatusBadge status={badge.variant} label={badge.label} size="sm" />
          </View>

          <View style={styles.cardRow}>
            <Ionicons
              name="calendar-outline"
              size={sizes.icon.sm}
              color={colors.textSecondary}
              accessibilityElementsHidden
            />
            <Text style={styles.cardText} numberOfLines={1}>
              {formatDate(order.createdAt)}
            </Text>
          </View>

          <Text style={styles.cardAmount}>{formatCurrency(order.total)}</Text>
        </View>
      </View>
    </AppCard>
  );
}

export default function ComprasScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createComprasStyles(colors, isDark), [colors, isDark]);

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
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton fallback="/(app)/(tabs)/mais" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Compras</Text>
            <Text style={styles.subtitle}>Pedidos de compra para fornecedores</Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Novo pedido de compra"
          onPress={() => router.push('/compras/novo')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.md} color={colors.textOnPrimary} accessibilityElementsHidden />
        </TouchableOpacity>
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
          renderItem={({ item }) => (
            <PurchaseOrderCard
              order={item}
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
