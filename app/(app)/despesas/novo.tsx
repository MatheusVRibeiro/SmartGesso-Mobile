import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { toApiError } from '../../../src/services/api/client';
import { expensesService } from '../../../src/services/api/expenses';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { ExpenseCategory } from '../../../src/types/finance';
import { z } from 'zod';
import { createExpenseSchema } from '../../../src/validation/schemas';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Tipo de entrada do schema (campos com .default() ficam opcionais antes do default).
 * O zodResolver tipa o formulário pelo input do schema.
 */
type ExpenseFormValues = z.input<typeof createExpenseSchema>;

const EXPENSE_CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'MATERIAL', label: 'Material' },
  { value: 'MAO_DE_OBRA', label: 'Mão de obra' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'ENERGIA', label: 'Energia' },
  { value: 'AGUA', label: 'Água' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'IMPOSTOS', label: 'Impostos' },
  { value: 'OUTROS', label: 'Outros' },
];

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function NovaDespesaScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const { control, handleSubmit } = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      category: 'OUTROS',
      description: '',
      amount: undefined,
      expenseDate: '',
      observations: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormValues) => {
      // Clean payload: strip empty strings → undefined for optional fields
      const payload = {
        category: data.category ?? 'OUTROS',
        description: data.description,
        amount: parseFloat(String(data.amount)),
        expenseDate: data.expenseDate?.trim() || undefined,
        observations: data.observations?.trim() || undefined,
      };
      return expensesService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'expenses'],
      });
      setSnackbar({ type: 'success', message: 'Despesa registrada com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: ExpenseFormValues) {
    createMutation.mutate(data);
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Nova despesa', headerShown: false }} />

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
          <Text style={styles.title}>Nova despesa</Text>
        </View>

        <Text style={styles.sectionLabel}>Categoria</Text>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <View style={styles.categoryWrap}>
              {EXPENSE_CATEGORY_OPTIONS.map((option) => {
                const selected = field.value === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={option.label}
                    onPress={() => field.onChange(option.value)}
                    style={[
                      styles.categoryChip,
                      selected && styles.categoryChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <AppInput
              label="Descrição"
              required
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Ex.: Compra de placas de gesso"
              error={fieldState.error?.message}
              accessibilityLabel="Descrição da despesa"
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <AppInput
              label="Valor"
              required
              value={field.value == null ? '' : String(field.value)}
              onChangeText={field.onChange}
              placeholder="0,00"
              keyboardType="decimal-pad"
              error={fieldState.error?.message}
              accessibilityLabel="Valor da despesa"
            />
          )}
        />

        <Controller
          control={control}
          name="expenseDate"
          render={({ field }) => (
            <AppInput
              label="Data"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD (opcional)"
              autoCapitalize="none"
              accessibilityLabel="Data da despesa"
            />
          )}
        />

        <Controller
          control={control}
          name="observations"
          render={({ field }) => (
            <AppInput
              label="Observações"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Observações adicionais (opcional)"
              accessibilityLabel="Observações da despesa"
            />
          )}
        />

        <AppButton
          title="Salvar"
          size="lg"
          accessibilityLabel="Salvar despesa"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.saveButton}
        />
      </ScreenContainer>

      {snackbar && (
        <AppSnackbar
          visible={true}
          type={snackbar.type}
          message={snackbar.message}
          onHide={() => setSnackbar(null)}
        />
      )}
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: colors.textOnPrimary,
  },
  saveButton: {
    marginTop: spacing.xl,
    marginBottom: spacing['3xl'],
  },
});
