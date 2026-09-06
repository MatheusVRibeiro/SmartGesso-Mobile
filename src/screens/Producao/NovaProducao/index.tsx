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
import { clientsService } from '@/src/services/api/clients';
import { worksService } from '@/src/services/api/works';
import { productionOrdersService } from '@/src/services/api/productionOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { Client } from '@/src/types/client';
import type { Work } from '@/src/types/work';
import { z } from 'zod';
import { createProductionOrderSchema } from '@/src/validation/schemas';
import { createNovaProducaoStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Tipo de entrada do schema (campos com .default() ficam opcionais antes do default).
 * O zodResolver tipa o formulário pelo input do schema.
 */
type ProductionOrderFormValues = z.input<typeof createProductionOrderSchema>;

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
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaProducaoStyles(colors, isDark), [colors, isDark]);
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
                : 'Cadastre um cliente antes de criar a ordem'
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
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="person-outline"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.document ? (
                    <Text style={styles.optionMeta} numberOfLines={1}>
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
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaProducaoStyles(colors, isDark), [colors, isDark]);
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
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="construct-outline"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.client?.name ? (
                    <Text style={styles.optionMeta} numberOfLines={1}>
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

export default function NovaOrdemProducaoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaProducaoStyles(colors, isDark), [colors, isDark]);
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
  } = useForm<ProductionOrderFormValues>({
    resolver: zodResolver(createProductionOrderSchema),
    defaultValues: {
      clientId: '',
      workId: '',
      dueDate: '',
      responsiblePerson: '',
      observations: '',
      items: [{ productName: '', quantity: 1, unit: 'un' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

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
    mutationFn: (data: ProductionOrderFormValues) => {
      // Clean payload: strip empty strings → undefined for optional fields
      const payload = {
        clientId: data.clientId?.trim() || undefined,
        workId: data.workId?.trim() || undefined,
        dueDate: data.dueDate?.trim() || undefined,
        responsiblePerson: data.responsiblePerson?.trim() || undefined,
        observations: data.observations?.trim() || undefined,
        items: (data.items ?? []).map((item) => ({
          productName: item.productName.trim(),
          quantity: parseFloat(String(item.quantity)) || 0,
          unit: item.unit?.trim() || 'un',
        })),
      };
      return productionOrdersService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'production-orders'],
      });
      setSnackbar({ type: 'success', message: 'Ordem de produção criada com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: ProductionOrderFormValues) {
    createMutation.mutate(data);
  }

  function addItem() {
    append({ productName: '', quantity: 1, unit: 'un' });
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Nova ordem de produção', headerShown: true }} />

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
            <Text style={styles.title}>Nova ordem de produção</Text>
            <Text style={styles.subtitle}>Preencha os dados para criar a ordem</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Cliente (opcional)</Text>
        <Controller
          control={control}
          name="clientId"
          render={({ field }) => {
            const selectedClient = clientsQuery.data?.find(
              (client) => client.id === field.value,
            );
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Selecionar cliente"
                onPress={() => setClientModalVisible(true)}
                style={styles.selectorCard}
              >
                <View style={styles.selectorIcon}>
                  <Ionicons
                    name="person-outline"
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
                  {selectedClient?.name ?? 'Selecione um cliente (opcional)'}
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
                style={styles.selectorCard}
              >
                <View style={styles.selectorIcon}>
                  <Ionicons
                    name="construct-outline"
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

        <Text style={styles.sectionLabel}>Dados da ordem</Text>
        <Controller
          control={control}
          name="dueDate"
          render={({ field, fieldState }) => (
            <AppInput
              label="Data prevista"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD"
              helper="Formato: AAAA-MM-DD (opcional)"
              error={fieldState.error?.message}
              accessibilityLabel="Data prevista da ordem de produção"
              leftAccessory={
                <Ionicons
                  name="calendar-outline"
                  size={sizes.icon.md}
                  color={colors.textLight}
                  accessibilityElementsHidden
                />
              }
            />
          )}
        />

        <Controller
          control={control}
          name="responsiblePerson"
          render={({ field, fieldState }) => (
            <AppInput
              label="Responsável"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Nome do responsável (opcional)"
              error={fieldState.error?.message}
              accessibilityLabel="Responsável pela ordem de produção"
              leftAccessory={
                <Ionicons
                  name="person-outline"
                  size={sizes.icon.md}
                  color={colors.textLight}
                  accessibilityElementsHidden
                />
              }
            />
          )}
        />

        <Text style={styles.sectionLabel}>Itens de produção</Text>
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
                  label="Produto"
                  required
                  value={nameField.value}
                  onChangeText={nameField.onChange}
                  placeholder="Ex.: Placa drywall 1,20x1,80"
                  error={fieldState.error?.message}
                  accessibilityLabel={`Produto do item ${index + 1}`}
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

        <Text style={styles.sectionLabel}>Observações</Text>
        <Controller
          control={control}
          name="observations"
          render={({ field }) => (
            <AppInput
              label="Observações"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Observações adicionais (opcional)"
              multiline
              accessibilityLabel="Observações"
            />
          )}
        />

        <AppButton
          title="Salvar"
          size="lg"
          accessibilityLabel="Salvar ordem de produção"
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
