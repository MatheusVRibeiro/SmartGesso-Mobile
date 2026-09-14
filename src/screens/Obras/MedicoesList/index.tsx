import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { measurementsService } from '@/src/services/api/measurements';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type {
  Measurement,
  MeasurementApplicationType,
} from '@/src/types/measurement';
import { createMedicoesListStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { toArray } from '@/src/utils/toArray';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Formata número com vírgula decimal (pt-BR). Ex.: 12.5 → "12,5". */
function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  const rounded = Math.round(value * 100) / 100;
  const [intPart, decPart] = String(rounded).split('.');
  return decPart ? `${intPart},${decPart}` : intPart;
}

const APPLICATION_TYPE_BADGE: Record<
  MeasurementApplicationType,
  { variant: StatusBadgeVariant; label: string }
> = {
  DRYWALL: { variant: 'active', label: 'Drywall' },
  FORRO: { variant: 'warning', label: 'Forro' },
  PAREDE: { variant: 'active', label: 'Parede' },
  SANCA: { variant: 'expired', label: 'Sanca' },
  REBAIXAMENTO: { variant: 'warning', label: 'Rebaixamento' },
  OUTRO: { variant: 'cancelled', label: 'Outro' },
};

// ─── Card de medição ────────────────────────────────────────────────────────

function MeasurementCard({
  measurement,
  onPress,
}: {
  measurement: Measurement;
  onPress: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createMedicoesListStyles(colors, isDark), [colors, isDark]);
  const badge = APPLICATION_TYPE_BADGE[measurement.applicationType];

  return (
    <AppCard shadow="light" radius={radius.md} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver medição ${measurement.environmentName}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="resize-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {measurement.environmentName}
              </Text>
              <StatusBadge status={badge.variant} label={badge.label} size="sm" />
            </View>

            {measurement.length != null && measurement.width != null ? (
              <View style={styles.cardRow}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={sizes.icon.sm}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text style={styles.cardText}>
                  {formatNumber(measurement.length)} × {formatNumber(measurement.width)} m
                </Text>
              </View>
            ) : null}

            <View style={styles.cardRow}>
              <Ionicons
                name="square-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardValue}>
                Área: {formatNumber(measurement.area)} m²
              </Text>
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="git-compare-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardValue}>
                Perímetro: {formatNumber(measurement.perimeter)} m
              </Text>
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

export default function MedicoesListScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createMedicoesListStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const workId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: measurements,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'works', workId, 'measurements'],
    queryFn: () => measurementsService.listByWork(workId as string),
    select: (result) => toArray<Measurement>(result),
    enabled: Boolean(companyId && workId),
  });

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Medições', headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.title}>Medições</Text>
        <TouchableOpacity
          onPress={() => router.push(`/obras/${workId}/medicoes/novo`)}
          accessibilityRole="button"
          accessibilityLabel="Nova medição"
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.lg} color={colors.white} accessibilityElementsHidden />
        </TouchableOpacity>
      </View>

      <View style={styles.materialsWrapper}>
        <AppButton
          title="Ver materiais calculados"
          variant="outline"
          size="md"
          onPress={() => router.push(`/obras/${workId}/materiais`)}
          accessibilityLabel="Ver materiais calculados"
        />
      </View>

      {isLoading ? (
        <LoadingState text="Carregando medições..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : measurements && measurements.length === 0 ? (
        <EmptyState
          title="Nenhuma medição"
          description="Adicione medições para calcular materiais"
          icon="resize-outline"
          actionLabel="Nova medição"
          onAction={() => router.push(`/obras/${workId}/medicoes/novo`)}
        />
      ) : (
        <FlatList
          data={measurements ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MeasurementCard
              measurement={item}
              onPress={() =>
                router.push(`/obras/${workId}/medicoes/${item.id}`)
              }
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
