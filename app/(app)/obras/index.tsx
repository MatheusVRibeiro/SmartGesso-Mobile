import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppInput } from '../../../src/components/ui/AppInput';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { worksService } from '../../../src/services/api/works';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { Work, WorkStatus } from '../../../src/types/work';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real retorna array puro em GET /works (Prisma findMany), enquanto o
 * tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const WORK_STATUS_BADGE: Record<
  WorkStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PLANEJADA: { variant: 'expired', label: 'Planejada' },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

function useDebouncedValue(value: string, delay = 400): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function formatLocation(work: Work): string {
  const parts = [work.city, work.state].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(' - ') : 'Local não informado';
}

// ─── Card de obra ───────────────────────────────────────────────────────────

function WorkCard({ work, onPress }: { work: Work; onPress: () => void }) {
  const badge = WORK_STATUS_BADGE[work.status];

  return (
    <AppCard shadow="light" radius={radius.md} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver obra ${work.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="construct-outline"
                size={sizes.icon.md}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {work.name}
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
                  {work.client?.name ?? 'Cliente não informado'}
                </Text>
              </View>

              <View style={styles.cardRow}>
                <Ionicons
                  name="location-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.cardText} numberOfLines={1}>
                  {formatLocation(work)}
                </Text>
              </View>
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

export default function ObrasListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clientId?: string; clientName?: string }>();
  const clientId = typeof params.clientId === 'string' ? params.clientId : undefined;
  const clientName = typeof params.clientName === 'string' ? params.clientName : undefined;
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const {
    data: works,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'works', debouncedSearch],
    queryFn: () => worksService.list({ search: debouncedSearch || undefined }),
    select: (result) => toArray<Work>(result),
    enabled: Boolean(companyId),
  });

  const filteredWorks = useMemo(() => {
    if (!clientId || !works) return works;
    return works.filter((w) => w.clientId === clientId);
  }, [works, clientId]);

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: clientName ? `Obras de ${clientName}` : 'Obras', headerShown: true }} />

      <View style={styles.header}>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.title}>Obras</Text>
          {clientName ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {clientName}
            </Text>
          ) : null}
        </View>
        <AppButton
          title="+"
          size="md"
          accessibilityLabel="Nova obra"
          onPress={() => router.push('/obras/novo')}
          style={styles.addButton}
        />
      </View>

      <View style={styles.searchWrapper}>
        <AppInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar obras..."
          accessibilityLabel="Buscar obras"
          returnKeyType="search"
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
        <LoadingState text="Carregando obras..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filteredWorks && filteredWorks.length === 0 ? (
        <EmptyState
          title={
            clientId
              ? 'Nenhuma obra para este cliente'
              : debouncedSearch
                ? 'Nenhuma obra encontrada'
                : 'Nenhuma obra cadastrada'
          }
          description={
            clientId
              ? 'Cadastre uma obra vinculando a este cliente'
              : debouncedSearch
                ? 'Tente buscar com outro termo'
                : 'Comece cadastrando sua primeira obra'
          }
          icon="construct-outline"
          actionLabel="Nova obra"
          onAction={() => router.push('/obras/novo')}
        />
      ) : (
        <FlatList
          data={filteredWorks ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkCard
              work={item}
              onPress={() => router.push(`/obras/${item.id}`)}
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
  headerTitleBlock: {
    flex: 1,
  },
  headerSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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
  cardLeft: {
    flex: 1,
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
});
