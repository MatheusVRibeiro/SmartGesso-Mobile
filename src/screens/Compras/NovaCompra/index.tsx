import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { toApiError } from '@/src/services/api/client';
import { purchaseOrdersService } from '@/src/services/api/purchaseOrders';
import { suppliersService } from '@/src/services/api/suppliers';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { Supplier } from '@/src/types/supplier';
import { formatCurrency } from '@/src/utils/format';
import { parseCurrencyInput } from '@/src/utils/masks';
import { z } from 'zod';
import { createNovaCompraStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

// ─── Schema do formulário ───────────────────────────────────────────────────

const purchaseOrderItemSchema = z.object({
  productName: z.string().trim().min(1, 'Descrição é obrigatória'),
  quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unitPrice: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
});

const createPurchaseOrderSchema = z.object({
  supplierId: z.string().trim().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'Adicione pelo menos 1 item'),
  notes: z.string().trim().optional(),
});

type PurchaseOrderFormValues = z.input<typeof createPurchaseOrderSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real pode retornar array puro em GET /suppliers (Prisma findMany),
 * enquanto o tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

// ─── Modal de seleção de fornecedor ─────────────────────────────────────────

interface SupplierPickerModalProps {
  visible: boolean;
  suppliers: Supplier[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onSelect: (supplierId: string) => void;
  onClose: () => void;
}

function SupplierPickerModal({
  visible,
  suppliers,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  onClose,
}: SupplierPickerModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaCompraStyles(colors, isDark), [colors, isDark]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(term),
    );
  }, [suppliers, search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Selecionar fornecedor</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção de fornecedor"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.modalSearch}>
          <AppInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar fornecedor..."
            accessibilityLabel="Buscar fornecedor"
            returnKeyType="search"
          />
        </View>

        {isLoading ? (
          <LoadingState text="Carregando fornecedores..." />
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              search.trim()
                ? 'Nenhum fornecedor encontrado'
                : 'Nenhum fornecedor cadastrado'
            }
            description={
              search.trim()
                ? 'Tente buscar com outro termo'
                : 'Cadastre um fornecedor antes de criar o pedido'
            }
            icon="business-outline"
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Selecionar fornecedor ${item.name}`}
                onPress={() => onSelect(item.id)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="business-outline"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.cnpjCpf ? (
                    <Text style={styles.optionMeta} numberOfLines={1}>
                      {item.cnpjCpf}
                    </Text>
                  ) : null}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={sizes.icon.md}
                  color={colors.textLight}
                  accessibilityElementsHidden
                />
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function NovoPedidoCompraScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaCompraStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const { control, handleSubmit, setValue, watch } =
    useForm<PurchaseOrderFormValues>({
      resolver: zodResolver(createPurchaseOrderSchema),
      defaultValues: {
        supplierId: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0 }],
        notes: '',
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const total = useMemo(
    () =>
      (items ?? []).reduce((sum, item) => {
        const quantity = Number(item?.quantity) || 0;
        const unitPrice = Number(item?.unitPrice) || 0;
        return sum + quantity * unitPrice;
      }, 0),
    [items],
  );

  const suppliersQuery = useQuery({
    queryKey: ['company', companyId, 'suppliers'],
    queryFn: () => suppliersService.list(),
    select: (result) => toArray<Supplier>(result),
    enabled: Boolean(companyId),
  });

  const createMutation = useMutation({
    mutationFn: (data: PurchaseOrderFormValues) => {
      // Clean payload: strip empty strings → undefined for optional fields
      const payload = {
        supplierId: data.supplierId?.trim() || undefined,
        items: (data.items ?? []).map((item) => ({
          productName: item.productName.trim(),
          quantity: parseFloat(String(item.quantity)) || 0,
          unitPrice: parseFloat(String(item.unitPrice)) || 0,
        })),
        notes: data.notes?.trim() || undefined,
      };
      return purchaseOrdersService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'purchase-orders'],
      });
      setSnackbar({
        type: 'success',
        message: 'Pedido de compra criado com sucesso',
      });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: PurchaseOrderFormValues) {
    createMutation.mutate(data);
  }

  function addItem() {
    append({ productName: '', quantity: 1, unitPrice: 0 });
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Novo pedido de compra', headerShown: true }} />

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
            <Text style={styles.title}>Novo pedido de compra</Text>
            <Text style={styles.subtitle}>
              Preencha os dados para criar o pedido
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Fornecedor (opcional)</Text>
        <Controller
          control={control}
          name="supplierId"
          render={({ field }) => {
            const selectedSupplier = suppliersQuery.data?.find(
              (supplier) => supplier.id === field.value,
            );
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Selecionar fornecedor"
                onPress={() => setSupplierModalVisible(true)}
                style={styles.selectorCard}
              >
                <View style={styles.selectorIcon}>
                  <Ionicons
                    name="business-outline"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <Text
                  style={[
                    styles.selectorText,
                    !field.value && styles.selectorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {selectedSupplier?.name ?? 'Selecione um fornecedor (opcional)'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={sizes.icon.md}
                  color={colors.textLight}
                  accessibilityElementsHidden
                />
              </Pressable>
            );
          }}
        />

        <Text style={styles.sectionLabel}>Itens do pedido</Text>
        {fields.map((field, index) => (
          <AppCard key={field.id} shadow="light" style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemLabel}>Item {index + 1}</Text>
              {fields.length > 1 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover item ${index + 1}`}
                  onPress={() => remove(index)}
                  style={styles.removeItemButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={sizes.icon.sm}
                    color={colors.danger}
                  />
                </Pressable>
              )}
            </View>

            <Controller
              control={control}
              name={`items.${index}.productName`}
              render={({ field: nameField, fieldState }) => (
                <AppInput
                  label="Descrição"
                  required
                  value={nameField.value}
                  onChangeText={nameField.onChange}
                  placeholder="Ex.: Placa de gesso 1,20x3,00"
                  error={fieldState.error?.message}
                  accessibilityLabel={`Descrição do item ${index + 1}`}
                />
              )}
            />

            <View style={styles.itemRow}>
              <Controller
                control={control}
                name={`items.${index}.quantity`}
                render={({ field: qtyField, fieldState }) => (
                  <View style={styles.itemFieldHalf}>
                    <AppInput
                      label="Qtd"
                      required
                      value={qtyField.value == null ? '' : String(qtyField.value)}
                      onChangeText={(text) => qtyField.onChange(text)}
                      placeholder="1"
                      keyboardType="decimal-pad"
                      error={fieldState.error?.message}
                      accessibilityLabel={`Quantidade do item ${index + 1}`}
                    />
                  </View>
                )}
              />

              <Controller
                control={control}
                name={`items.${index}.unitPrice`}
                render={({ field: priceField, fieldState }) => (
                  <View style={styles.itemFieldHalf}>
                    <AppInput
                      label="Preço unit."
                      required
                      value={
                        priceField.value == null
                          ? ''
                          : formatCurrency(priceField.value)
                      }
                      onChangeText={(text) =>
                        priceField.onChange(parseCurrencyInput(text))
                      }
                      mask="currency"
                      placeholder="0,00"
                      error={fieldState.error?.message}
                      accessibilityLabel={`Preço unitário do item ${index + 1}`}
                    />
                  </View>
                )}
              />
            </View>
          </AppCard>
        ))}

        <AppButton
          title="+ Adicionar item"
          variant="outline"
          size="md"
          accessibilityLabel="Adicionar novo item"
          onPress={addItem}
          style={styles.addButton}
        />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>

        <Text style={styles.sectionLabel}>Observações</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <AppInput
              label="Observações"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Observações adicionais (opcional)"
              multiline
              accessibilityLabel="Observações do pedido"
            />
          )}
        />

        <AppButton
          title="Salvar"
          size="lg"
          accessibilityLabel="Salvar pedido de compra"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.saveButton}
        />
      </ScreenContainer>

      <SupplierPickerModal
        visible={supplierModalVisible}
        suppliers={suppliersQuery.data ?? []}
        isLoading={suppliersQuery.isLoading}
        isError={suppliersQuery.isError}
        errorMessage={
          suppliersQuery.isError
            ? toApiError(suppliersQuery.error).message
            : ''
        }
        onRetry={suppliersQuery.refetch}
        onSelect={(supplierId) => {
          setValue('supplierId', supplierId, { shouldDirty: true });
          setSupplierModalVisible(false);
        }}
        onClose={() => setSupplierModalVisible(false)}
      />

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
