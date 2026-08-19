import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppInput } from '../../../src/components/ui/AppInput';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { paymentsService } from '../../../src/services/api/payments';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';
import type { Payment, PaymentMethod, PaymentStatus } from '../../../src/types/finance';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real retorna array puro em GET /payments (Prisma findMany),
 * enquanto o tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const PAYMENT_STATUS_BADGE: Record<
  PaymentStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  CONFIRMADO: { variant: 'active', label: 'Confirmado' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
  CHEQUE: 'Cheque',
  OUTRO: 'Outro',
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

// ─── Card de pagamento ──────────────────────────────────────────────────────

interface PaymentCardProps {
  payment: Payment;
  onPress: () => void;
}

function PaymentCard({ payment, onPress }: PaymentCardProps) {
  const badge = PAYMENT_STATUS_BADGE[payment.status];

  return (
    <AppCard shadow="light" radius={radius.md} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver pagamento de ${payment.client?.name ?? 'cliente'}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="wallet-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {payment.client?.name ?? 'Cliente não informado'}
              </Text>
              <StatusBadge status={badge.variant} label={badge.label} size="sm" />
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="swap-horizontal-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardText} numberOfLines={1}>
                {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                {payment.paymentDate ? ` · ${formatDate(payment.paymentDate)}` : ''}
              </Text>
            </View>

            <Text style={styles.cardAmount}>{formatCurrency(payment.amount)}</Text>
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

export default function PagamentosScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [search, setSearch] = useState('');

  const {
    data: payments,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'payments'],
    queryFn: () => paymentsService.list(),
    select: (result) => toArray<Payment>(result),
    enabled: Boolean(companyId),
  });

  // Busca client-side por cliente, método ou status (a API não expõe ?search=).
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments ?? [];
    return (payments ?? []).filter((payment) => {
      const clientName = payment.client?.name?.toLowerCase() ?? '';
      const methodLabel = PAYMENT_METHOD_LABELS[payment.paymentMethod].toLowerCase();
      const statusLabel = PAYMENT_STATUS_BADGE[payment.status].label.toLowerCase();
      return (
        clientName.includes(term) ||
        methodLabel.includes(term) ||
        statusLabel.includes(term)
      );
    });
  }, [payments, search]);

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Pagamentos', headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.title}>Pagamentos</Text>
        <TouchableOpacity
          onPress={() => router.push('/pagamentos/novo')}
          accessibilityRole="button"
          accessibilityLabel="Novo pagamento"
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.lg} color={colors.white} accessibilityElementsHidden />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <AppInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por cliente, método ou status"
          accessibilityLabel="Buscar pagamentos"
          autoCapitalize="none"
          autoCorrect={false}
          leftAccessory={
            <Ionicons
              name="search"
              size={sizes.icon.md}
              color={colors.textLight}
              accessibilityElementsHidden
            />
          }
        />
      </View>

      {isLoading ? (
        <LoadingState text="Carregando pagamentos..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        search.trim() ? (
          <EmptyState
            title="Nenhum pagamento encontrado"
            description={`Nenhum resultado para "${search.trim()}". Tente outro termo.`}
            icon="search-outline"
          />
        ) : (
          <EmptyState
            title="Nenhum pagamento"
            description="Comece registrando um pagamento recebido"
            icon="card-outline"
            actionLabel="Novo pagamento"
            onAction={() => router.push('/pagamentos/novo')}
          />
        )
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              onPress={() => router.push(`/pagamentos/${item.id}`)}
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
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: sizes.screenPadding,
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
  cardAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
});
