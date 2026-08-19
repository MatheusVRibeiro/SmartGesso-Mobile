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
import type { ComponentProps } from 'react';
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

type IconName = ComponentProps<typeof Ionicons>['name'];

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

/** Chave local de hoje em YYYY-MM-DD (evita offset de UTC do toISOString). */
function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Pagamento PENDENTE com vencimento (dueDate) anterior a hoje. */
function isOverdue(payment: Payment): boolean {
  return (
    payment.status === 'PENDENTE' &&
    Boolean(payment.dueDate) &&
    payment.dueDate!.slice(0, 10) < todayKey()
  );
}

/** Data dentro do mês corrente (usado no card "Recebido no mês"). */
function isInCurrentMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

// ─── Card de resumo (Financeiro consolidado) ─────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  valueColor?: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  valueColor,
}: SummaryCardProps) {
  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.metricCard}>
      <View style={[styles.metricIconContainer, { backgroundColor: iconBackground }]}>
        <Ionicons
          name={icon}
          size={sizes.icon.md}
          color={iconColor}
          accessibilityElementsHidden
        />
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text
        style={[styles.metricValue, valueColor ? { color: valueColor } : undefined]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </AppCard>
  );
}

// ─── Card de pagamento ──────────────────────────────────────────────────────

interface PaymentCardProps {
  payment: Payment;
  onPress: () => void;
}

function PaymentCard({ payment, onPress }: PaymentCardProps) {
  const overdue = isOverdue(payment);
  const badge = overdue
    ? { variant: 'expired' as const, label: 'Vencido' }
    : PAYMENT_STATUS_BADGE[payment.status];

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

            {payment.dueDate ? (
              <View style={styles.cardRow}>
                <Ionicons
                  name="calendar-outline"
                  size={sizes.icon.sm}
                  color={overdue ? colors.danger : colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text
                  style={[styles.cardText, overdue && styles.cardTextOverdue]}
                  numberOfLines={1}
                >
                  Vence em {formatDate(payment.dueDate)}
                </Text>
              </View>
            ) : null}

            <Text
              style={[
                styles.cardAmount,
                overdue && styles.cardAmountOverdue,
              ]}
            >
              {formatCurrency(payment.amount)}
            </Text>
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

// ─── Filtros da lista ───────────────────────────────────────────────────────

type PaymentFilter = 'TODOS' | 'PENDENTE' | 'CONFIRMADO' | 'VENCIDO';

const PAYMENT_FILTERS: { id: PaymentFilter; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PENDENTE', label: 'Pendentes' },
  { id: 'CONFIRMADO', label: 'Recebidos' },
  { id: 'VENCIDO', label: 'Vencidos' },
];

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function PagamentosScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PaymentFilter>('TODOS');

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

  // ── Financeiro consolidado ────────────────────────────────────────────────
  const pendingPayments = useMemo(
    () => (payments ?? []).filter((p) => p.status === 'PENDENTE'),
    [payments]
  );
  const confirmedPayments = useMemo(
    () => (payments ?? []).filter((p) => p.status === 'CONFIRMADO'),
    [payments]
  );
  const overduePayments = useMemo(
    () => pendingPayments.filter(isOverdue),
    [pendingPayments]
  );

  // A receber = soma dos PENDENTE; Recebido no mês = soma dos CONFIRMADO com
  // paymentDate no mês corrente; Vencido = soma dos PENDENTE com dueDate < hoje.
  const toReceive = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const receivedThisMonth = confirmedPayments
    .filter((p) => isInCurrentMonth(p.paymentDate))
    .reduce((sum, p) => sum + p.amount, 0);
  const overdueTotal = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  // Próximos vencimentos: PENDENTE com dueDate, ordenados por vencimento (5).
  const upcoming = useMemo(
    () =>
      pendingPayments
        .filter((p): p is Payment & { dueDate: string } => Boolean(p.dueDate))
        .sort((a, b) =>
          a.dueDate.slice(0, 10).localeCompare(b.dueDate.slice(0, 10))
        )
        .slice(0, 5),
    [pendingPayments]
  );

  // Busca client-side por cliente, método ou status (a API não expõe ?search=),
  // combinada com o filtro de status selecionado.
  const filtered = useMemo(() => {
    const byFilter = (payments ?? []).filter((payment) => {
      if (filter === 'PENDENTE') return payment.status === 'PENDENTE';
      if (filter === 'CONFIRMADO') return payment.status === 'CONFIRMADO';
      if (filter === 'VENCIDO') return isOverdue(payment);
      return true;
    });
    const term = search.trim().toLowerCase();
    if (!term) return byFilter;
    return byFilter.filter((payment) => {
      const clientName = payment.client?.name?.toLowerCase() ?? '';
      const methodLabel = PAYMENT_METHOD_LABELS[payment.paymentMethod].toLowerCase();
      const statusLabel = PAYMENT_STATUS_BADGE[payment.status].label.toLowerCase();
      return (
        clientName.includes(term) ||
        methodLabel.includes(term) ||
        statusLabel.includes(term)
      );
    });
  }, [payments, search, filter]);

  const listHeader = (
    <>
      {/* Cards do financeiro consolidado */}
      <View style={styles.metricsRow}>
        <SummaryCard
          title="A receber"
          value={formatCurrency(toReceive)}
          subtitle={`${pendingPayments.length} ${pluralize(
            pendingPayments.length,
            'pagamento pendente',
            'pagamentos pendentes'
          )}`}
          icon="cash-outline"
          iconBackground={colors.warningSoft}
          iconColor={colors.warning}
          valueColor={colors.warning}
        />

        <SummaryCard
          title="Recebido no mês"
          value={formatCurrency(receivedThisMonth)}
          subtitle={`${confirmedPayments.length} ${pluralize(
            confirmedPayments.length,
            'recebimento confirmado',
            'recebimentos confirmados'
          )}`}
          icon="checkmark-circle-outline"
          iconBackground={colors.successSoft}
          iconColor={colors.success}
          valueColor={colors.success}
        />

        <SummaryCard
          title="Vencido"
          value={formatCurrency(overdueTotal)}
          subtitle={`${overduePayments.length} ${pluralize(
            overduePayments.length,
            'pagamento vencido',
            'pagamentos vencidos'
          )}`}
          icon="alert-circle-outline"
          iconBackground={colors.dangerSoft}
          iconColor={colors.danger}
          valueColor={colors.danger}
        />
      </View>

      {/* Próximos vencimentos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos vencimentos</Text>
        <Text style={styles.sectionSubtitle}>
          Pagamentos pendentes por data de vencimento
        </Text>

        <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
          {upcoming.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum pagamento pendente com vencimento
            </Text>
          ) : (
            upcoming.map((payment, index, array) => {
              const overdue = isOverdue(payment);
              return (
                <Pressable
                  key={payment.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver pagamento de ${payment.client?.name ?? 'cliente'}`}
                  onPress={() => router.push(`/pagamentos/${payment.id}`)}
                  style={({ pressed }) => [
                    styles.listItem,
                    index < array.length - 1 && styles.listItemBorder,
                    pressed && styles.listItemPressed,
                  ]}
                >
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>
                      {payment.client?.name ?? 'Cliente não informado'}
                    </Text>
                    <Text style={styles.listItemDate} numberOfLines={1}>
                      {overdue ? 'Vencido em ' : 'Vence em '}
                      {formatDate(payment.dueDate)}
                    </Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text
                      style={[
                        styles.listItemValue,
                        overdue && styles.listItemValueOverdue,
                      ]}
                    >
                      {formatCurrency(payment.amount)}
                    </Text>
                    {overdue ? (
                      <StatusBadge status="expired" label="Vencido" size="sm" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </AppCard>
      </View>

      {/* Filtros (chips) */}
      <View style={styles.filters}>
        {PAYMENT_FILTERS.map((option) => {
          const selected = option.id === filter;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(option.id)}
              style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );

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
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            search.trim() ? (
              <EmptyState
                title="Nenhum pagamento encontrado"
                description={`Nenhum resultado para "${search.trim()}". Tente outro termo.`}
                icon="search-outline"
              />
            ) : filter !== 'TODOS' ? (
              <EmptyState
                title="Nenhum pagamento neste filtro"
                description="Tente outro filtro ou registre um novo pagamento"
                icon="filter-outline"
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
          }
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
  // Financeiro consolidado — cards
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  // Próximos vencimentos
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    paddingVertical: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listItemPressed: {
    opacity: 0.7,
  },
  listItemContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  listItemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  listItemDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listItemRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  listItemValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  listItemValueOverdue: {
    color: colors.danger,
  },
  // Filtros (chips)
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
  // Card de pagamento
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
  cardTextOverdue: {
    color: colors.danger,
  },
  cardAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
  cardAmountOverdue: {
    color: colors.danger,
  },
});
