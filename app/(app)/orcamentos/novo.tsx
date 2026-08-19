import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { toApiError } from '../../../src/services/api/client';
import { clientsService } from '../../../src/services/api/clients';
import { worksService } from '../../../src/services/api/works';
import { quotesService } from '../../../src/services/api/quotes';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency, formatNumber } from '../../../src/utils/format';
import type { Client } from '../../../src/types/client';
import type { Work } from '../../../src/types/work';
import type { QuoteItemType, QuotePaymentMethod } from '../../../src/types/quote';
import { z } from 'zod';
import { createQuoteSchema } from '../../../src/validation/schemas';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Tipo de entrada do schema (campos com .default() ficam opcionais antes do default).
 * O zodResolver tipa o formulário pelo input do schema.
 */
type QuoteFormValues = z.input<typeof createQuoteSchema>;

/**
 * A API real retorna array puro em GET /clients e GET /works (Prisma findMany),
 * enquanto o tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const ITEM_TYPE_OPTIONS: { value: QuoteItemType; label: string }[] = [
  { value: 'PRODUTO', label: 'Produto' },
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'MAO_DE_OBRA', label: 'Mão de obra' },
  { value: 'TRANSPORTE', label: 'Transporte' },
];

const PAYMENT_METHOD_OPTIONS: { value: QuotePaymentMethod; label: string }[] = [
  { value: 'AVISTA', label: 'À vista' },
  { value: 'AVISTA_DESCONTO', label: 'À vista c/ desconto' },
  { value: 'ENTRADA_SALDO', label: 'Entrada + saldo' },
  { value: 'QUINZENAL_2X', label: 'Quinzenal 2x' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'PARCELADO', label: 'Parcelado' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
];

// ─── Modal de seleção de cliente ────────────────────────────────────────────

interface ClientPickerModalProps {
  visible: boolean;
  clients: Client[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onSelect: (clientId: string) => void;
  onClose: () => void;
}

function ClientPickerModal({
  visible,
  clients,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  onClose,
}: ClientPickerModalProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(term),
    );
  }, [clients, search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Selecionar cliente</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção de cliente"
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
            placeholder="Buscar cliente..."
            accessibilityLabel="Buscar cliente"
            returnKeyType="search"
          />
        </View>

        {isLoading ? (
          <LoadingState text="Carregando clientes..." />
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              search.trim()
                ? 'Nenhum cliente encontrado'
                : 'Nenhum cliente cadastrado'
            }
            description={
              search.trim()
                ? 'Tente buscar com outro termo'
                : 'Cadastre um cliente antes de criar o orçamento'
            }
            icon="people-outline"
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
                accessibilityLabel={`Selecionar cliente ${item.name}`}
                onPress={() => onSelect(item.id)}
                style={({ pressed }) => [
                  styles.clientOption,
                  pressed && styles.clientOptionPressed,
                ]}
              >
                <View style={styles.clientOptionIcon}>
                  <Ionicons
                    name="person-outline"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.clientOptionInfo}>
                  <Text style={styles.clientOptionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.document ? (
                    <Text style={styles.clientOptionMeta} numberOfLines={1}>
                      {item.document}
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

// ─── Modal de seleção de obra ───────────────────────────────────────────────

interface WorkPickerModalProps {
  visible: boolean;
  works: Work[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onSelect: (workId: string) => void;
  onClose: () => void;
}

function WorkPickerModal({
  visible,
  works,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  onClose,
}: WorkPickerModalProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return works;
    return works.filter((work) =>
      work.name.toLowerCase().includes(term),
    );
  }, [works, search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Selecionar obra</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção de obra"
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
            placeholder="Buscar obra..."
            accessibilityLabel="Buscar obra"
            returnKeyType="search"
          />
        </View>

        {isLoading ? (
          <LoadingState text="Carregando obras..." />
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              search.trim()
                ? 'Nenhuma obra encontrada'
                : 'Nenhuma obra cadastrada'
            }
            description={
              search.trim()
                ? 'Tente buscar com outro termo'
                : 'Cadastre uma obra ou selecione sem obra'
            }
            icon="construct-outline"
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
                accessibilityLabel={`Selecionar obra ${item.name}`}
                onPress={() => onSelect(item.id)}
                style={({ pressed }) => [
                  styles.clientOption,
                  pressed && styles.clientOptionPressed,
                ]}
              >
                <View style={styles.clientOptionIcon}>
                  <Ionicons
                    name="construct-outline"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.clientOptionInfo}>
                  <Text style={styles.clientOptionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.client?.name ? (
                    <Text style={styles.clientOptionMeta} numberOfLines={1}>
                      {item.client.name}
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

export default function NovoOrcamentoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [workModalVisible, setWorkModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      clientId: '',
      workId: '',
      discount: 0,
      marginPct: 0,
      paymentMethod: 'AVISTA',
      observations: '',
      items: [{ itemType: 'SERVICO', name: '', quantity: 1, unit: 'un', unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Observa os itens para calcular o subtotal em tempo real
  const watchedItems = useWatch({ control, name: 'items' });

  const itemsTotal = useMemo(() => {
    if (!watchedItems) return 0;
    return watchedItems.reduce((sum, item) => {
      const qty = parseFloat(String(item.quantity)) || 0;
      const price = parseFloat(String(item.unitPrice)) || 0;
      return sum + qty * price;
    }, 0);
  }, [watchedItems]);

  // Observa desconto e margem para o TOTAL em tempo real
  const watchedDiscount = useWatch({ control, name: 'discount' });
  const watchedMargin = useWatch({ control, name: 'marginPct' });

  const quoteTotal = useMemo(() => {
    const subtotal = itemsTotal;
    const discount = parseFloat(String(watchedDiscount)) || 0;
    const marginPct = parseFloat(String(watchedMargin)) || 0;
    return subtotal - discount + (subtotal * marginPct) / 100;
  }, [itemsTotal, watchedDiscount, watchedMargin]);

  const clientsQuery = useQuery({
    queryKey: ['company', companyId, 'clients'],
    queryFn: () => clientsService.list(),
    select: (result) => toArray<Client>(result),
    enabled: Boolean(companyId),
  });

  const worksQuery = useQuery({
    queryKey: ['company', companyId, 'works'],
    queryFn: () => worksService.list(),
    select: (result) => toArray<Work>(result),
    enabled: Boolean(companyId),
  });

  const createMutation = useMutation({
    mutationFn: (data: QuoteFormValues) => {
      // Clean payload: strip empty strings → undefined for optional fields
      const payload = {
        clientId: data.clientId,
        workId: data.workId?.trim() || undefined,
        discount: data.discount ?? 0,
        marginPct: data.marginPct ?? 0,
        paymentMethod: data.paymentMethod ?? 'AVISTA',
        observations: data.observations?.trim() || undefined,
        items: (data.items ?? []).map((item) => ({
          itemType: item.itemType,
          name: item.name.trim(),
          description: item.description?.trim() || undefined,
          quantity: parseFloat(String(item.quantity)) || 0,
          unit: item.unit?.trim() || 'un',
          unitPrice: parseFloat(String(item.unitPrice)) || 0,
        })),
      };
      return quotesService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      setSnackbar({ type: 'success', message: 'Orçamento criado com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: QuoteFormValues) {
    createMutation.mutate(data);
  }

  function addItem() {
    append({ itemType: 'SERVICO', name: '', quantity: 1, unit: 'un', unitPrice: 0 });
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Novo orçamento', headerShown: true }} />

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
            <Text style={styles.title}>Novo orçamento</Text>
            <Text style={styles.subtitle}>Preencha os dados e adicione itens</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Cliente</Text>
        <Controller
          control={control}
          name="clientId"
          render={({ field, fieldState }) => {
            const selectedClient = clientsQuery.data?.find(
              (client) => client.id === field.value,
            );
            return (
              <>
                <AppCard shadow="light" radius={radius.lg} style={styles.clientCard}>
                  <View style={styles.clientCardContent}>
                    <View style={styles.clientIcon}>
                      <Ionicons
                        name="person-outline"
                        size={sizes.icon.md}
                        color={colors.primary}
                        accessibilityElementsHidden
                      />
                    </View>
                    <View style={styles.clientInfo}>
                      <Text style={styles.clientLabel}>Cliente</Text>
                      <Text
                        style={[
                          styles.clientName,
                          field.value === '' && styles.selectorPlaceholder,
                        ]}
                        numberOfLines={1}
                      >
                        {selectedClient?.name ?? 'Selecione um cliente'}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Trocar cliente"
                      onPress={() => setClientModalVisible(true)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.clientChangeButton,
                        pressed && styles.clientChangeButtonPressed,
                      ]}
                    >
                      <Text style={styles.clientChangeText}>Trocar</Text>
                    </Pressable>
                  </View>
                </AppCard>
                {fieldState.error ? (
                  <Text style={styles.fieldError}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </>
            );
          }}
        />

        <Text style={styles.sectionLabel}>Obra (opcional)</Text>
        <Controller
          control={control}
          name="workId"
          render={({ field }) => {
            const selectedWork = worksQuery.data?.find(
              (work) => work.id === field.value,
            );
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Selecionar obra"
                onPress={() => setWorkModalVisible(true)}
                style={styles.selectorField}
              >
                <Ionicons
                  name="construct-outline"
                  size={sizes.icon.md}
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
                <Text
                  style={[
                    styles.selectorText,
                    !field.value && styles.selectorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {selectedWork?.name ?? 'Selecione uma obra (opcional)'}
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

        <Text style={styles.sectionLabel}>Itens do orçamento</Text>
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
                    color={colors.error}
                  />
                </Pressable>
              )}
            </View>

            <Controller
              control={control}
              name={`items.${index}.itemType`}
              render={({ field: itemTypeField }) => (
                <View style={styles.itemTypeRow}>
                  {ITEM_TYPE_OPTIONS.map((option) => {
                    const selected = option.value === itemTypeField.value;
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityLabel={`Tipo ${option.label}`}
                        accessibilityState={{ selected }}
                        onPress={() => itemTypeField.onChange(option.value)}
                        style={[
                          styles.itemTypeChip,
                          selected && styles.itemTypeChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemTypeChipText,
                            selected && styles.itemTypeChipTextSelected,
                          ]}
                          numberOfLines={1}
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
              name={`items.${index}.name`}
              render={({ field: nameField, fieldState }) => (
                <AppInput
                  label="Descrição"
                  required
                  value={nameField.value}
                  onChangeText={nameField.onChange}
                  placeholder="Ex.: Instalação de forro"
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
                name={`items.${index}.unit`}
                render={({ field: unitField }) => (
                  <View style={styles.itemFieldSmall}>
                    <AppInput
                      label="Un"
                      value={unitField.value ?? 'un'}
                      onChangeText={unitField.onChange}
                      placeholder="un"
                      accessibilityLabel={`Unidade do item ${index + 1}`}
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
                      value={priceField.value == null ? '' : String(priceField.value)}
                      onChangeText={(text) => priceField.onChange(text)}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                      error={fieldState.error?.message}
                      accessibilityLabel={`Preço unitário do item ${index + 1}`}
                    />
                  </View>
                )}
              />
            </View>

            <View style={styles.itemSubtotalRow}>
              <Text style={styles.itemSubtotalLabel}>
                {formatNumber(parseFloat(String(watchedItems?.[index]?.quantity)) || 0)} ×{' '}
                {formatCurrency(parseFloat(String(watchedItems?.[index]?.unitPrice)) || 0)}
              </Text>
              <Text style={styles.itemSubtotalValue}>
                {formatCurrency(
                  (parseFloat(String(watchedItems?.[index]?.quantity)) || 0) *
                    (parseFloat(String(watchedItems?.[index]?.unitPrice)) || 0),
                )}
              </Text>
            </View>
          </AppCard>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar item ao orçamento"
          onPress={addItem}
          style={({ pressed }) => [
            styles.addItemButton,
            pressed && styles.addItemButtonPressed,
          ]}
        >
          <Ionicons
            name="add"
            size={sizes.icon.md}
            color={colors.primary}
            accessibilityElementsHidden
          />
          <Text style={styles.addItemText}>Adicionar item</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Totais</Text>
        <AppCard shadow="light" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(itemsTotal)}</Text>
          </View>

          <View style={styles.summaryFieldsRow}>
            <Controller
              control={control}
              name="discount"
              render={({ field: discountField }) => (
                <View style={styles.itemFieldHalf}>
                  <AppInput
                    label="Desconto (R$)"
                    value={discountField.value == null ? '' : String(discountField.value)}
                    onChangeText={(text) => discountField.onChange(text)}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Desconto"
                    style={styles.summaryInput}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="marginPct"
              render={({ field: marginField }) => (
                <View style={styles.itemFieldHalf}>
                  <AppInput
                    label="Margem (%)"
                    value={marginField.value == null ? '' : String(marginField.value)}
                    onChangeText={(text) => marginField.onChange(text)}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Margem percentual"
                    style={styles.summaryInput}
                  />
                </View>
              )}
            />
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(quoteTotal)}</Text>
          </View>
        </AppCard>

        <Text style={styles.sectionLabel}>Forma de pagamento</Text>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field: paymentField }) => (
            <View style={styles.paymentRow}>
              {PAYMENT_METHOD_OPTIONS.map((option) => {
                const selected = option.value === paymentField.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={`Forma de pagamento ${option.label}`}
                    accessibilityState={{ selected }}
                    onPress={() => paymentField.onChange(option.value)}
                    style={[
                      styles.paymentChip,
                      selected && styles.paymentChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentChipText,
                        selected && styles.paymentChipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <Text style={styles.sectionLabel}>Observações</Text>
        <Controller
          control={control}
          name="observations"
          render={({ field: obsField }) => (
            <AppInput
              label="Observações"
              value={obsField.value ?? ''}
              onChangeText={obsField.onChange}
              placeholder="Observações adicionais (opcional)"
              accessibilityLabel="Observações"
            />
          )}
        />

        <AppButton
          title="Salvar orçamento"
          size="lg"
          accessibilityLabel="Salvar orçamento"
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.saveButton}
        />
      </ScreenContainer>

      <ClientPickerModal
        visible={clientModalVisible}
        clients={clientsQuery.data ?? []}
        isLoading={clientsQuery.isLoading}
        isError={clientsQuery.isError}
        errorMessage={clientsQuery.isError ? toApiError(clientsQuery.error).message : ''}
        onRetry={clientsQuery.refetch}
        onSelect={(clientId) => {
          setValue('clientId', clientId, { shouldValidate: true, shouldDirty: true });
          setClientModalVisible(false);
        }}
        onClose={() => setClientModalVisible(false)}
      />

      <WorkPickerModal
        visible={workModalVisible}
        works={worksQuery.data ?? []}
        isLoading={worksQuery.isLoading}
        isError={worksQuery.isError}
        errorMessage={worksQuery.isError ? toApiError(worksQuery.error).message : ''}
        onRetry={worksQuery.refetch}
        onSelect={(workId) => {
          setValue('workId', workId, { shouldDirty: true });
          setWorkModalVisible(false);
        }}
        onClose={() => setWorkModalVisible(false)}
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
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  clientCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clientIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  clientName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  clientChangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clientChangeButtonPressed: {
    opacity: 0.7,
  },
  clientChangeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  selectorField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: sizes.inputHeight,
    gap: spacing.sm,
  },
  selectorText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  selectorPlaceholder: {
    color: colors.textLight,
  },
  fieldError: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  itemCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  removeItemButton: {
    padding: spacing.xs,
  },
  itemTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  itemTypeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  itemTypeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemTypeChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  itemTypeChipTextSelected: {
    color: colors.textOnPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemFieldHalf: {
    flex: 1,
  },
  itemFieldSmall: {
    width: 60,
  },
  itemSubtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  itemSubtotalLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  itemSubtotalValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addItemButtonPressed: {
    opacity: 0.7,
  },
  addItemText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryFieldsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  summaryInput: {
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  paymentChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  paymentChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  paymentChipTextSelected: {
    color: colors.textOnPrimary,
  },
  saveButton: {
    marginTop: spacing.xl,
    marginBottom: spacing['3xl'],
  },
  // Modal styles
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalSearch: {
    padding: sizes.screenPadding,
    paddingBottom: spacing.sm,
  },
  modalList: {
    padding: sizes.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.card,
  },
  clientOptionPressed: {
    opacity: 0.7,
  },
  clientOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  clientOptionInfo: {
    flex: 1,
  },
  clientOptionName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  clientOptionMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
