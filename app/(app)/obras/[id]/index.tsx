import React, { useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
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
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../../src/components/ui/AppButton';
import { AppCard } from '../../../../src/components/ui/AppCard';
import { AppInput } from '../../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../../src/components/ui/AppSnackbar';
import { ConfirmDialog } from '../../../../src/components/ui/ConfirmDialog';
import { EmptyState } from '../../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../../src/services/api/client';
import { clientsService } from '../../../../src/services/api/clients';
import { worksService } from '../../../../src/services/api/works';
import { useSessionStore } from '../../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../../src/theme';
import type { Client } from '../../../../src/types/client';
import type { Work, WorkStatus } from '../../../../src/types/work';
import { z } from 'zod';
import { createWorkSchema } from '../../../../src/validation/schemas';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Tipo de entrada do schema (status opcional antes do `.default()`).
 * O zodResolver tipa o formulário pelo input do schema; usar o output
 * (CreateWorkFormData) causa incompatibilidade de tipos no useForm.
 */
type WorkFormValues = z.input<typeof createWorkSchema>;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

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

const WORK_STATUS_BADGE: Record<
  WorkStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PLANEJADA: { variant: 'expired', label: 'Planejada' },
  EM_ANDAMENTO: { variant: 'warning', label: 'Em andamento' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

const WORK_STATUS_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: 'PLANEJADA', label: 'Planejada' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

/** Cidade - UF (usado no header do perfil). */
function formatLocation(work: Work): string {
  const parts = [work.city, work.state].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(' - ') : 'Local não informado';
}

/** Endereço completo em linhas (rua, complemento, bairro, cidade, CEP). */
function formatAddress(work: Work): string {
  const lines = [
    [work.street, work.number].filter(Boolean).join(', '),
    work.complement,
    work.district,
    [work.city, work.state].filter(Boolean).join(' - '),
    work.postalCode,
  ].filter((part): part is string => Boolean(part));
  return lines.length > 0 ? lines.join('\n') : 'Endereço não informado';
}

// ─── Blocos navegáveis do perfil ────────────────────────────────────────────

interface WorkBlock {
  key: string;
  title: string;
  subtitle: string;
  icon: IoniconName;
  href: (workId: string) => string;
}

const WORK_BLOCKS: WorkBlock[] = [
  {
    key: 'medicoes',
    title: 'Ambientes / Medições',
    subtitle: 'Ambientes e medições da obra',
    icon: 'resize-outline',
    href: (workId) => `/obras/${workId}/medicoes`,
  },
  {
    key: 'materiais',
    title: 'Materiais / Cálculo',
    subtitle: 'Cálculo de materiais da obra',
    icon: 'calculator-outline',
    href: (workId) => `/obras/${workId}/materiais`,
  },
  {
    key: 'orcamentos',
    title: 'Orçamentos',
    subtitle: 'Orçamentos vinculados à obra',
    icon: 'document-text-outline',
    href: (workId) => `/orcamentos?workId=${workId}`,
  },
  {
    key: 'servicos',
    title: 'Serviços',
    subtitle: 'Ordens de serviço da obra',
    icon: 'hammer-outline',
    href: (workId) => `/servicos?workId=${workId}`,
  },
  {
    key: 'pagamentos',
    title: 'Pagamentos',
    subtitle: 'Pagamentos da obra',
    icon: 'cash-outline',
    href: (workId) => `/pagamentos?workId=${workId}`,
  },
];

function WorkBlockCard({ block, workId }: { block: WorkBlock; workId: string }) {
  const router = useRouter();

  return (
    <AppCard shadow="light" radius={radius.md} style={styles.blockCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={block.title}
        onPress={() => router.push(block.href(workId))}
        style={({ pressed }) => [
          styles.blockPressable,
          pressed && styles.blockPressed,
        ]}
      >
        <View style={styles.blockIcon}>
          <Ionicons
            name={block.icon}
            size={sizes.icon.md}
            color={colors.primary}
            accessibilityElementsHidden
          />
        </View>
        <View style={styles.blockInfo}>
          <Text style={styles.blockTitle} numberOfLines={1}>
            {block.title}
          </Text>
          <Text style={styles.blockSubtitle} numberOfLines={1}>
            {block.subtitle}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={sizes.icon.md}
          color={colors.textLight}
          accessibilityElementsHidden
        />
      </Pressable>
    </AppCard>
  );
}

// ─── Linha de informação (label + valor) ────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: IoniconName;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowDivider]}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={sizes.icon.sm}
          color={colors.primary}
          accessibilityElementsHidden
        />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={3}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Seletor de status ──────────────────────────────────────────────────────

function StatusSelector({
  value,
  onChange,
}: {
  value: WorkStatus;
  onChange: (status: WorkStatus) => void;
}) {
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

export default function PerfilObraScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const workId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [editing, setEditing] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
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

  const workQuery = useQuery({
    queryKey: ['company', companyId, 'works', workId],
    queryFn: () => worksService.getById(workId as string),
    enabled: Boolean(companyId && workId),
  });

  const clientsQuery = useQuery({
    queryKey: ['company', companyId, 'clients'],
    queryFn: () => clientsService.list(),
    select: (result) => toArray<Client>(result),
    enabled: Boolean(companyId),
  });

  // Preenche o formulário quando a obra carrega.
  useEffect(() => {
    const work = workQuery.data;
    if (!work) return;
    reset({
      clientId: work.clientId,
      name: work.name,
      reference: work.reference ?? '',
      postalCode: work.postalCode ?? '',
      street: work.street ?? '',
      number: work.number ?? '',
      complement: work.complement ?? '',
      district: work.district ?? '',
      city: work.city ?? '',
      state: work.state ?? '',
      status: work.status,
      observations: work.observations ?? '',
    });
  }, [workQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: WorkFormValues) =>
      worksService.update(workId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'works'],
      });
      setEditing(false);
      setSnackbar({ type: 'success', message: 'Obra atualizada com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => worksService.remove(workId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'works'],
      });
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Obra excluída com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: WorkFormValues) {
    updateMutation.mutate(data);
  }

  if (!workId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Obra', headerShown: true }} />
        <ErrorState message="Obra não encontrada" />
      </ScreenContainer>
    );
  }

  const work = workQuery.data;
  const badge = work ? WORK_STATUS_BADGE[work.status] : null;

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={editing}>
        <Stack.Screen
          options={{
            title: editing ? 'Editar obra' : 'Perfil da Obra',
            headerShown: true,
          }}
        />

        <View style={styles.header}>
          <Text style={styles.title}>
            {editing ? 'Editar obra' : 'Perfil da Obra'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Excluir obra"
            onPress={() => setConfirmDeleteVisible(true)}
            hitSlop={8}
            style={styles.headerAction}
          >
            <Ionicons name="trash-outline" size={sizes.icon.lg} color={colors.danger} />
          </Pressable>
        </View>

        {workQuery.isLoading ? (
          <LoadingState text="Carregando obra..." />
        ) : workQuery.isError ? (
          <ErrorState
            message={toApiError(workQuery.error).message}
            onRetry={workQuery.refetch}
          />
        ) : work && badge ? (
          editing ? (
            <>
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
                    onChangeText={field.onChange}
                    placeholder="00000-000"
                    keyboardType="number-pad"
                    maxLength={9}
                    error={fieldState.error?.message}
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
                title="Salvar alterações"
                size="lg"
                loading={updateMutation.isPending}
                onPress={handleSubmit(onSubmit)}
                accessibilityLabel="Salvar alterações"
                style={styles.submitButton}
              />
              <AppButton
                title="Cancelar"
                variant="ghost"
                size="lg"
                onPress={() => setEditing(false)}
                accessibilityLabel="Cancelar edição"
                style={styles.cancelButton}
              />
            </>
          ) : (
            <>
              {/* Header do perfil: nome + status + cliente + cidade */}
              <AppCard shadow="light" radius={radius.lg} style={styles.heroCard}>
                <View style={styles.heroHeader}>
                  <Text style={styles.heroTitle} numberOfLines={2}>
                    {work.name}
                  </Text>
                  <StatusBadge status={badge.variant} label={badge.label} />
                </View>
                <View style={styles.heroRow}>
                  <Ionicons
                    name="person-outline"
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.heroText} numberOfLines={1}>
                    {work.client?.name ?? 'Cliente não informado'}
                  </Text>
                </View>
                <View style={styles.heroRow}>
                  <Ionicons
                    name="location-outline"
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.heroText} numberOfLines={1}>
                    {formatLocation(work)}
                  </Text>
                </View>
              </AppCard>

              {/* Blocos navegáveis */}
              <Text style={styles.sectionLabel}>Acesso rápido</Text>
              {WORK_BLOCKS.map((block) => (
                <WorkBlockCard key={block.key} block={block} workId={workId} />
              ))}

              {/* Informações básicas */}
              <Text style={styles.sectionLabel}>Informações</Text>
              <AppCard shadow="light" radius={radius.lg} style={styles.infoCard}>
                <InfoRow
                  icon="person-outline"
                  label="Cliente"
                  value={work.client?.name ?? 'Cliente não informado'}
                />
                <InfoRow
                  icon="location-outline"
                  label="Endereço"
                  value={formatAddress(work)}
                />
                <InfoRow
                  icon="pricetag-outline"
                  label="Referência"
                  value={work.reference?.trim() ? work.reference : 'Não informada'}
                />
                <InfoRow
                  icon="document-text-outline"
                  label="Observações"
                  value={
                    work.observations?.trim() ? work.observations : 'Sem observações'
                  }
                  isLast
                />
              </AppCard>

              <AppButton
                title="Editar obra"
                variant="outline"
                size="lg"
                accessibilityLabel="Editar obra"
                onPress={() => setEditing(true)}
                style={styles.editButton}
              />
            </>
          )
        ) : null}
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

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Excluir obra"
        message="Tem certeza que deseja excluir esta obra? Essa ação não pode ser desfeita."
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
  headerAction: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  // Header do perfil (hero)
  heroCard: {
    marginBottom: spacing.xs,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroTitle: {
    flex: 1,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  heroText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  // Blocos navegáveis
  blockCard: {
    marginBottom: spacing.sm,
  },
  blockPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  blockPressed: {
    opacity: 0.7,
  },
  blockIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockInfo: {
    flex: 1,
    gap: 2,
  },
  blockTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  blockSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  // Informações
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  editButton: {
    marginTop: spacing.xs,
  },
  // Formulário de edição
  clientField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    height: sizes.inputHeight,
    marginBottom: spacing.lg,
  },
  clientFieldError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  clientFieldText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  clientFieldPlaceholder: {
    color: colors.textLight,
  },
  fieldError: {
    fontSize: typography.sizes.xs,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  statusChipTextSelected: {
    color: colors.textOnPrimary,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
  // Modal de cliente
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalClose: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearch: {
    paddingHorizontal: sizes.screenPadding,
  },
  modalList: {
    padding: sizes.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing['3xl'],
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  clientOptionPressed: {
    opacity: 0.7,
  },
  clientOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});