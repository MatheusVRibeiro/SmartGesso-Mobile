import React, { useState, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { catalogService } from '@/src/services/api/catalog';
import { toApiError } from '@/src/services/api/client';
import { inventoryService } from '@/src/services/api/inventory';
import { serviceOrdersService } from '@/src/services/api/serviceOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { InventoryMovementType } from '@/src/types/inventory';
import {
  createInventoryMovementSchema,
  type CreateInventoryMovementFormData,
} from '@/src/validation/schemas';
import { createCatalogoMovimentoStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface MovementTypeOption {
  value: InventoryMovementType;
  label: string;
  icon: IconName;
}

const MOVEMENT_TYPE_OPTIONS: MovementTypeOption[] = [
  { value: 'ENTRADA', label: 'Entrada', icon: 'arrow-down-circle' },
  { value: 'SAIDA', label: 'Saída', icon: 'arrow-up-circle' },
  { value: 'RESERVA', label: 'Reserva', icon: 'bookmark-outline' },
  { value: 'CONSUMO', label: 'Consumo', icon: 'flame-outline' },
  { value: 'PERDA', label: 'Perda', icon: 'alert-circle-outline' },
  { value: 'AJUSTE', label: 'Ajuste', icon: 'swap-horizontal' },
  { value: 'RETORNO', label: 'Retorno', icon: 'return-down-back' },
];

export default function NovoMovimentoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoMovimentoStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  // V3 — movimento contextual: ?materialId= pré-seleciona o material.
  const params = useLocalSearchParams<{ materialId?: string }>();
  const materialId = Array.isArray(params.materialId)
    ? params.materialId[0]
    : params.materialId;

  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const { control, handleSubmit, watch } = useForm<CreateInventoryMovementFormData>({
    resolver: zodResolver(createInventoryMovementSchema),
    defaultValues: {
      materialId: materialId ?? '',
      type: 'ENTRADA',
      quantity: undefined,
      serviceOrderId: '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const isAdjust = selectedType === 'AJUSTE';

  // Material pré-selecionado — exibe nome/estoque no topo do formulário.
  const materialQuery = useQuery({
    queryKey: ['company', companyId, 'catalog', 'materials', materialId],
    queryFn: () => catalogService.getMaterial(materialId as string),
    enabled: Boolean(companyId && materialId),
  });

  // Serviços para vínculo opcional (V3) — seção oculta quando indisponível.
  const serviceOrdersQuery = useQuery({
    queryKey: ['company', companyId, 'service-orders'],
    queryFn: () => serviceOrdersService.list({ limit: 50 }),
    enabled: Boolean(companyId),
  });
  const serviceOrders = serviceOrdersQuery.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CreateInventoryMovementFormData) =>
      inventoryService.createMovement({
        materialId: data.materialId,
        type: data.type,
        quantity: Number(data.quantity),
        serviceOrderId: data.serviceOrderId?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      }),
    onSuccess: () => {
      // Invalida movimentos + materiais de estoque e o catálogo (saldo atualizado).
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'inventory'],
      });
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'catalog', 'materials'],
      });
      setSnackbar({ type: 'success', message: 'Movimento registrado com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: CreateInventoryMovementFormData) {
    createMutation.mutate(data);
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Novo movimento', headerShown: true }} />

        <View style={styles.header}>
          <Text style={styles.title}>Registrar movimento</Text>
          <Text style={styles.subtitle}>
            Entrada, saída, consumo e outros movimentos de estoque.
          </Text>
        </View>

        {materialId ? (
          <View style={styles.materialCard}>
            <View style={styles.materialCardIcon}>
              <Ionicons
                name="layers-outline"
                size={sizes.icon.md}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <View style={styles.materialCardInfo}>
              <Text style={styles.materialCardTitle}>Material</Text>
              <Text style={styles.materialCardSubtitle} numberOfLines={1}>
                {materialQuery.isLoading
                  ? 'Carregando material...'
                  : materialQuery.data?.name ?? 'Material não encontrado'}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Tipo de movimento</Text>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <View style={styles.chipWrap}>
              {MOVEMENT_TYPE_OPTIONS.map((option) => {
                const selected = field.value === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={option.label}
                    onPress={() => field.onChange(option.value)}
                    style={[
                      styles.chip,
                      selected && styles.chipSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={sizes.icon.sm}
                      color={selected ? colors.textOnPrimary : colors.textSecondary}
                      accessibilityElementsHidden
                    />
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
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
          name="quantity"
          render={({ field, fieldState }) => (
            <AppInput
              label={isAdjust ? 'Novo estoque (valor final)' : 'Quantidade'}
              required
              value={field.value == null ? '' : String(field.value)}
              onChangeText={field.onChange}
              placeholder="0"
              keyboardType="decimal-pad"
              error={fieldState.error?.message}
              helper={
                isAdjust
                  ? 'O estoque do material será definido para este valor.'
                  : undefined
              }
              accessibilityLabel="Quantidade do movimento"
            />
          )}
        />

        <Text style={styles.sectionLabel}>Serviço vinculado (opcional)</Text>
        <Controller
          control={control}
          name="serviceOrderId"
          render={({ field }) => (
            <View style={styles.chipWrap}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !field.value }}
                accessibilityLabel="Sem serviço vinculado"
                onPress={() => field.onChange('')}
                style={[styles.chip, !field.value && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipText,
                    !field.value && styles.chipTextSelected,
                  ]}
                >
                  Sem serviço
                </Text>
              </Pressable>
              {serviceOrdersQuery.isLoading ? (
                <Text style={styles.chipHint}>Carregando serviços...</Text>
              ) : (
                serviceOrders.map((order) => {
                  const selected = field.value === order.id;
                  return (
                    <Pressable
                      key={order.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`OS ${order.code}`}
                      onPress={() => field.onChange(selected ? '' : order.id)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        OS #{order.code}
                        {order.client?.name ? ` · ${order.client.name}` : ''}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <AppInput
              label="Observação"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Observações do movimento (opcional)"
              multiline
              accessibilityLabel="Observação do movimento"
            />
          )}
        />

        <AppButton
          title="Salvar movimento"
          size="lg"
          accessibilityLabel="Salvar movimento"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.saveButton}
        />
      </ScreenContainer>

      {snackbar && (
        <AppSnackbar
          visible
          type={snackbar.type}
          message={snackbar.message}
          onHide={() => setSnackbar(null)}
        />
      )}
    </View>
  );
}
