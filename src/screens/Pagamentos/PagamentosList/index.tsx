import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { paymentsService } from '@/src/services/api/payments';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '@/src/types/finance';
import { formatCurrency } from '@/src/utils/format';
import { createPagamentosStyles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type PaymentFilter = 'TODOS' | 'PENDENTE' | 'CONFIRMADO' | 'VENCIDO';

const PAYMENT_FILTERS: { id: PaymentFilter; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PENDENTE', label: 'Pendentes' },
  { id: 'CONFIRMADO', label: 'Confirmados' },
  { id: 'VENCIDO', label: 'Vencidos' },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  TRANSFERENCIA: 'Transferência',
  DINHEIRO: 'Dinheiro',
  CHEQUE: 'Cheque',
  OUTRO: 'Outro',
};

const PAYMENT_STATUS_BADGE: Record<
  PaymentStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'warning', label: 'Pendente' },
  CONFIRMADO: { variant: 'active', label: 'Confirmado' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

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

function isOverdue(payment: Payment): boolean {
  if (payment.status !== 'PENDENTE') return false;
  if (!payment.dueDate) return false;
  const due = new Date(payment.dueDate);
  const now = new Date();
  return due.getTime() < now.getTime();
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  valueColor: string;
  styles: ReturnType<typeof createPagamentosStyles>;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  valueColor,
  styles,
}: SummaryCardProps) {
  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.metricCard}>
      <View style={[styles.metricIconContainer, { backgroundColor: iconBackground }]}>
        <Ionicons
          name={icon}
          size={sizes.icon.sm}
          color={iconColor}
          accessibilityElementsHidden
        />
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </AppCard>
  );
}

interface PaymentCardProps {
  payment: Payment;
  styles: ReturnType<typeof createPagamentosStyles>;
  colors: ActivePalette;
  onPress: () => void;
}

function PaymentCard({ payment, styles, colors, onPress }: PaymentCardProps) {
  const overdue = isOverdue(payment);
  const badge = PAYMENT_STATUS_BADGE[payment.status];

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
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
          <View style={[styles.cardIcon, overdue && { backgroundColor: colors.dangerSoft }]}>
            <Ionicons
              name={overdue ? 'alert-circle-outline' : 'card-outline'}
              size={sizes.icon.md}
              color={overdue ? colors.danger : colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {payment.client?.name ?? 'Cliente não informado'}
              </Text>
              {overdue ? (
                <StatusBadge status="expired" label="Vencido" size="sm" />
              ) : (
                <StatusBadge status={badge.variant} label={badge.label} size="sm" />
              )}
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="pricetag-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardText} numberOfLines={1}>
                {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
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
                  {overdue ? 'Vencido em ' : 'Vence em '}
                  {formatDate(payment.dueDate)}
                </Text>
              </View>
            ) : null}

            <Text
              style={[styles.cardAmount, overdue && styles.cardAmountOverdue]}
            >
              {formatCurrency(payment.amount)}
            </Text>
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

export default function PagamentosScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createPagamentosStyles(colors, isDark), [colors, isDark]);

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

  const {
    toReceive,
    receivedThisMonth,
    overdueTotal,
    pendingPayments,
    confirmedPayments,
    overduePayments,
    upcoming,
  } = useMemo(() => {
    if (!payments) {
      return {
        toReceive: 0,
        receivedThisMonth: 0,
        overdueTotal: 0,
        pendingPayments: [] as Payment[],
        confirmedPayments: [] as Payment[],
        overduePayments: [] as Payment[],
        upcoming: [] as Payment[],
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let toRec = 0;
    let recMonth = 0;
    let overTotal = 0;

    const pending: Payment[] = [];
    const confirmed: Payment[] = [];
    const overdueList: Payment[] = [];

    for (const p of payments) {
      if (p.status === 'PENDENTE') {
        pending.push(p);
        toRec += p.amount;
        if (isOverdue(p)) {
          overdueList.push(p);
          overTotal += p.amount;
        }
      } else if (p.status === 'CONFIRMADO') {
        confirmed.push(p);
        if (p.paymentDate) {
          const paidDate = new Date(p.paymentDate);
          if (
            paidDate.getMonth() === currentMonth &&
            paidDate.getFullYear() === currentYear
          ) {
            recMonth += p.amount;
          }
        }
      }
    }

    const upcomingList = pending
      .filter((p) => Boolean(p.dueDate))
      .sort((a, b) => {
        const da = new Date(a.dueDate!).getTime();
        const db = new Date(b.dueDate!).getTime();
        return da - db;
      })
      .slice(0, 5);

    return {
      toReceive: toRec,
      receivedThisMonth: recMonth,
      overdueTotal: overTotal,
      pendingPayments: pending,
      confirmedPayments: confirmed,
      overduePayments: overdueList,
      upcoming: upcomingList,
    };
  }, [payments]);

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
      const methodLabel = PAYMENT_METHOD_LABELS[payment.paymentMethod]?.toLowerCase() ?? '';
      const statusLabel = PAYMENT_STATUS_BADGE[payment.status]?.label?.toLowerCase() ?? '';
      return (
        clientName.includes(term) ||
        methodLabel.includes(term) ||
        statusLabel.includes(term)
      );
    });
  }, [payments, search, filter]);

  const listHeader = (
    <>
      <View style={styles.metricsRow}>
        <SummaryCard
          title="A receber"
          value={formatCurrency(toReceive)}
          subtitle={`${pendingPayments.length} ${pluralize(
            pendingPayments.length,
            'pendente',
            'pendentes'
          )}`}
          icon="cash-outline"
          iconBackground={colors.warningSoft}
          iconColor={colors.warning}
          valueColor={colors.warning}
          styles={styles}
        />

        <SummaryCard
          title="Recebido"
          value={formatCurrency(receivedThisMonth)}
          subtitle={`${confirmedPayments.length} ${pluralize(
            confirmedPayments.length,
            'confirmado',
            'confirmados'
          )}`}
          icon="checkmark-circle-outline"
          iconBackground={colors.successSoft}
          iconColor={colors.success}
          valueColor={colors.success}
          styles={styles}
        />

        <SummaryCard
          title="Vencido"
          value={formatCurrency(overdueTotal)}
          subtitle={`${overduePayments.length} ${pluralize(
            overduePayments.length,
            'vencido',
            'vencidos'
          )}`}
          icon="alert-circle-outline"
          iconBackground={colors.dangerSoft}
          iconColor={colors.danger}
          valueColor={colors.danger}
          styles={styles}
        />
      </View>

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
                      {formatDate(payment.dueDate!)}
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
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pagamentos</Text>
          <Text style={styles.subtitle}>Recebimentos e faturamento</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/pagamentos/novo')}
          accessibilityRole="button"
          accessibilityLabel="Novo pagamento"
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.md} color={colors.textOnPrimary} accessibilityElementsHidden />
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
              color={colors.textSecondary}
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
              styles={styles}
              colors={colors}
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
