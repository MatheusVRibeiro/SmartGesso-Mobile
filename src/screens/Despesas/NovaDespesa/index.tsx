import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { toApiError } from '@/src/services/api/client';
import { expensesService } from '@/src/services/api/expenses';
import { serviceOrdersService } from '@/src/services/api/serviceOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { addMutation } from '@/src/services/offline/syncQueue';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/format';
import { parseCurrencyInput } from '@/src/utils/masks';
import type { ExpenseCategory } from '@/src/types/finance';
import { z } from 'zod';
import { createExpenseSchema } from '@/src/validation/schemas';
import { createNovaDespesaStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

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
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaDespesaStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  // V3 — despesa contextual: ?serviceOrderId= pré-vincula a despesa ao serviço.
  const params = useLocalSearchParams<{ serviceOrderId?: string }>();
  const serviceOrderId = Array.isArray(params.serviceOrderId)
    ? params.serviceOrderId[0]
    : params.serviceOrderId;
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
      serviceOrderId: serviceOrderId ?? '',
    },
  });

  // Serviço vinculado (V3) — reutiliza a query do Detalhe da OS quando houver cache.
  const serviceOrderQuery = useQuery({
    queryKey: ['company', companyId, 'service-orders', serviceOrderId],
    queryFn: () => serviceOrdersService.getById(serviceOrderId as string),
    enabled: Boolean(companyId && serviceOrderId),
  });
  const linkedOrder = serviceOrderQuery.data;

  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormValues) => {
      // Clean payload: strip empty strings → undefined for optional fields
      const payload = {
        category: data.category ?? 'OUTROS',
        description: data.description,
        amount: parseFloat(String(data.amount)),
        expenseDate: data.expenseDate?.trim() || undefined,
        observations: data.observations?.trim() || undefined,
        serviceOrderId: data.serviceOrderId?.trim() || undefined,
      };
      return expensesService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'expenses'],
      });
      // V3 — invalida as queries do serviço (detalhe + listagem + central operacional).
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setSnackbar({ type: 'success', message: 'Despesa registrada com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: ExpenseFormValues) {
    if (isOffline) {
      // Salvar na fila de sincronização offline
      addMutation({
        type: 'expense',
        endpoint: '/expenses',
        method: 'POST',
        body: {
          category: data.category ?? 'OUTROS',
          description: data.description,
          amount: parseFloat(String(data.amount)),
          expenseDate: data.expenseDate?.trim() || undefined,
          observations: data.observations?.trim() || undefined,
          serviceOrderId: data.serviceOrderId?.trim() || undefined,
        },
      });
      setSnackbar({
        type: 'success',
        message: 'Salvo offline — sincronizará quando conectar',
      });
      setTimeout(() => router.back(), 600);
      return;
    }
    createMutation.mutate(data);
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Nova despesa', headerShown: true }} />

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
            <Text style={styles.title}>Nova despesa</Text>
            <Text style={styles.subtitle}>Registre uma despesa da sua empresa.</Text>
          </View>
        </View>

        {serviceOrderId ? (
          <View style={styles.serviceCard}>
            <View style={styles.serviceCardIcon}>
              <Ionicons
                name="construct-outline"
                size={sizes.icon.md}
                color={colors.warning}
                accessibilityElementsHidden
              />
            </View>
            <View style={styles.serviceCardInfo}>
              <Text style={styles.serviceCardTitle}>
                Despesa vinculada ao serviço
              </Text>
              <Text style={styles.serviceCardSubtitle} numberOfLines={1}>
                {serviceOrderQuery.isLoading
                  ? 'Carregando serviço...'
                  : linkedOrder
                    ? `OS #${linkedOrder.code} · ${
                        linkedOrder.client?.name ?? 'Cliente não informado'
                      }`
                    : 'Serviço não encontrado'}
              </Text>
            </View>
          </View>
        ) : null}

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
              value={field.value == null ? '' : formatCurrency(field.value)}
              onChangeText={(t) => field.onChange(parseCurrencyInput(t))}
              mask="currency"
              placeholder="0,00"
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

        {isOffline ? (
          <Text style={styles.offlineWarning}>
            Você está offline. Conecte-se para salvar a despesa.
          </Text>
        ) : null}

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
