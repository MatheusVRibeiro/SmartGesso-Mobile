import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { MaterialResultCard } from '@/src/components/domain/MaterialResultCard';
import { toApiError } from '@/src/services/api/client';
import { compositionsService } from '@/src/services/api/compositions';
import { measurementsService } from '@/src/services/api/measurements';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, sizes, spacing, typography } from '@/src/theme';
import type { CalculateMaterialsInput } from '@/src/types/composition';
import type { Measurement } from '@/src/types/measurement';
import { formatCurrency, formatNumber } from '@/src/utils/format';
import { createObraMateriaisStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { toArray } from '@/src/utils/toArray';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Monta o payload de cálculo a partir das medições da obra. */
function buildCalculateInput(measurements: Measurement[]): CalculateMaterialsInput {
  return {
    applicationType: measurements[0]?.applicationType ?? 'DRYWALL',
    measurements: measurements.map((m) => ({
      length: m.length ?? undefined,
      width: m.width ?? undefined,
      area: m.area ?? undefined,
      perimeter: m.perimeter ?? undefined,
    })),
  };
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function MateriaisScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createObraMateriaisStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const workId = Array.isArray(params.id) ? params.id[0] : params.id;

  const measurementsQuery = useQuery({
    queryKey: ['company', companyId, 'works', workId, 'measurements'],
    queryFn: () => measurementsService.listByWork(workId as string),
    select: (result) => toArray<Measurement>(result),
    enabled: Boolean(companyId && workId),
  });

  const calculateMutation = useMutation({
    mutationFn: (input: CalculateMaterialsInput) =>
      compositionsService.calculate(input),
  });

  const measurements = measurementsQuery.data ?? [];

  // Dispara o cálculo automaticamente assim que as medições carregam.
  const autoCalculatedRef = useRef(false);
  useEffect(() => {
    if (
      measurements.length > 0 &&
      !autoCalculatedRef.current &&
      !calculateMutation.isPending &&
      !calculateMutation.data
    ) {
      autoCalculatedRef.current = true;
      calculateMutation.mutate(buildCalculateInput(measurements));
    }
  }, [measurements, calculateMutation]);

  const result = calculateMutation.data;

  const compositionInfo = useMemo(() => {
    if (!result) return null;
    return {
      code: result.composition.code,
      name: result.composition.name,
      version: result.composition.version,
    };
  }, [result]);

  function handleRecalculate() {
    if (measurements.length > 0) {
      calculateMutation.mutate(buildCalculateInput(measurements));
    }
  }

  function handleGerarOrcamento() {
    Alert.alert(
      'Em breve',
      'A geração de orçamentos estará disponível em breve (Fase 4).',
    );
  }

  if (!workId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Materiais', headerShown: true }} />
        <ErrorState message="Obra não encontrada" />
      </ScreenContainer>
    );
  }

  const itemCount = result?.items.length ?? 0;

  return (
    <ScreenContainer scroll keyboard={false}>
      <Stack.Screen options={{ title: 'Materiais', headerShown: true }} />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={sizes.icon.lg} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Materiais</Text>
          <Text style={styles.subtitle}>
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'material calculado' : 'materiais calculados'}`
              : 'Cálculo de materiais para a obra'}
          </Text>
        </View>
      </View>

      {measurementsQuery.isLoading ? (
        <LoadingState text="Carregando medições..." />
      ) : measurementsQuery.isError ? (
        <ErrorState
          message={toApiError(measurementsQuery.error).message}
          onRetry={measurementsQuery.refetch}
        />
      ) : measurements.length === 0 ? (
        <EmptyState
          title="Nenhuma medição para calcular"
          description="Cadastre ao menos uma medição na obra para calcular os materiais."
          icon="cube-outline"
        />
      ) : calculateMutation.isPending ? (
        <LoadingState text="Calculando materiais..." />
      ) : calculateMutation.isError ? (
        <ErrorState
          message={toApiError(calculateMutation.error).message}
          onRetry={handleRecalculate}
        />
      ) : result && compositionInfo ? (
        <>
          {/* Composição utilizada */}
          <AppCard shadow="light" style={styles.compositionCard}>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionCode}>{compositionInfo.code}</Text>
              <StatusBadge
                status="active"
                label={`v${compositionInfo.version}`}
                size="sm"
              />
            </View>
            <Text style={styles.compositionName} numberOfLines={2}>
              {compositionInfo.name}
            </Text>
          </AppCard>

          {/* Itens calculados */}
          <Text style={styles.sectionLabel}>Itens calculados</Text>
          {result.items.map((item, index) => (
            <MaterialResultCard
              key={`${item.materialType}-${item.name}-${index}`}
              name={item.name}
              quantity={item.quantity}
              unit={item.unit}
              unitPrice={item.unitPrice}
              total={item.total}
            />
          ))}

          {/* Resumo */}
          <AppCard shadow="light" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Área total</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(result.totalArea)} m²
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Custo estimado</Text>
              <Text style={styles.summaryCost}>
                {formatCurrency(result.estimatedCost)}
              </Text>
            </View>
          </AppCard>

          <AppButton
            title="Calcular novamente"
            variant="outline"
            size="lg"
            loading={calculateMutation.isPending}
            onPress={handleRecalculate}
            accessibilityLabel="Calcular novamente"
            style={styles.recalculateButton}
          />
          <AppButton
            title="Gerar orçamento"
            size="lg"
            onPress={handleGerarOrcamento}
            accessibilityLabel="Gerar orçamento"
            style={styles.budgetButton}
          />
        </>
      ) : null}
    </ScreenContainer>
  );
}
