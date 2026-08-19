import React, { useRef, useState } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { AppButton } from '../../../../../src/components/ui/AppButton';
import { AppCard } from '../../../../../src/components/ui/AppCard';
import { AppInput } from '../../../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../../../src/components/ui/AppSnackbar';
import { PhotoPicker } from '../../../../../src/components/domain/PhotoPicker';
import { ScreenContainer } from '../../../../../src/components/ui/ScreenContainer';
import { toApiError } from '../../../../../src/services/api/client';
import { measurementsService } from '../../../../../src/services/api/measurements';
import { savePhotoLocally } from '../../../../../src/services/photos/photoStorage';
import { useSessionStore } from '../../../../../src/store/useSessionStore';
import { borders, colors, radius, sizes, spacing, typography } from '../../../../../src/theme';
import type { PhotoAttachment } from '../../../../../src/types/photo';
import type {
  CreateMeasurementInput,
  MeasurementApplicationType,
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

/**
 * Campos numéricos opcionais: string vazia vira undefined para o schema NÃO
 * coercer '' → 0 (senão a API receberia comprimento 0 em vez de omitir).
 */
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

/** Payload de criação (API é autoridade de área/perímetro — não enviar). */
function toCreateInput(data: CreateMeasurementFormData): CreateMeasurementInput {
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

export default function NovaMedicaoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const workId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);
  const [photo, setPhoto] = useState<PhotoAttachment | null>(null);
  const photoNoteRef = useRef('');

  const {
    control,
    handleSubmit,
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

  const createMutation = useMutation({
    mutationFn: (data: CreateMeasurementInput) =>
      measurementsService.create(workId as string, data),
    onSuccess: () => {
      if (companyId && workId) {
        queryClient.invalidateQueries({
          queryKey: ['company', companyId, 'works', workId, 'measurements'],
        });
      }
      setSnackbar({
        type: 'success',
        message: `Medição criada com sucesso.${photoNoteRef.current}`,
      });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  async function onSubmit(data: CreateMeasurementFormData) {
    photoNoteRef.current = '';
    if (photo) {
      try {
        await savePhotoLocally(photo, 'medicoes');
        photoNoteRef.current =
          ' Foto salva no dispositivo — upload na próxima versão.';
      } catch {
        setSnackbar({
          type: 'error',
          message: 'Não foi possível salvar a foto no dispositivo',
        });
        return;
      }
    }
    createMutation.mutate(toCreateInput(data));
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Nova medição', headerShown: true }} />

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
            <Text style={styles.title}>Nova medição</Text>
            <Text style={styles.subtitle}>Cadastre as dimensões do ambiente.</Text>
          </View>
        </View>

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
                label="Comprimento (m)"
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
                label="Largura (m)"
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
              label="Altura (m)"
              value={field.value == null ? '' : String(field.value)}
              onChangeText={(text) => field.onChange(numericOrUndefined(text))}
              placeholder="Ex.: 2,80"
              keyboardType="decimal-pad"
              error={fieldState.error?.message}
              accessibilityLabel="Altura em metros"
            />
          )}
        />

        {/* Feedback em tempo real — a API é a autoridade final */}
        <AppCard style={styles.feedbackCard}>
          {hasDimensions ? (
            <View style={styles.feedbackRow}>
              <View style={styles.feedbackItem}>
                <Text style={styles.feedbackLabel}>Área</Text>
                <Text style={styles.feedbackValue}>
                  {formatNumber(estimatedArea as number)} m²
                </Text>
              </View>
              <View style={styles.feedbackDivider} />
              <View style={styles.feedbackItem}>
                <Text style={styles.feedbackLabel}>Perímetro</Text>
                <Text style={styles.feedbackValue}>
                  {formatNumber(estimatedPerimeter as number)} m
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.feedbackEmpty}>
              <Ionicons
                name="calculator-outline"
                size={sizes.icon.md}
                color={colors.primary}
                accessibilityElementsHidden
              />
              <Text style={styles.feedbackHint}>
                Informe comprimento e largura para ver a área e o perímetro
                estimados.
              </Text>
            </View>
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

        <PhotoPicker
          label="Foto do ambiente"
          hint="Registre o ambiente antes da medição"
          value={photo}
          onChange={setPhoto}
          accessibilityLabel="Foto do ambiente"
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
          title="Salvar medição"
          size="lg"
          loading={createMutation.isPending}
          onPress={handleSubmit(onSubmit)}
          accessibilityLabel="Salvar medição"
          style={styles.submitButton}
        />
      </ScreenContainer>

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
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  backButton: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  feedbackDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
  },
  feedbackLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  feedbackValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  feedbackEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feedbackHint: {
    flex: 1,
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
    color: colors.textSecondary,
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
    marginBottom: spacing['3xl'],
  },
});