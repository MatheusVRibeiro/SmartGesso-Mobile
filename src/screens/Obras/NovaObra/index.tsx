import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCepLookup } from '@/src/hooks/useCepLookup';
import { AppButton } from '@/src/components/ui/AppButton';
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
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { Client } from '@/src/types/client';
import type { WorkStatus } from '@/src/types/work';
import { z } from 'zod';
import { createWorkSchema } from '@/src/validation/schemas';
import { createNovaObraStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Tipo de entrada do schema (status opcional antes do `.default()`).
 * O zodResolver tipa o formulário pelo input do schema; usar o output
 * (CreateWorkFormData) causa incompatibilidade de tipos no useForm.
 */
type WorkFormValues = z.input<typeof createWorkSchema>;

/**
 * A API real retorna array puro em GET /clients (Prisma findMany), enquanto o
 * tipo declarado é { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const WORK_STATUS_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: 'PLANEJADA', label: 'Planejada' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

// ─── Seletor de status ──────────────────────────────────────────────────────

function StatusSelector({
  value,
  onChange,
}: {
  value: WorkStatus;
  onChange: (status: WorkStatus) => void;
}) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaObraStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={styles.statusRow}>
      {WORK_STATUS_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`Status ${option.label}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.statusChip, selected && styles.statusChipSelected]}
          >
            <Text
              style={[
                styles.statusChipText,
                selected && styles.statusChipTextSelected,
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
  const styles = useMemo(() => createNovaObraStyles(colors, isDark), [colors, isDark]);
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
                : 'Cadastre um cliente antes de criar a obra'
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

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function NovaObraScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovaObraStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
  } = useForm<WorkFormValues>({
    resolver: zodResolver(createWorkSchema),
    defaultValues: {
      clientId: '',
      name: '',
      reference: '',
      postalCode: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      status: 'PLANEJADA',
      observations: '',
    },
  });

  const {
    isLoading: isLoadingCep,
    error: cepError,
    handleCepChange,
    searchCep,
  } = useCepLookup();

  const handleApplyAddress = (addr: any) => {
    if (addr.street) setValue('street', addr.street);
    if (addr.neighborhood) setValue('district', addr.neighborhood);
    if (addr.city) setValue('city', addr.city);
    if (addr.state) setValue('state', addr.state);
  };

  const clientsQuery = useQuery({
    queryKey: ['company', companyId, 'clients'],
    queryFn: () => clientsService.list(),
    select: (result) => toArray<Client>(result),
    enabled: Boolean(companyId),
  });

  const createMutation = useMutation({
    mutationFn: (data: WorkFormValues) => worksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'works'],
      });
      setSnackbar({ type: 'success', message: 'Obra criada com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: WorkFormValues) {
    createMutation.mutate(data);
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Nova obra', headerShown: true }} />

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
            <Text style={styles.title}>Nova obra</Text>
            <Text style={styles.subtitle}>Cadastre os dados da obra.</Text>
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
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar cliente"
                  onPress={() => setClientModalVisible(true)}
                  style={[
                    styles.clientField,
                    fieldState.error != null && styles.clientFieldError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={sizes.icon.md}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text
                    style={[
                      styles.clientFieldText,
                      field.value === '' && styles.clientFieldPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedClient?.name ?? 'Selecione um cliente'}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={sizes.icon.md}
                    color={colors.textLight}
                    accessibilityElementsHidden
                  />
                </Pressable>
                {fieldState.error ? (
                  <Text style={styles.fieldError}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </>
            );
          }}
        />

        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <AppInput
              label="Nome da obra"
              required
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Ex.: Apartamento 302"
              error={fieldState.error?.message}
              accessibilityLabel="Nome da obra"
            />
          )}
        />

        <Controller
          control={control}
          name="reference"
          render={({ field, fieldState }) => (
            <AppInput
              label="Referência"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Ex.: Obra do cliente Silva (opcional)"
              error={fieldState.error?.message}
              accessibilityLabel="Referência"
            />
          )}
        />

        <Text style={styles.sectionLabel}>Endereço</Text>

        <Controller
          control={control}
          name="postalCode"
          render={({ field, fieldState }) => (
            <AppInput
              label="CEP"
              value={field.value ?? ''}
              onChangeText={(text) => handleCepChange(text, handleApplyAddress, field.onChange)}
              mask="cep"
              placeholder="00000-000"
              rightAccessory={
                isLoadingCep ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <TouchableOpacity
                    onPress={() => field.value && searchCep(field.value, handleApplyAddress, true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="search-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )
              }
              helper={isLoadingCep ? 'Buscando endereço...' : undefined}
              error={fieldState.error?.message || cepError || undefined}
              accessibilityLabel="CEP"
            />
          )}
        />

        <Controller
          control={control}
          name="street"
          render={({ field, fieldState }) => (
            <AppInput
              label="Rua"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Rua, avenida..."
              error={fieldState.error?.message}
              accessibilityLabel="Rua"
            />
          )}
        />

        <Controller
          control={control}
          name="number"
          render={({ field, fieldState }) => (
            <AppInput
              label="Número"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Nº"
              error={fieldState.error?.message}
              accessibilityLabel="Número"
            />
          )}
        />

        <Controller
          control={control}
          name="complement"
          render={({ field, fieldState }) => (
            <AppInput
              label="Complemento"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Apto, bloco... (opcional)"
              error={fieldState.error?.message}
              accessibilityLabel="Complemento"
            />
          )}
        />

        <Controller
          control={control}
          name="district"
          render={({ field, fieldState }) => (
            <AppInput
              label="Bairro"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Bairro"
              error={fieldState.error?.message}
              accessibilityLabel="Bairro"
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => (
            <AppInput
              label="Cidade"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Cidade"
              error={fieldState.error?.message}
              accessibilityLabel="Cidade"
            />
          )}
        />

        <Controller
          control={control}
          name="state"
          render={({ field, fieldState }) => (
            <AppInput
              label="Estado"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="UF"
              maxLength={2}
              autoCapitalize="characters"
              error={fieldState.error?.message}
              accessibilityLabel="Estado"
            />
          )}
        />

        <Text style={styles.sectionLabel}>Status</Text>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <StatusSelector
              value={field.value ?? 'PLANEJADA'}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="observations"
          render={({ field, fieldState }) => (
            <AppInput
              label="Observações"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Anotações sobre a obra (opcional)"
              error={fieldState.error?.message}
              accessibilityLabel="Observações"
            />
          )}
        />

        <AppButton
          title="Salvar obra"
          size="lg"
          loading={createMutation.isPending}
          onPress={handleSubmit(onSubmit)}
          accessibilityLabel="Salvar obra"
          style={styles.submitButton}
        />
      </ScreenContainer>

      <ClientPickerModal
        visible={clientModalVisible}
        clients={clientsQuery.data ?? []}
        isLoading={clientsQuery.isLoading}
        isError={clientsQuery.isError}
        errorMessage={toApiError(clientsQuery.error).message}
        onRetry={() => clientsQuery.refetch()}
        onSelect={(clientId) => {
          setValue('clientId', clientId, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setClientModalVisible(false);
        }}
        onClose={() => setClientModalVisible(false)}
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
