import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { toApiError } from '../../../src/services/api/client';
import { agendaService } from '../../../src/services/api/agenda';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { AgendaItem, AgendaItemType } from '../../../src/types/agenda';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Helpers ────────────────────────────────────────────────────────────────

type AgendaFilter = 'HOJE' | 'AMANHA' | 'SEMANA';

const FILTERS: Array<{ id: AgendaFilter; label: string }> = [
  { id: 'HOJE', label: 'Hoje' },
  { id: 'AMANHA', label: 'Amanhã' },
  { id: 'SEMANA', label: 'Semana' },
];

const AGENDA_TYPE_CONFIG: Record<
  AgendaItemType,
  { label: string; icon: IconName; backgroundColor: string; color: string }
> = {
  VISITA: { label: 'Visita', icon: 'eye-outline', backgroundColor: colors.primarySoft, color: colors.primary },
  MEDICAO: { label: 'Medição', icon: 'resize-outline', backgroundColor: colors.infoSoft, color: colors.info },
  INICIO: { label: 'Início', icon: 'flag-outline', backgroundColor: colors.successSoft, color: colors.success },
  INSTALACAO: { label: 'Instalação', icon: 'hammer-outline', backgroundColor: colors.primarySoft, color: colors.primary },
  PRODUCAO: { label: 'Produção', icon: 'layers-outline', backgroundColor: colors.warningSoft, color: colors.warning },
  RETORNO: { label: 'Retorno', icon: 'return-up-back-outline', backgroundColor: colors.infoSoft, color: colors.info },
  ACABAMENTO: { label: 'Acabamento', icon: 'sparkles-outline', backgroundColor: colors.successSoft, color: colors.success },
  ENTREGA: { label: 'Entrega', icon: 'cube-outline', backgroundColor: colors.warningSoft, color: colors.warning },
  COBRANCA: { label: 'Cobrança', icon: 'receipt-outline', backgroundColor: colors.dangerSoft, color: colors.danger },
  OUTRO: { label: 'Outro', icon: 'calendar-outline', backgroundColor: colors.disabledBackground, color: colors.textSecondary },
};

/** Chave de data local (YYYY-MM-DD). */
function toLocalDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function formatSectionLabel(dateKey: string, todayKey: string, tomorrowKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  if (dateKey === todayKey) return `Hoje · ${formatted}`;
  if (dateKey === tomorrowKey) return `Amanhã · ${formatted}`;
  return formatted;
}

// ─── Card de compromisso ───────────────────────────────────────────────────

interface AgendaCardProps {
  item: AgendaItem;
  onPress: () => void;
}

function AgendaCard({ item, onPress }: AgendaCardProps) {
  const config = AGENDA_TYPE_CONFIG[item.type];

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${config.label} — ${item.clientName}`}
        onPress={onPress}
        style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTime}>{item.time ?? '—'}</Text>

          <View style={[styles.cardIcon, { backgroundColor: config.backgroundColor }]}>
            <Ionicons
              name={config.icon}
              size={sizes.icon.md}
              color={config.color}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {config.label}
            </Text>
            <View style={styles.cardRow}>
              <Ionicons
                name="person-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardText} numberOfLines={1}>
                {item.clientName}
              </Text>
            </View>
            {item.title !== config.label ? (
              <Text style={styles.cardReference} numberOfLines={1}>
                {item.title}
              </Text>
            ) : null}
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

type Row =
  | { kind: 'header'; id: string; label: string }
  | { kind: 'item'; id: string; item: AgendaItem };

export default function AgendaScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [filter, setFilter] = useState<AgendaFilter>('HOJE');

  const {
    data: items,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'agenda'],
    queryFn: () => agendaService.list(),
    enabled: Boolean(companyId),
  });

  const rows = useMemo<Row[]>(() => {
    if (!items) return [];

    const today = new Date();
    const todayKey = toLocalDateKey(today);
    const tomorrowKey = toLocalDateKey(addDays(today, 1));
    const weekEndKey = toLocalDateKey(addDays(today, 6));

    const filtered = items.filter((item) => {
      if (filter === 'HOJE') return item.date === todayKey;
      if (filter === 'AMANHA') return item.date === tomorrowKey;
      return item.date >= todayKey && item.date <= weekEndKey;
    });

    const groups = new Map<string, AgendaItem[]>();
    for (const item of filtered) {
      const group = groups.get(item.date) ?? [];
      group.push(item);
      groups.set(item.date, group);
    }

    const result: Row[] = [];
    for (const [dateKey, group] of Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))) {
      result.push({
        kind: 'header',
        id: `header-${dateKey}`,
        label: formatSectionLabel(dateKey, todayKey, tomorrowKey),
      });
      for (const item of group) {
        result.push({ kind: 'item', id: item.id, item });
      }
    }
    return result;
  }, [items, filter]);

  const handlePress = (item: AgendaItem) => {
    if (item.source === 'QUOTE') {
      router.push(`/orcamentos/${item.sourceId}`);
    } else {
      router.push(`/servicos/${item.sourceId}`);
    }
  };

  const emptyDescription =
    filter === 'HOJE'
      ? 'Nenhum compromisso agendado para hoje'
      : filter === 'AMANHA'
        ? 'Nenhum compromisso agendado para amanhã'
        : 'Nenhum compromisso agendado para os próximos 7 dias';

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <View style={styles.filters}>
        {FILTERS.map((option) => {
          const selected = option.id === filter;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${option.label}`}
              accessibilityState={{ selected }}
              onPress={() => setFilter(option.id)}
              style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <LoadingState text="Carregando agenda..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhum compromisso agendado"
          description={emptyDescription}
          icon="calendar-outline"
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.id}
          renderItem={({ item: row }) =>
            row.kind === 'header' ? (
              <Text style={styles.sectionHeader}>{row.label}</Text>
            ) : (
              <AgendaCard item={row.item} onPress={() => handlePress(row.item)} />
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
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
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
  listContent: {
    padding: sizes.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing['3xl'],
  },
  sectionHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
  cardTime: {
    minWidth: 44,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
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
  cardReference: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
});