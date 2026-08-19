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
import { expensesService } from '../../../src/services/api/expenses';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { Expense, ExpenseCategory } from '../../../src/types/finance';
import { formatCurrency } from '../../../src/utils/format';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORY_BADGE: Record<
  ExpenseCategory,
  { variant: StatusBadgeVariant; label: string }
> = {
  MATERIAL: { variant: 'active', label: 'Material' },
  MAO_DE_OBRA: { variant: 'warning', label: 'Mão de obra' },
  TRANSPORTE: { variant: 'suspended', label: 'Transporte' },
  ALUGUEL: { variant: 'expired', label: 'Aluguel' },
  ENERGIA: { variant: 'warning', label: 'Energia' },
  AGUA: { variant: 'active', label: 'Água' },
  INTERNET: { variant: 'active', label: 'Internet' },
  TELEFONE: { variant: 'active', label: 'Telefone' },
  MARKETING: { variant: 'suspended', label: 'Marketing' },
  IMPOSTOS: { variant: 'cancelled', label: 'Impostos' },
  OUTROS: { variant: 'expired', label: 'Outros' },
};

/**
 * A API real retorna array puro em GET /expenses (Prisma findMany),
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

// ─── Card de despesa ────────────────────────────────────────────────────────

interface ExpenseCardProps {
  expense: Expense;
  onPress: () => void;
}

function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const badge = EXPENSE_CATEGORY_BADGE[expense.category];

  return (
    <AppCard shadow="light" radius={radius.md} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver despesa ${expense.description}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="receipt-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {expense.description}
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
                {formatDate(expense.expenseDate)}
              </Text>
            </View>

            <Text style={styles.cardAmount}>{formatCurrency(expense.amount)}</Text>
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

export default function DespesasScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [search, setSearch] = useState('');

  const {
    data: expenses,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'expenses'],
    queryFn: () => expensesService.list(),
    select: (result) => toArray<Expense>(result),
    enabled: Boolean(companyId),
  });

  // Busca client-side por descrição ou categoria (a API não expõe ?search=).
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return expenses ?? [];
    return (expenses ?? []).filter((expense) => {
      const description = expense.description.toLowerCase();
      const categoryLabel = EXPENSE_CATEGORY_BADGE[expense.category].label.toLowerCase();
      return description.includes(term) || categoryLabel.includes(term);
    });
  }, [expenses, search]);

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Despesas', headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.title}>Despesas</Text>
        <TouchableOpacity
          onPress={() => router.push('/despesas/novo')}
          accessibilityRole="button"
          accessibilityLabel="Nova despesa"
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.lg} color={colors.white} accessibilityElementsHidden />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <AppInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por descrição ou categoria"
          accessibilityLabel="Buscar despesas"
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
        <LoadingState text="Carregando despesas..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        search.trim() ? (
          <EmptyState
            title="Nenhuma despesa encontrada"
            description={`Nenhum resultado para "${search.trim()}". Tente outro termo.`}
            icon="search-outline"
          />
        ) : (
          <EmptyState
            title="Nenhuma despesa"
            description="Comece registrando sua primeira despesa"
            icon="wallet-outline"
            actionLabel="Nova despesa"
            onAction={() => router.push('/despesas/novo')}
          />
        )
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseCard
              expense={item}
              onPress={() => router.push(`/despesas/${item.id}`)}
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
    color: colors.text,
  },
});
