import { BackButton } from '@/src/components/navigation/BackButton';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { expensesService } from '@/src/services/api/expenses';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type { Expense, ExpenseCategory } from '@/src/types/finance';
import { formatCurrency } from '@/src/utils/format';
import { createDespesasStyles } from './styles';

type ExpenseFilter = 'TODAS' | 'MATERIAL' | 'MAO_DE_OBRA' | 'TRANSPORTE' | 'OUTROS';

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

function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('pt-BR');
}

interface ExpenseCardProps {
  expense: Expense;
  styles: ReturnType<typeof createDespesasStyles>;
  colors: ActivePalette;
  onPress: () => void;
}

function ExpenseCard({ expense, styles, colors, onPress }: ExpenseCardProps) {
  const badge = EXPENSE_CATEGORY_BADGE[expense.category] ?? {
    variant: 'expired' as const,
    label: expense.category,
  };

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
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
              name="card-outline"
              size={sizes.icon.md}
              color={colors.danger}
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

            <Text style={styles.cardAmount}>- {formatCurrency(expense.amount)}</Text>
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

export default function DespesasScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createDespesasStyles(colors, isDark), [colors, isDark]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseFilter>('TODAS');

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

  const counts = useMemo(() => {
    const list = expenses ?? [];
    return {
      TODAS: list.length,
      MATERIAL: list.filter((e) => e.category === 'MATERIAL').length,
      MAO_DE_OBRA: list.filter((e) => e.category === 'MAO_DE_OBRA').length,
      TRANSPORTE: list.filter((e) => e.category === 'TRANSPORTE').length,
      OUTROS: list.filter(
        (e) => !['MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE'].includes(e.category)
      ).length,
    };
  }, [expenses]);

  const filtered = useMemo(() => {
    const list = expenses ?? [];
    return list.filter((expense) => {
      if (selectedCategory !== 'TODAS') {
        if (selectedCategory === 'OUTROS') {
          if (['MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE'].includes(expense.category)) {
            return false;
          }
        } else if (expense.category !== selectedCategory) {
          return false;
        }
      }

      const term = search.trim().toLowerCase();
      if (!term) return true;
      const description = expense.description.toLowerCase();
      const badge = EXPENSE_CATEGORY_BADGE[expense.category];
      const categoryLabel = badge ? badge.label.toLowerCase() : '';
      return description.includes(term) || categoryLabel.includes(term);
    });
  }, [expenses, search, selectedCategory]);

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton fallback="/(app)/(tabs)/mais" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Despesas</Text>
            <Text style={styles.subtitle}>Custos operacionais e notas</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/despesas/novo')}
          accessibilityRole="button"
          accessibilityLabel="Nova despesa"
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.md} color={colors.textOnPrimary} accessibilityElementsHidden />
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
              color={colors.textSecondary}
              accessibilityElementsHidden
            />
          }
        />
      </View>

      <View style={{ marginVertical: 4 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['TODAS', 'MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'OUTROS'] as const).map((cat) => {
            const isActive = selectedCategory === cat;
            const labelMap: Record<ExpenseFilter, string> = {
              TODAS: 'Todas',
              MATERIAL: 'Materiais',
              MAO_DE_OBRA: 'Mão de obra',
              TRANSPORTE: 'Transporte',
              OUTROS: 'Outros',
            };
            const count = counts[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {labelMap[cat]} {count > 0 ? `(${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando despesas..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        search.trim() || selectedCategory !== 'TODAS' ? (
          <EmptyState
            title="Nenhuma despesa encontrada"
            description={
              search.trim()
                ? `Nenhum resultado para "${search.trim()}". Tente outro termo.`
                : 'Nenhuma despesa para esta categoria.'
            }
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
              styles={styles}
              colors={colors}
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
