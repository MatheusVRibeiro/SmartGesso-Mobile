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
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { toApiError } from '../../../src/services/api/client';
import { clientsService } from '../../../src/services/api/clients';
import { paymentsService } from '../../../src/services/api/payments';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';
import type { Client } from '../../../src/types/client';
import type { CreatePaymentInput, PaymentMethod } from '../../../src/types/finance';
import { z } from 'zod';
import {
  createPaymentSchema,
  type CreatePaymentFormData,
} from '../../../src/validation/schemas';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Tipo de entrada do schema (paymentMethod opcional antes do `.default()`).
 * O zodResolver tipa o formulário pelo input do schema.
 */
type PaymentFormValues = z.input<typeof createPaymentSchema>;

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

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'PIX', label: 'Pix' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO_CREDITO', label: 'Crédito' },
  { value: 'CARTAO_DEBITO', label: 'Débito' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OUTRO', label: 'Outro' },
];

/**
 * DTOs NestJS usam @IsOptional() que NÃO ignora string vazia — strip
 * '' → undefined antes do mutate (padrão cleanPayload do projeto).
 */
function cleanPayload(
  data: CreatePaymentFormData,
  installmentCount: number,
): CreatePaymentInput {
  return {
    clientId: data.clientId,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    paymentDate: data.paymentDate?.trim() || undefined,
    dueDate: data.dueDate?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    installmentCount: installmentCount > 1 ? installmentCount : undefined,
  };
}

// ─── Parcelamento (helpers) ─────────────────────────────────────────────────

const MAX_INSTALLMENTS = 12;

/** Converte "AAAA-MM-DD" em Date local (sem timezone shift). */
function parseDateInput(value?: string): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDayMonth(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

interface InstallmentPreview {
  number: number;
  amount: number;
  dueDate: Date;
}

/**
 * Gera a prévia das parcelas: valor total dividido igualmente (última parcela
 * absorve o arredondamento) e vencimentos mensais a partir da data base
 * (dueDate → paymentDate → hoje).
 */
function buildInstallmentsPreview(
  count: number,
  total: number,
  baseDate: Date,
): InstallmentPreview[] {
  const items: InstallmentPreview[] = [];
  const perInstallment = Math.round((total / count) * 100) / 100;
  let acc = 0;
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const amount = isLast
      ? Math.round((total - acc) * 100) / 100
      : perInstallment;
    acc += amount;
    const dueDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth() + i,
      baseDate.getDate(),
    );
    items.push({ number: i + 1, amount, dueDate });
  }
  return items;
}

// ─── Seletor de método de pagamento ─────────────────────────────────────────

function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod | undefined;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <View style={styles.methodRow}>
      {PAYMENT_METHOD_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`Método ${option.label}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.methodChip, selected && styles.methodChipSelected]}
          >
            <Text
              style={[
                styles.methodChipText,
                selected && styles.methodChipTextSelected,
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
                : 'Cadastre um cliente antes de registrar o pagamento'
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

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function NovoPagamentoScreen() {
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
  } = useForm<PaymentFormValues, any, CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      clientId: '',
      paymentMethod: 'PIX',
      paymentDate: '',
      dueDate: '',
      notes: '',
    },
  });

  // Parcelamento
  const [installmentCount, setInstallmentCount] = useState(1);
  const watchedAmount = useWatch({ control, name: 'amount' });
  const watchedPaymentDate = useWatch({ control, name: 'paymentDate' });
  const watchedDueDate = useWatch({ control, name: 'dueDate' });

  const installmentsPreview = useMemo(() => {
    if (installmentCount <= 1) return [];
    const total = Number(watchedAmount);
    if (!Number.isFinite(total) || total <= 0) return [];
    const baseDate =
      parseDateInput(watchedDueDate) ??
      parseDateInput(watchedPaymentDate) ??
      new Date();
    return buildInstallmentsPreview(installmentCount, total, baseDate);
  }, [installmentCount, watchedAmount, watchedDueDate, watchedPaymentDate]);

  const clientsQuery = useQuery({
    queryKey: ['company', companyId, 'clients'],
    queryFn: () => clientsService.list(),
    select: (result) => toArray<Client>(result),
    enabled: Boolean(companyId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentFormData) =>
      paymentsService.create(cleanPayload(data, installmentCount)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'payments'],
      });
      setSnackbar({ type: 'success', message: 'Pagamento registrado com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  function onSubmit(data: CreatePaymentFormData) {
    createMutation.mutate(data);
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Novo pagamento', headerShown: true }} />

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
            <Text style={styles.title}>Novo pagamento</Text>
            <Text style={styles.subtitle}>Registre um pagamento recebido do cliente.</Text>
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
                    styles.selectorField,
                    fieldState.error != null && styles.selectorFieldError,
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
                      styles.selectorText,
                      field.value === '' && styles.selectorPlaceholder,
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

        <Text style={styles.sectionLabel}>Valor</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <AppInput
              label="Valor (R$)"
              required
              value={field.value == null ? '' : String(field.value)}
              onChangeText={field.onChange}
              placeholder="0,00"
              keyboardType="decimal-pad"
              error={fieldState.error?.message}
              accessibilityLabel="Valor do pagamento"
            />
          )}
        />

        <Text style={styles.sectionLabel}>Método de pagamento</Text>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <PaymentMethodSelector
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Text style={styles.sectionLabel}>Datas</Text>
        <Controller
          control={control}
          name="paymentDate"
          render={({ field }) => (
            <AppInput
              label="Data do pagamento"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD (opcional)"
              autoCapitalize="none"
              accessibilityLabel="Data do pagamento"
            />
          )}
        />
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <AppInput
              label="Vencimento"
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD (opcional)"
              autoCapitalize="none"
              accessibilityLabel="Data de vencimento"
            />
          )}
        />

        <Text style={styles.sectionLabel}>Parcelamento</Text>
        <View style={styles.stepperRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Diminuir número de parcelas"
            disabled={installmentCount <= 1}
            onPress={() => setInstallmentCount((c) => Math.max(1, c - 1))}
            style={[
              styles.stepperButton,
              installmentCount <= 1 && styles.stepperButtonDisabled,
            ]}
          >
            <Ionicons
              name="remove"
              size={sizes.icon.md}
              color={
                installmentCount <= 1 ? colors.disabledText : colors.primary
              }
              accessibilityElementsHidden
            />
          </Pressable>
          <View style={styles.stepperValueWrap}>
            <Text style={styles.stepperValue}>{installmentCount}</Text>
            <Text style={styles.stepperUnit}>
              {installmentCount === 1 ? 'parcela' : 'parcelas'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aumentar número de parcelas"
            disabled={installmentCount >= MAX_INSTALLMENTS}
            onPress={() =>
              setInstallmentCount((c) => Math.min(MAX_INSTALLMENTS, c + 1))
            }
            style={[
              styles.stepperButton,
              installmentCount >= MAX_INSTALLMENTS &&
                styles.stepperButtonDisabled,
            ]}
          >
            <Ionicons
              name="add"
              size={sizes.icon.md}
              color={
                installmentCount >= MAX_INSTALLMENTS
                  ? colors.disabledText
                  : colors.primary
              }
              accessibilityElementsHidden
            />
          </Pressable>
        </View>

        {installmentCount > 1 ? (
          installmentsPreview.length > 0 ? (
            <View style={styles.installmentsCard}>
              {installmentsPreview.map((item) => (
                <View key={item.number} style={styles.installmentRow}>
                  <Text style={styles.installmentNumber}>
                    Parcela {item.number}/{installmentsPreview.length}
                  </Text>
                  <Text style={styles.installmentAmount}>
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text style={styles.installmentDue}>
                    venc. {formatDayMonth(item.dueDate)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.installmentHint}>
              Informe o valor total acima para visualizar a divisão das
              parcelas.
            </Text>
          )
        ) : (
          <Text style={styles.installmentHint}>
            Pagamento à vista. Aumente o número de parcelas para dividir o
            valor.
          </Text>
        )}

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
              accessibilityLabel="Observações"
            />
          )}
        />

        <AppButton
          title="Salvar"
          size="lg"
          accessibilityLabel="Salvar pagamento"
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
  headerText: {
    flex: 1,
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
  selectorFieldError: {
    borderColor: colors.error,
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
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  methodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  methodChipTextSelected: {
    color: colors.textOnPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  stepperButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.disabledBackground,
  },
  stepperValueWrap: {
    minWidth: 72,
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  stepperUnit: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  installmentsCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  installmentNumber: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  installmentAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  installmentDue: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  installmentHint: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.card,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  optionMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
