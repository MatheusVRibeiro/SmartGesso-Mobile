import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { agendaService } from '@/src/services/api/agenda';
import { toApiError } from '@/src/services/api/client';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type { AgendaItem, AgendaItemType } from '@/src/types/agenda';

type AgendaFilter = 'HOJE' | 'AMANHA' | 'SEMANA';
import { createAgendaStyles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

const FILTERS: { id: AgendaFilter; label: string }[] = [
  { id: 'HOJE', label: 'Hoje' },
  { id: 'AMANHA', label: 'Amanhã' },
  { id: 'SEMANA', label: 'Próximos 7 dias' },
];

function getAgendaTypeConfig(type: AgendaItemType, colors: ActivePalette) {
  const configs: Record<
    AgendaItemType,
    { label: string; icon: IconName; backgroundColor: string; color: string }
  > = {
    VISITA: { label: 'Visita Técnica', icon: 'eye-outline', backgroundColor: colors.infoSoft, color: colors.info },
    MEDICAO: { label: 'Medição', icon: 'speedometer-outline', backgroundColor: colors.infoSoft, color: colors.info },
    INICIO: { label: 'Início da Obra', icon: 'play-outline', backgroundColor: colors.primarySoft, color: colors.primary },
    INSTALACAO: { label: 'Instalação', icon: 'hammer-outline', backgroundColor: colors.primarySoft, color: colors.primary },
    PRODUCAO: { label: 'Produção', icon: 'layers-outline', backgroundColor: colors.warningSoft, color: colors.warning },
    RETORNO: { label: 'Retorno', icon: 'return-up-back-outline', backgroundColor: colors.infoSoft, color: colors.info },
    ACABAMENTO: { label: 'Acabamento', icon: 'sparkles-outline', backgroundColor: colors.successSoft, color: colors.success },
    ENTREGA: { label: 'Entrega', icon: 'cube-outline', backgroundColor: colors.warningSoft, color: colors.warning },
    COBRANCA: { label: 'Cobrança', icon: 'receipt-outline', backgroundColor: colors.dangerSoft, color: colors.danger },
    OUTRO: { label: 'Outro', icon: 'calendar-outline', backgroundColor: colors.disabledBackground, color: colors.textSecondary },
  };
  return configs[type] || configs.OUTRO;
}

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
  if (dateKey === todayKey) return `Hoje • ${formatted}`;
  if (dateKey === tomorrowKey) return `Amanhã • ${formatted}`;
  return formatted;
}

interface AgendaCardProps {
  item: AgendaItem;
  styles: ReturnType<typeof createAgendaStyles>;
  colors: ActivePalette;
  onPress: () => void;
}

function AgendaCard({ item, styles, colors, onPress }: AgendaCardProps) {
  const config = getAgendaTypeConfig(item.type, colors);

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
            color={colors.textSecondary}
            accessibilityElementsHidden
          />
        </View>
      </Pressable>
    </AppCard>
  );
}

type Row =
  | { kind: 'header'; id: string; label: string }
  | { kind: 'item'; id: string; item: AgendaItem };

export default function AgendaScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createAgendaStyles(colors, isDark), [colors, isDark]);
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
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.subtitle}>Compromissos, visitas e instalações</Text>
      </View>

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
              <AgendaCard
                item={row.item}
                styles={styles}
                colors={colors}
                onPress={() => handlePress(row.item)}
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
