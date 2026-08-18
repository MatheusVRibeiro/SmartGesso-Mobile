import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { AppButton } from '../../../../../src/components/ui/AppButton';
import { AppCard } from '../../../../../src/components/ui/AppCard';
import { AppInput } from '../../../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../../../src/components/ui/AppSnackbar';
import { ConfirmDialog } from '../../../../../src/components/ui/ConfirmDialog';
import { ErrorState } from '../../../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../../../src/components/ui/ScreenContainer';
import { toApiError } from '../../../../../src/services/api/client';
import { measurementsService } from '../../../../../src/services/api/measurements';
import { useSessionStore } from '../../../../../src/store/useSessionStore';
import { borders, colors, radius, sizes, spacing, typography } from '../../../../../src/theme';
import type {
  MeasurementApplicationType,
  UpdateMeasurementInput,
} from '../../../../../src/types/measurement';
import {
  createMeasurementSchema,
  type CreateMeasurementFormData,
} from '../../../../../src/validation/schemas';

// ─── Helpers ────────────────────────────────────────────────────────────────

const APPLICATION_TYPE_OPTIONS: {
  value: MeasurementApplicationType;
  label: string;
}[] = [
  { value: 'DRYWALL', label: 'Drywall' },
  { value: 'FORRO', label: 'Forro' },
  { value: 'PAREDE', label: 'Parede' },
  { value: 'SANCA', label: 'Sanca' },
  { value: 'REBAIXAMENTO', label: 'Rebaixamento' },
  { value: 'OUTRO', label: 'Outro' },
];

/** Campos numéricos opcionais: string vazia vira undefined (não coercer '' → 0). */
function numericOrUndefined(text: string): string | undefined {
  const trimmed = text.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Formata número com vírgula decimal (pt-BR). Ex.: 12.5 → "12,5". */
function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const [intPart, decPart] = String(rounded).split('.');
  return decPart ? `${intPart},${decPart}` : intPart;
}

/** Payload de atualização (API é autoridade de área/perímetro — não enviar). */
function toUpdateInput(data: CreateMeasurementFormData): UpdateMeasurementInput {
  return {
    environmentName: data.environmentName,
    applicationType: data.applicationType,
    length: data.length,
    width: data.width,
    ceilingHeight: data.ceilingHeight,
    doors: data.doors,
    windows: data.windows,
    cutouts: data.cutouts,
    fixtures: data.fixtures,
    hasCove: data.hasCove,
    hasDropCeiling: data.hasDropCeiling,
    observations: data.observations?.trim() || undefined,
  };
}

// ─── Seletor de tipo de aplicação ───────────────────────────────────────────

function ApplicationTypeSelector({
  value,
  onChange,
}: {
  value: MeasurementApplicationType;
  onChange: (type: MeasurementApplicationType) => void;
}) {
  return (
    <View style={styles.typeRow}>
      {APPLICATION_TYPE_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`Tipo ${option.label}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.typeChip, selected && styles.typeChipSelected]}
          >
            <Text
              style={[
                styles.typeChipText,
                selected && styles.typeChipTextSelected,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Linha de toggle (switch) ───────────────────────────────────────────────

function ToggleRow({
  label,
  value,
  onChange,
  accessibilityLabel,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.inputBorder, true: colors.primary }}
        thumbColor={colors.white}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function EditarMedicaoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string; medicaoId: string }>();
  const workId = Array.isArray(params.id) ? params.id[0] : params.id;
  const measurementId = Array.isArray(params.medicaoId)
    ? params.medicaoId[0]
    : params.medicaoId;

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof createMeasurementSchema>, any, CreateMeasurementFormData>({
    resolver: zodResolver(createMeasurementSchema),
    defaultValues: {
      environmentName: '',
      applicationType: 'DRYWALL',
      length: undefined,
      width: undefined,
      ceilingHeight: undefined,
      doors: 0,
      windows: 0,
      cutouts: 0,
      fixtures: 0,
      hasCove: false,
      hasDropCeiling: false,
      observations: '',
    },
  });

  const measurementQuery = useQuery({
    queryKey: ['company', companyId, 'works', workId, 'measurements', measurementId],
    queryFn: () => measurementsService.getById(measurementId as string),
    enabled: Boolean(companyId && measurementId),
  });

  // Preenche o formulário quando a medição carrega.
  useEffect(() => {
    const measurement = measurementQuery.data;
    if (!measurement) return;
    reset({
      environmentName: measurement.environmentName,
      applicationType: measurement.applicationType,
      length: measurement.length ?? undefined,
      width: measurement.width ?? undefined,
      ceilingHeight: measurement.ceilingHeight ?? undefined,
      doors: measurement.doors ?? 0,
      windows: measurement.windows ?? 0,
      cutouts: measurement.cutouts ?? 0,
      fixtures: measurement.fixtures ?? 0,
      hasCove: measurement.hasCove,
      hasDropCeiling: measurement.hasDropCeiling,
      observations: measurement.observations ?? '',
    });
  }, [measurementQuery.data, reset]);

  // Feedback em tempo real: área/perímetro estimados a partir de L × W.
  const watchedLength = useWatch({ control, name: 'length' });
  const watchedWidth = useWatch({ control, name: 'width' });
  const lengthNum = parseFloat(String(watchedLength ?? ''));
  const widthNum = parseFloat(String(watchedWidth ?? ''));
  const hasDimensions =
    Number.isFinite(lengthNum) &&
    Number.isFinite(widthNum) &&
    lengthNum > 0 &&
    widthNum > 0;
  const estimatedArea = hasDimensions ? lengthNum * widthNum : null;
  const estimatedPerimeter = hasDimensions ? 2 * (lengthNum + widthNum) : null;

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMeasurementInput) =>
      measurementsService.update(measurementId as string, data),
    onSuccess: () => {
      if (companyId && workId) {
        queryClient.invalidateQueries({
          queryKey: ['company', companyId, 'works', workId, 'measurements'],
        });
      }
      setSnackbar({ type: 'success', message: 'Medição atualizada com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => measurementsService.remove(measurementId as string),
    onSuccess: () => {
      if (companyId && workId) {
        queryClient.invalidateQueries({
          queryKey: ['company', companyId, 'works', workId, 'measurements'],
        });
      }
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Medição excluída com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: CreateMeasurementFormData) {
    updateMutation.mutate(toUpdateInput(data));
  }

  if (!measurementId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Medição', headerShown: false }} />
        <ErrorState message="Medição não encontrada" />
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Editar medição', headerShown: false }} />

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
          <Text style={styles.title}>Editar medição</Text>
        </View>

        {measurementQuery.isLoading ? (
          <LoadingState text="Carregando medição..." />
        ) : measurementQuery.isError ? (
          <ErrorState
            message={toApiError(measurementQuery.error).message}
            onRetry={measurementQuery.refetch}
          />
        ) : (
          <>
            <Controller
              control={control}
              name="environmentName"
              render={({ field, fieldState }) => (
                <AppInput
                  label="Nome do ambiente"
                  required
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Ex.: Sala de estar"
                  error={fieldState.error?.message}
                  accessibilityLabel="Nome do ambiente"
                />
              )}
            />

            <Text style={styles.sectionLabel}>Tipo de aplicação</Text>
            <Controller
              control={control}
              name="applicationType"
              render={({ field }) => (
                <ApplicationTypeSelector
                  value={field.value ?? 'DRYWALL'}
                  onChange={field.onChange}
                />
              )}
            />

            <Text style={styles.sectionLabel}>Dimensões (m)</Text>

            <View style={styles.row}>
              <Controller
                control={control}
                name="length"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Comprimento"
                    value={field.value == null ? '' : String(field.value)}
                    onChangeText={(text) => field.onChange(numericOrUndefined(text))}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    error={fieldState.error?.message}
                    accessibilityLabel="Comprimento em metros"
                    style={styles.rowField}
                  />
                )}
              />
              <Controller
                control={control}
                name="width"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Largura"
                    value={field.value == null ? '' : String(field.value)}
                    onChangeText={(text) => field.onChange(numericOrUndefined(text))}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    error={fieldState.error?.message}
                    accessibilityLabel="Largura em metros"
                    style={styles.rowField}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="ceilingHeight"
              render={({ field, fieldState }) => (
                <AppInput
                  label="Pé-direito (altura)"
                  value={field.value == null ? '' : String(field.value)}
                  onChangeText={(text) => field.onChange(numericOrUndefined(text))}
                  placeholder="Ex.: 2,80"
                  keyboardType="decimal-pad"
                  error={fieldState.error?.message}
                  accessibilityLabel="Pé-direito em metros"
                />
              )}
            />

            {/* Feedback em tempo real — a API é a autoridade final */}
            <AppCard style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Ionicons
                  name="calculator-outline"
                  size={sizes.icon.md}
                  color={colors.primary}
                  accessibilityElementsHidden
                />
                <Text style={styles.feedbackTitle}>Área e perímetro estimados</Text>
              </View>
              {hasDimensions ? (
                <>
                  <View style={styles.feedbackRow}>
                    <Text style={styles.feedbackLabel}>Área</Text>
                    <Text style={styles.feedbackValue}>
                      {formatNumber(estimatedArea as number)} m²
                    </Text>
                  </View>
                  <View style={styles.feedbackRow}>
                    <Text style={styles.feedbackLabel}>Perímetro</Text>
                    <Text style={styles.feedbackValue}>
                      {formatNumber(estimatedPerimeter as number)} m
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.feedbackHint}>
                  Informe comprimento e largura para ver a área e o perímetro
                  estimados.
                </Text>
              )}
              <Text style={styles.feedbackNote}>
                Valores calculados automaticamente pela API ao salvar.
              </Text>
            </AppCard>

            <Text style={styles.sectionLabel}>Aberturas e pontos</Text>

            <View style={styles.row}>
              <Controller
                control={control}
                name="doors"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Portas"
                    value={field.value == null ? '' : String(field.value)}
                    onChangeText={field.onChange}
                    placeholder="0"
                    keyboardType="number-pad"
                    error={fieldState.error?.message}
                    accessibilityLabel="Quantidade de portas"
                    style={styles.rowField}
                  />
                )}
              />
              <Controller
                control={control}
                name="windows"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Janelas"
                    value={field.value == null ? '' : String(field.value)}
                    onChangeText={field.onChange}
                    placeholder="0"
                    keyboardType="number-pad"
                    error={fieldState.error?.message}
                    accessibilityLabel="Quantidade de janelas"
                    style={styles.rowField}
                  />
                )}
              />
            </View>

            <View style={styles.row}>
              <Controller
                control={control}
                name="cutouts"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Recortes"
                    value={field.value == null ? '' : String(field.value)}
                    onChangeText={field.onChange}
                    placeholder="0"
                    keyboardType="number-pad"
                    error={fieldState.error?.message}
                    accessibilityLabel="Quantidade de recortes"
                    style={styles.rowField}
                  />
                )}
              />
              <Controller
                control={control}
                name="fixtures"
                render={({ field, fieldState }) => (
                  <AppInput
                    label="Pontos de luz"
                    value={field.value == null ? '' : String(field.value)}
                    onChangeText={field.onChange}
                    placeholder="0"
                    keyboardType="number-pad"
                    error={fieldState.error?.message}
                    accessibilityLabel="Quantidade de pontos de luz"
                    style={styles.rowField}
                  />
                )}
              />
            </View>

            <Text style={styles.sectionLabel}>Detalhes</Text>

            <Controller
              control={control}
              name="hasCove"
              render={({ field }) => (
                <ToggleRow
                  label="Sanca"
                  value={field.value ?? false}
                  onChange={field.onChange}
                  accessibilityLabel="Possui sanca"
                />
              )}
            />

            <Controller
              control={control}
              name="hasDropCeiling"
              render={({ field }) => (
                <ToggleRow
                  label="Forro rebaixado"
                  value={field.value ?? false}
                  onChange={field.onChange}
                  accessibilityLabel="Possui forro rebaixado"
                />
              )}
            />

            <Controller
              control={control}
              name="observations"
              render={({ field }) => (
                <>
                  <Text style={styles.observationsLabel}>Observações</Text>
                  <TextInput
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    placeholder="Anotações sobre o ambiente (opcional)"
                    placeholderTextColor={colors.textLight}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={styles.observationsInput}
                    accessibilityLabel="Observações"
                  />
                </>
              )}
            />

            <AppButton
              title="Salvar alterações"
              size="lg"
              loading={updateMutation.isPending}
              onPress={handleSubmit(onSubmit)}
              accessibilityLabel="Salvar alterações"
              style={styles.submitButton}
            />

            <AppButton
              title="Excluir medição"
              size="lg"
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={() => setConfirmDeleteVisible(true)}
              accessibilityLabel="Excluir medição"
              style={styles.deleteButton}
            />
          </>
        )}
      </ScreenContainer>

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Excluir medição"
        message="Tem certeza que deseja excluir esta medição? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDeleteVisible(false)}
      />

      <AppSnackbar
        visible={snackbar != null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type ?? 'info'}
        onHide={() => setSnackbar(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: colors.textOnPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
  },
  feedbackCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feedbackTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  feedbackValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  feedbackHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  feedbackNote: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  observationsLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  observationsInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: borders.width.thin,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 96,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  deleteButton: {
    marginTop: spacing.md,
    marginBottom: spacing['3xl'],
  },
});