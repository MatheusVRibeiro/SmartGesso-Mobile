import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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
import { compositionsService } from '@/src/services/api/compositions';
import { quotesService } from '@/src/services/api/quotes';
import { quoteEnvironmentsService } from '@/src/services/api/quoteEnvironments';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { PermissionGate } from '@/src/components/domain/PermissionGate';
import { COST_VIEW_ROLES } from '@/src/types/permissions';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import { formatCurrency, formatNumber } from '@/src/utils/format';
import { parseCurrencyInput } from '@/src/utils/masks';
import { createQuoteSchema } from '@/src/validation/schemas';
import { ClienteStep } from '@/src/components/domain/quotes/steps/ClienteStep';
import { LocalStep } from '@/src/components/domain/quotes/steps/LocalStep';
import { AmbientesStep } from '@/src/components/domain/quotes/steps/AmbientesStep';
import { ItensStep } from '@/src/components/domain/quotes/steps/ItensStep';
import { ValoresStep } from '@/src/components/domain/quotes/steps/ValoresStep';
import {
  PrazoPagamentoStep,
  type PrazoPagamentoSubStep,
} from '@/src/components/domain/quotes/steps/PrazoPagamentoStep';
import {
  type QuoteDraft,
  type QuoteEnvironmentDraft,
  type QuoteEnvironmentMeasurementDraft,
  type QuoteLocalDraft,
  type ServiceDraft,
  type ServiceErrors,
  type MaterialsCalcState,
  type Client,
  type CreateClientInput,
  type CreateQuoteInput,
  type MeasurementApplicationType,
  toArray,
  parseNumber,
  parseMeasurementValue,
  environmentHasMeasurements,
  isValidIsoDate,
  formatIsoDate,
  buildLocalSummary,
  computeEndDate,
  buildCalculateInput,
  nextServiceId,
  nextEnvironmentId,
  PAYMENT_METHOD_OPTIONS,
  STEP_META,
  stepClienteSchema,
  serviceRowSchema,
  stepValoresSchema,
} from '@/src/components/domain/quotes/wizard/types';
import { styles as staticStyles, createWizardStyles } from './styles';

// ─── Modal de seleção de cliente ────────────────────────────────────────────

interface ClientPickerModalProps {
  visible: boolean;
  clients: Client[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onSelect: (clientId: string) => void;
  onQuickCreate: () => void;
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
  onQuickCreate,
  onClose,
}: ClientPickerModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
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

        <View style={styles.modalBody}>
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
                  : 'Cadastre um cliente rapidamente para continuar'
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
        </View>

        <View style={styles.modalFooter}>
          <AppButton
            title="+ Novo cliente"
            variant="outline"
            size="md"
            accessibilityLabel="Cadastrar novo cliente"
            onPress={onQuickCreate}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Modal de cadastro rápido de cliente (V3 §12) ──────────────────────────

interface QuickClientModalProps {
  visible: boolean;
  loading: boolean;
  onSave: (data: CreateClientInput) => void;
  onClose: () => void;
}

interface QuickClientErrors {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

/**
 * Cadastro mínimo (nome/telefone/WhatsApp obrigatórios) sem abandonar o
 * wizard — CPF/CNPJ, e-mail e endereço ficam opcionais (V3 §12).
 */
function QuickClientModal({ visible, loading, onSave, onClose }: QuickClientModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<QuickClientErrors>({});

  // Reinicia o formulário sempre que o modal abre.
  useEffect(() => {
    if (!visible) return;
    setName('');
    setPhone('');
    setWhatsapp('');
    setDocument('');
    setEmail('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setZipCode('');
    setErrors({});
  }, [visible]);

  function handleSave() {
    const nextErrors: QuickClientErrors = {};
    if (!name.trim()) nextErrors.name = 'Nome é obrigatório';
    if (!phone.trim()) nextErrors.phone = 'Telefone é obrigatório';
    if (!whatsapp.trim()) nextErrors.whatsapp = 'WhatsApp é obrigatório';
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'E-mail inválido';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const address = { zipCode, street, number, neighborhood, city, state };
    const hasAddress = Object.values(address).some((v) => v.trim() !== '');
    onSave({
      type: 'FISICA',
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      document: document.trim() || undefined,
      email: email.trim() || undefined,
      ...(hasAddress
        ? {
            address: {
              zipCode: zipCode.trim() || undefined,
              street: street.trim() || undefined,
              number: number.trim() || undefined,
              neighborhood: neighborhood.trim() || undefined,
              city: city.trim() || undefined,
              state: state.trim() || undefined,
            },
          }
        : {}),
    });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Novo cliente</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar cadastro rápido de cliente"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.quickForm}
        >
          <Text style={styles.quickFormHint}>
            Cadastro mínimo para continuar — os demais campos podem ser
            preenchidos depois.
          </Text>

          <AppInput
            label="Nome"
            required
            value={name}
            onChangeText={setName}
            placeholder="Ex.: João da Silva"
            error={errors.name}
            accessibilityLabel="Nome do cliente"
          />
          <AppInput
            label="Telefone"
            required
            value={phone}
            onChangeText={setPhone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            error={errors.phone}
            accessibilityLabel="Telefone do cliente"
          />
          <AppInput
            label="WhatsApp"
            required
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            error={errors.whatsapp}
            accessibilityLabel="WhatsApp do cliente"
          />
          <AppInput
            label="CPF/CNPJ"
            value={document}
            onChangeText={setDocument}
            placeholder="Opcional"
            accessibilityLabel="CPF ou CNPJ do cliente"
          />
          <AppInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Opcional"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            accessibilityLabel="E-mail do cliente"
          />

          <Text style={styles.quickFormSection}>Endereço (opcional)</Text>
          <View style={styles.quickFormRow}>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Rua"
                value={street}
                onChangeText={setStreet}
                placeholder="Ex.: Rua das Flores"
                accessibilityLabel="Rua do cliente"
              />
            </View>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Número"
                value={number}
                onChangeText={setNumber}
                placeholder="Ex.: 123"
                accessibilityLabel="Número do endereço"
              />
            </View>
          </View>
          <View style={styles.quickFormRow}>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Bairro"
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Opcional"
                accessibilityLabel="Bairro do cliente"
              />
            </View>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Cidade"
                value={city}
                onChangeText={setCity}
                placeholder="Opcional"
                accessibilityLabel="Cidade do cliente"
              />
            </View>
          </View>
          <View style={styles.quickFormRow}>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="UF"
                value={state}
                onChangeText={setState}
                placeholder="SP"
                maxLength={2}
                autoCapitalize="characters"
                accessibilityLabel="UF do cliente"
              />
            </View>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="CEP"
                value={zipCode}
                onChangeText={setZipCode}
                mask="cep"
                placeholder="00000-000"
                accessibilityLabel="CEP do cliente"
              />
            </View>
          </View>

          <AppButton
            title="Salvar cliente"
            size="lg"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            accessibilityLabel="Salvar novo cliente"
            style={styles.quickFormSubmit}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Indicador de progresso das etapas ──────────────────────────────────────

function StepProgress({ current }: { current: number }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressRow}>
        {STEP_META.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          return (
            <React.Fragment key={step.key}>
              {index > 0 ? (
                <View
                  style={[
                    styles.progressLine,
                    (isDone || isCurrent) && styles.progressLineActive,
                  ]}
                />
              ) : null}
              <View
                accessibilityRole="text"
                accessibilityLabel={`Etapa ${index + 1}: ${step.title}${
                  isDone ? ', concluída' : isCurrent ? ', atual' : ''
                }`}
                style={[
                  styles.progressDot,
                  isCurrent && styles.progressDotCurrent,
                  isDone && styles.progressDotDone,
                ]}
              >
                {isDone ? (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={colors.textOnPrimary}
                    accessibilityElementsHidden
                  />
                ) : (
                  <Text
                    style={[
                      styles.progressNumber,
                      isCurrent && styles.progressNumberCurrent,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.progressCaptionRow}>
        <Ionicons
          name={STEP_META[current].icon as ComponentProps<typeof Ionicons>['name']}
          size={sizes.icon.sm}
          color={colors.primary}
          accessibilityElementsHidden
        />
        <Text style={styles.progressCaption}>
          Etapa {current + 1} de {STEP_META.length} · {STEP_META[current].title}
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function NovoOrcamentoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [serviceErrors, setServiceErrors] = useState<ServiceErrors>({});
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [quickClientVisible, setQuickClientVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const [draft, setDraft] = useState<QuoteDraft>({
    clientId: '',
    local: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      reference: '',
    },
    environments: [],
    materials: [],
    services: [],
    discount: '',
    marginPct: '',
    prazoMode: 'A',
    prazoCalendar: 'UTEIS',
    startDate: '',
    durationDays: '',
    endDate: '',
    deadlineDate: '',
    deadlineObservation: '',
    paymentMethod: 'AVISTA',
    observations: '',
  });

  const [materialsCalc, setMaterialsCalc] = useState<MaterialsCalcState | null>(
    null,
  );
  const [materialsCalcPending, setMaterialsCalcPending] = useState(false);
  const [materialsCalcError, setMaterialsCalcError] = useState<string | null>(
    null,
  );

  // ── Queries ────────────────────────────────────────────────────────────────

  const clientsQuery = useQuery({
    queryKey: ['company', companyId, 'clients'],
    queryFn: () => clientsService.list(),
    select: (result) => toArray<Client>(result),
    enabled: Boolean(companyId),
  });

  // ── Derivados ──────────────────────────────────────────────────────────────

  const selectedClient = useMemo(
    () => clientsQuery.data?.find((client) => client.id === draft.clientId),
    [clientsQuery.data, draft.clientId],
  );

  const calcKey = useMemo(
    () =>
      draft.environments
        .map(
          (env) =>
            `${env.id}:${env.measurement.length}:${env.measurement.width}:${env.measurement.height}:${env.measurement.area}:${env.measurement.perimeter}`,
        )
        .sort()
        .join('|'),
    [draft.environments],
  );

  const materialsTotal = useMemo(
    () =>
      draft.materials.reduce((sum, m) => {
        const qty = parseNumber(m.quantity);
        const price = m.unitPrice ?? 0;
        return sum + qty * price;
      }, 0),
    [draft.materials],
  );

  const servicesTotal = useMemo(
    () => draft.services.reduce((sum, s) => sum + parseNumber(s.unitPrice), 0),
    [draft.services],
  );

  const itemsTotal = materialsTotal + servicesTotal;

  const quoteTotal = useMemo(() => {
    const discount = parseNumber(draft.discount);
    const marginPct = parseNumber(draft.marginPct);
    return itemsTotal - discount + (itemsTotal * marginPct) / 100;
  }, [itemsTotal, draft.discount, draft.marginPct]);

  /** Conclusão calculada no Modo A (início + prazo em dias). */
  const computedEndDate = useMemo(() => computeEndDate(draft), [draft]);

  // ── Cálculo de materiais (Etapa 4) ─────────────────────────────────────────

  const runMaterialsCalculation = useCallback(
    (environments: QuoteEnvironmentDraft[], key: string) => {
      const environmentsWithMeasurements = environments.filter(
        environmentHasMeasurements,
      );
      if (environmentsWithMeasurements.length === 0) return;
      setMaterialsCalcPending(true);
      setMaterialsCalcError(null);
      compositionsService
        .calculate(buildCalculateInput(environments))
        .then((result) => {
          setMaterialsCalc({ key, result });
          setDraft((d) => ({
            ...d,
            materials: result.items.map((item, index) => ({
              key: `${item.materialType}-${item.name}-${index}`,
              materialType: item.materialType,
              name: item.name,
              unit: item.unit,
              quantity: String(item.quantity),
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          }));
        })
        .catch((error: unknown) => {
          setMaterialsCalcError(toApiError(error).message);
        })
        .finally(() => setMaterialsCalcPending(false));
    },
    [],
  );

  useEffect(() => {
    if (currentStep !== 3) return;
    const key = calcKey;
    if (key === '') {
      setMaterialsCalc(null);
      setDraft((d) => (d.materials.length > 0 ? { ...d, materials: [] } : d));
      return;
    }
    if (materialsCalc?.key === key) return;
    if (draft.environments.length === 0) return;
    runMaterialsCalculation(draft.environments, key);
  }, [currentStep, calcKey, draft.environments, materialsCalc, runMaterialsCalculation]);

  // ── Mutation ───────────────────────────────────────────────────────────────

  /** Persiste ambientes e medições do draft após o orçamento ser criado. */
  async function persistEnvironments(quoteId: string) {
    if (draft.environments.length === 0) return;
    for (const env of draft.environments) {
      const createdEnv = await quoteEnvironmentsService.createEnvironment(
        quoteId,
        {
          name: env.name.trim() || `Ambiente ${env.order + 1}`,
          description: env.description.trim() || undefined,
          order: env.order,
        },
      );
      const m = env.measurement;
      const hasMeasurements =
        m.length.trim() ||
        m.width.trim() ||
        m.height.trim() ||
        m.area.trim() ||
        m.perimeter.trim();
      if (hasMeasurements) {
        await quoteEnvironmentsService.addMeasurement(quoteId, createdEnv.id, {
          length: parseMeasurementValue(m.length),
          width: parseMeasurementValue(m.width),
          height: parseMeasurementValue(m.height),
          area: parseMeasurementValue(m.area),
          perimeter: parseMeasurementValue(m.perimeter),
          observations: m.observations.trim() || undefined,
        });
      }
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateQuoteInput) => quotesService.create(data),
    onSuccess: async (quote) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      try {
        await persistEnvironments(quote.id);
      } catch (error) {
        setSnackbar({
          type: 'error',
          message: `Orçamento criado, mas falha ao salvar ambientes: ${toApiError(error).message}`,
        });
        return;
      }
      setSnackbar({ type: 'success', message: 'Orçamento criado com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  // Cadastro rápido de cliente (V3 §12) — cria e já seleciona no wizard.
  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.create(data),
    onSuccess: (client) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'clients'],
      });
      handleSelectClient(client.id);
      setQuickClientVisible(false);
      setSnackbar({ type: 'success', message: 'Cliente cadastrado com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  // ── Handlers do wizard ─────────────────────────────────────────────────────

  function goNext() {
    setStepError(null);
    const stepKey = STEP_META[currentStep].key;

    if (stepKey === 'cliente') {
      const parsed = stepClienteSchema.safeParse({ clientId: draft.clientId });
      if (!parsed.success) {
        setStepError(parsed.error.issues[0]?.message ?? 'Verifique os dados');
        return;
      }
    }

    if (stepKey === 'local') {
      const setLocal = (field: keyof QuoteLocalDraft, value: string) =>
        setDraft((d) => ({ ...d, local: { ...d.local, [field]: value } }));
      const handleBulkLocal = (fields: Partial<QuoteLocalDraft>) =>
        setDraft((d) => ({ ...d, local: { ...d.local, ...fields } }));

      return (
        <LocalStep
          local={draft.local}
          onChangeField={setLocal}
          onBulkChange={handleBulkLocal}
        />
      );
    }

    if (stepKey === 'ambientes') {
      const invalid = draft.environments.some((env) => !env.name.trim());
      if (invalid) {
        setStepError('Informe o nome de todos os ambientes');
        return;
      }
    }

    if (stepKey === 'itens') {
      const invalid = draft.materials.filter((m) => {
        const qty = parseNumber(m.quantity);
        return Number.isNaN(qty) || qty <= 0;
      });
      if (invalid.length > 0) {
        setStepError(
          `Quantidade inválida em ${invalid.length} ${
            invalid.length === 1 ? 'material' : 'materiais'
          }`,
        );
        return;
      }

      const errors: ServiceErrors = {};
      let hasError = false;
      for (const service of draft.services) {
        const parsed = serviceRowSchema.safeParse(service);
        if (!parsed.success) {
          hasError = true;
          const row: { name?: string; unitPrice?: string } = {};
          for (const issue of parsed.error.issues) {
            const field = issue.path[0] as 'name' | 'unitPrice';
            row[field] = issue.message;
          }
          errors[service.id] = row;
        }
      }
      setServiceErrors(errors);
      if (hasError) return;
      if (draft.services.length === 0 && draft.materials.length === 0) {
        setStepError('Adicione ao menos um material ou um serviço');
        return;
      }
    }

    if (stepKey === 'valores') {
      const parsed = stepValoresSchema.safeParse({
        discount: draft.discount,
        marginPct: draft.marginPct,
      });
      if (!parsed.success) {
        setStepError(parsed.error.issues[0]?.message ?? 'Verifique os valores');
        return;
      }
    }

    if (stepKey === 'prazo') {
      if (draft.prazoMode === 'A') {
        if (!isValidIsoDate(draft.startDate.trim())) {
          setStepError('Informe a previsão de início (AAAA-MM-DD)');
          return;
        }
        const days = parseNumber(draft.durationDays);
        if (!Number.isInteger(days) || days <= 0) {
          setStepError('Informe o prazo estimado em dias (inteiro maior que 0)');
          return;
        }
      }
      if (draft.prazoMode === 'B') {
        if (!isValidIsoDate(draft.startDate.trim())) {
          setStepError('Informe a previsão de início (AAAA-MM-DD)');
          return;
        }
        if (!isValidIsoDate(draft.endDate.trim())) {
          setStepError('Informe a previsão de conclusão (AAAA-MM-DD)');
          return;
        }
        if (draft.endDate.trim() < draft.startDate.trim()) {
          setStepError('A conclusão não pode ser anterior ao início');
          return;
        }
      }
      if (draft.prazoMode === 'C') {
        if (!isValidIsoDate(draft.deadlineDate.trim())) {
          setStepError('Informe a data limite de entrega (AAAA-MM-DD)');
          return;
        }
      }
    }

    setCurrentStep((s) => Math.min(s + 1, STEP_META.length - 1));
  }

  function goBack() {
    setStepError(null);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleSelectClient(clientId: string) {
    setDraft((d) => ({
      ...d,
      clientId,
      environments: [],
    }));
    setMaterialsCalc(null);
    setClientModalVisible(false);
  }

  // ── Handlers de ambientes ───────────────────────────────────────────────────

  function addEnvironment() {
    const nextNum = draft.environments.length + 1;
    const newEnv: QuoteEnvironmentDraft = {
      id: nextEnvironmentId(),
      name: `Ambiente ${nextNum}`,
      description: '',
      order: draft.environments.length,
      applicationType: 'DRYWALL',
      measurement: {
        length: '',
        width: '',
        height: '',
        area: '',
        perimeter: '',
        observations: '',
      },
    };
    setDraft((d) => ({
      ...d,
      environments: [...d.environments, newEnv],
    }));
  }

  function updateEnvironment(
    id: string,
    field: keyof QuoteEnvironmentDraft,
    value: string | MeasurementApplicationType,
  ) {
    setDraft((d) => ({
      ...d,
      environments: d.environments.map((env) =>
        env.id === id ? { ...env, [field]: value } : env,
      ),
    }));
  }

  function removeEnvironment(id: string) {
    setDraft((d) => ({
      ...d,
      environments: d.environments
        .filter((env) => env.id !== id)
        .map((env, index) => ({ ...env, order: index })),
    }));
  }

  function updateMeasurement(
    envId: string,
    field: keyof QuoteEnvironmentMeasurementDraft,
    value: string,
  ) {
    setDraft((d) => ({
      ...d,
      environments: d.environments.map((env) => {
        if (env.id !== envId) return env;
        const updatedMeasurement = { ...env.measurement, [field]: value };
        // Auto-calculate area when length or width changes
        if (field === 'length' || field === 'width') {
          const length = parseNumber(updatedMeasurement.length);
          const width = parseNumber(updatedMeasurement.width);
          if (
            !Number.isNaN(length) &&
            !Number.isNaN(width) &&
            length > 0 &&
            width > 0
          ) {
            updatedMeasurement.area = String(length * width);
          }
        }
        return { ...env, measurement: updatedMeasurement };
      }),
    }));
  }

  function updateMaterialQuantity(key: string, quantity: string) {
    setDraft((d) => ({
      ...d,
      materials: d.materials.map((m) =>
        m.key === key ? { ...m, quantity } : m,
      ),
    }));
  }

  function handleRecalculate() {
    if (draft.environments.length === 0 || calcKey === '') return;
    runMaterialsCalculation(draft.environments, calcKey);
  }

  function addService() {
    setDraft((d) => ({
      ...d,
      services: [...d.services, { id: nextServiceId(), name: '', unitPrice: '' }],
    }));
  }

  function updateService(id: string, field: 'name' | 'unitPrice', value: string) {
    setDraft((d) => ({
      ...d,
      services: d.services.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
    setServiceErrors((prev) => {
      const row = prev[id];
      if (!row) return prev;
      const next = { ...row, [field]: undefined };
      if (next.name == null && next.unitPrice == null) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  }

  function removeService(id: string) {
    setDraft((d) => ({
      ...d,
      services: d.services.filter((s) => s.id !== id),
    }));
    setServiceErrors((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  // ── Submit (Etapa 8) ───────────────────────────────────────────────────────

  /** Monta o DTO final — mesmo formato do formulário anterior (não quebra a API). */
  function buildPayload(): CreateQuoteInput {
    const items: CreateQuoteInput['items'] = [
      ...draft.materials.map((m) => ({
        itemType: 'MATERIAL' as const,
        name: m.name.trim(),
        quantity: parseNumber(m.quantity),
        unit: m.unit.trim() || 'un',
        unitPrice: m.unitPrice ?? 0,
      })),
      ...draft.services.map((s) => ({
        itemType: 'SERVICO' as const,
        name: s.name.trim(),
        quantity: 1,
        unit: 'un',
        unitPrice: parseCurrencyInput(s.unitPrice),
      })),
    ];

    const local = draft.local;
    const hasLocal = Object.values(local).some((value) => value.trim() !== '');
    const startDate = draft.startDate.trim();
    const durationDays = parseNumber(draft.durationDays);
    const computedEnd = computeEndDate(draft);
    const observations =
      [draft.observations?.trim(), draft.deadlineObservation?.trim()]
        .filter(Boolean)
        .join('\n') || undefined;

    return {
      clientId: draft.clientId,
      localAddress: hasLocal
        ? {
            cep: local.zipCode.trim() || undefined,
            rua: local.street.trim() || undefined,
            numero: local.number.trim() || undefined,
            complemento: local.complement.trim() || undefined,
            bairro: local.neighborhood.trim() || undefined,
            cidade: local.city.trim() || undefined,
            estado: local.state.trim() || undefined,
            referencia: local.reference.trim() || undefined,
          }
        : undefined,
      startDate:
        draft.prazoMode === 'A' || draft.prazoMode === 'B'
          ? startDate || undefined
          : undefined,
      durationDays:
        draft.prazoMode === 'A' &&
        Number.isInteger(durationDays) &&
        durationDays > 0
          ? durationDays
          : undefined,
      endDate:
        draft.prazoMode === 'A'
          ? computedEnd ?? undefined
          : draft.prazoMode === 'B'
            ? draft.endDate.trim() || undefined
            : undefined,
      deadlineDate:
        draft.prazoMode === 'C'
          ? draft.deadlineDate.trim() || undefined
          : undefined,
      discount: parseNumber(draft.discount),
      marginPct: parseNumber(draft.marginPct),
      paymentMethod: draft.paymentMethod,
      observations,
      items,
    };
  }

  function handleSubmit() {
    const payload = buildPayload();
    const parsed = createQuoteSchema.safeParse(payload);
    if (!parsed.success) {
      setSnackbar({
        type: 'error',
        message: parsed.error.issues[0]?.message ?? 'Verifique os dados do orçamento',
      });
      return;
    }
    createMutation.mutate(payload);
  }

  // ── Renderização das etapas ────────────────────────────────────────────────

  function renderStepContent() {
    const stepKey = STEP_META[currentStep].key;

    if (stepKey === 'cliente') {
      return (
        <ClienteStep
          clientId={draft.clientId}
          selectedClient={selectedClient}
          onOpenClientModal={() => setClientModalVisible(true)}
        />
      );
    }

    if (stepKey === 'local') {
      const local = draft.local;
      const setLocal = (field: keyof QuoteLocalDraft, value: string) =>
        setDraft((d) => ({ ...d, local: { ...d.local, [field]: value } }));
      return (
        <View>
          <Text style={styles.sectionLabel}>
            Onde o serviço será realizado?
          </Text>
          <View style={styles.localRow}>
            <View style={styles.localFieldHalf}>
              <AppInput
                label="CEP"
                value={local.zipCode}
                onChangeText={(text) => setLocal('zipCode', text)}
                mask="cep"
                placeholder="00000-000"
                accessibilityLabel="CEP"
              />
            </View>
            <View style={styles.localFieldHalf}>
              <AppInput
                label="Número"
                value={local.number}
                onChangeText={(text) => setLocal('number', text)}
                placeholder="Ex.: 123"
                accessibilityLabel="Número"
              />
            </View>
          </View>
          <AppInput
            label="Rua"
            value={local.street}
            onChangeText={(text) => setLocal('street', text)}
            placeholder="Ex.: Rua das Flores"
            accessibilityLabel="Rua"
          />
          <AppInput
            label="Complemento"
            value={local.complement}
            onChangeText={(text) => setLocal('complement', text)}
            placeholder="Ex.: Apto 42, bloco B (opcional)"
            accessibilityLabel="Complemento"
          />
          <AppInput
            label="Bairro"
            value={local.neighborhood}
            onChangeText={(text) => setLocal('neighborhood', text)}
            placeholder="Ex.: Centro"
            accessibilityLabel="Bairro"
          />
          <View style={styles.localRow}>
            <View style={styles.localFieldHalf}>
              <AppInput
                label="Cidade"
                value={local.city}
                onChangeText={(text) => setLocal('city', text)}
                placeholder="Ex.: São Paulo"
                accessibilityLabel="Cidade"
              />
            </View>
            <View style={styles.localFieldHalf}>
              <AppInput
                label="Estado"
                value={local.state}
                onChangeText={(text) => setLocal('state', text)}
                placeholder="UF"
                maxLength={2}
                autoCapitalize="characters"
                accessibilityLabel="Estado"
              />
            </View>
          </View>
          <AppInput
            label="Referência"
            value={local.reference}
            onChangeText={(text) => setLocal('reference', text)}
            placeholder="Ex.: Próximo ao mercado central (opcional)"
            accessibilityLabel="Referência"
          />
        </View>
      );
    }

    if (stepKey === 'ambientes') {
      return (
        <AmbientesStep
          environments={draft.environments}
          addEnvironment={addEnvironment}
          updateEnvironment={updateEnvironment}
          removeEnvironment={removeEnvironment}
          updateMeasurement={updateMeasurement}
        />
      );
    }

    if (stepKey === 'itens') {
      return (
        <ItensStep
          environments={draft.environments}
          materials={draft.materials}
          materialsCalc={materialsCalc}
          materialsCalcPending={materialsCalcPending}
          materialsCalcError={materialsCalcError}
          serviceErrors={serviceErrors}
          services={draft.services}
          updateMaterialQuantity={updateMaterialQuantity}
          handleRecalculate={handleRecalculate}
          addService={addService}
          updateService={updateService}
          removeService={removeService}
        />
      );
    }

    if (stepKey === 'valores') {
      return (
        <ValoresStep
          materialsTotal={materialsTotal}
          servicesTotal={servicesTotal}
          itemsTotal={itemsTotal}
          quoteTotal={quoteTotal}
          discount={draft.discount}
          marginPct={draft.marginPct}
          onDiscountChange={(text) =>
            setDraft((d) => ({ ...d, discount: text }))
          }
          onMarginPctChange={(text) =>
            setDraft((d) => ({ ...d, marginPct: text }))
          }
        />
      );
    }

    if (stepKey === 'prazo') {
      return (
        <PrazoPagamentoStep
          subStep="prazo"
          prazoMode={draft.prazoMode}
          prazoCalendar={draft.prazoCalendar}
          startDate={draft.startDate}
          durationDays={draft.durationDays}
          endDate={draft.endDate}
          deadlineDate={draft.deadlineDate}
          deadlineObservation={draft.deadlineObservation}
          paymentMethod={draft.paymentMethod}
          computedEndDate={computedEndDate}
          onPrazoModeChange={(value) =>
            setDraft((d) => ({ ...d, prazoMode: value }))
          }
          onPrazoCalendarChange={(value) =>
            setDraft((d) => ({ ...d, prazoCalendar: value }))
          }
          onStartDateChange={(value) =>
            setDraft((d) => ({ ...d, startDate: value }))
          }
          onDurationDaysChange={(value) =>
            setDraft((d) => ({ ...d, durationDays: value }))
          }
          onEndDateChange={(value) =>
            setDraft((d) => ({ ...d, endDate: value }))
          }
          onDeadlineDateChange={(value) =>
            setDraft((d) => ({ ...d, deadlineDate: value }))
          }
          onDeadlineObservationChange={(value) =>
            setDraft((d) => ({ ...d, deadlineObservation: value }))
          }
          onPaymentMethodChange={(value) =>
            setDraft((d) => ({ ...d, paymentMethod: value }))
          }
        />
      );
    }

    if (stepKey === 'pagamento') {
      return (
        <PrazoPagamentoStep
          subStep="pagamento"
          prazoMode={draft.prazoMode}
          prazoCalendar={draft.prazoCalendar}
          startDate={draft.startDate}
          durationDays={draft.durationDays}
          endDate={draft.endDate}
          deadlineDate={draft.deadlineDate}
          deadlineObservation={draft.deadlineObservation}
          paymentMethod={draft.paymentMethod}
          computedEndDate={computedEndDate}
          onPrazoModeChange={(value) =>
            setDraft((d) => ({ ...d, prazoMode: value }))
          }
          onPrazoCalendarChange={(value) =>
            setDraft((d) => ({ ...d, prazoCalendar: value }))
          }
          onStartDateChange={(value) =>
            setDraft((d) => ({ ...d, startDate: value }))
          }
          onDurationDaysChange={(value) =>
            setDraft((d) => ({ ...d, durationDays: value }))
          }
          onEndDateChange={(value) =>
            setDraft((d) => ({ ...d, endDate: value }))
          }
          onDeadlineDateChange={(value) =>
            setDraft((d) => ({ ...d, deadlineDate: value }))
          }
          onDeadlineObservationChange={(value) =>
            setDraft((d) => ({ ...d, deadlineObservation: value }))
          }
          onPaymentMethodChange={(value) =>
            setDraft((d) => ({ ...d, paymentMethod: value }))
          }
        />
      );
    }

    // Etapa 8 — Revisão
    const paymentLabel =
      PAYMENT_METHOD_OPTIONS.find((o) => o.value === draft.paymentMethod)?.label ??
      draft.paymentMethod;

    return (
      <View>
        <AppCard shadow="light" style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Cliente</Text>
          <Text style={styles.reviewValue}>
            {selectedClient?.name ?? '—'}
          </Text>
          {selectedClient?.document ? (
            <Text style={styles.reviewMeta}>{selectedClient.document}</Text>
          ) : null}

          <View style={styles.reviewDivider} />
          <Text style={styles.reviewSectionTitle}>
            Ambientes ({draft.environments.length})
          </Text>
          {draft.environments.length === 0 ? (
            <Text style={styles.reviewValue}>Nenhum ambiente adicionado</Text>
          ) : (
            draft.environments.map((env) => {
              const m = env.measurement;
              const dims = [
                m.length ? `${formatNumber(parseNumber(m.length))} m` : null,
                m.width ? `${formatNumber(parseNumber(m.width))} m` : null,
                m.height
                  ? `${formatNumber(parseNumber(m.height))} m`
                  : null,
              ]
                .filter(Boolean)
                .join(' × ');
              const area = m.area
                ? `${formatNumber(parseNumber(m.area))} m²`
                : null;
              return (
                <View key={env.id} style={styles.reviewItemRow}>
                  <View>
                    <Text style={styles.reviewItemName} numberOfLines={1}>
                      {env.name || 'Ambiente sem nome'}
                    </Text>
                    {dims || area ? (
                      <Text style={styles.reviewMeta} numberOfLines={1}>
                        {[dims, area].filter(Boolean).join(' · ')}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </AppCard>

        <AppCard shadow="light" style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Local</Text>
          <Text style={styles.reviewValue}>
            {buildLocalSummary(draft.local) || 'Não informado'}
          </Text>
          {draft.local.reference.trim() ? (
            <Text style={styles.reviewMeta}>
              Ref.: {draft.local.reference.trim()}
            </Text>
          ) : null}
        </AppCard>

        <AppCard shadow="light" style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>
            Materiais ({draft.materials.length})
          </Text>
          {draft.materials.length === 0 ? (
            <Text style={styles.reviewValue}>Nenhum material</Text>
          ) : (
            draft.materials.map((material) => (
              <View key={material.key} style={styles.reviewItemRow}>
                <Text style={styles.reviewItemName} numberOfLines={1}>
                  {material.name}
                </Text>
                <Text style={styles.reviewItemQty}>
                  {formatNumber(parseNumber(material.quantity))} {material.unit}
                </Text>
              </View>
            ))
          )}
        </AppCard>

        <AppCard shadow="light" style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>
            Serviços ({draft.services.length})
          </Text>
          {draft.services.length === 0 ? (
            <Text style={styles.reviewValue}>Nenhum serviço</Text>
          ) : (
            draft.services.map((service) => (
              <View key={service.id} style={styles.reviewItemRow}>
                <Text style={styles.reviewItemName} numberOfLines={1}>
                  {service.name}
                </Text>
                <Text style={styles.reviewItemQty}>
                  {formatCurrency(parseNumber(service.unitPrice))}
                </Text>
              </View>
            ))
          )}
        </AppCard>

        <AppCard shadow="light" style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Valores</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(itemsTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(parseNumber(draft.discount))}
            </Text>
          </View>
          <PermissionGate allow={COST_VIEW_ROLES}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Margem</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(parseNumber(draft.marginPct))}%
              </Text>
            </View>
          </PermissionGate>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(quoteTotal)}</Text>
          </View>

          <View style={styles.reviewDivider} />
          <Text style={styles.reviewSectionTitle}>Pagamento</Text>
          <Text style={styles.reviewValue}>{paymentLabel}</Text>
        </AppCard>

        <AppCard shadow="light" style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Prazo</Text>
          {draft.prazoMode === 'A' ? (
            <>
              <Text style={styles.reviewValue}>
                Início: {formatIsoDate(draft.startDate.trim()) || '—'}
              </Text>
              <Text style={styles.reviewMeta}>
                Prazo: {draft.durationDays.trim() || '—'} dias{' '}
                {draft.prazoCalendar === 'UTEIS' ? 'úteis' : 'corridos'}
              </Text>
              <Text style={styles.reviewValue}>
                Conclusão prevista:{' '}
                {computedEndDate ? formatIsoDate(computedEndDate) : '—'}
              </Text>
            </>
          ) : draft.prazoMode === 'B' ? (
            <>
              <Text style={styles.reviewValue}>
                Início: {formatIsoDate(draft.startDate.trim()) || '—'}
              </Text>
              <Text style={styles.reviewValue}>
                Conclusão: {formatIsoDate(draft.endDate.trim()) || '—'}
              </Text>
            </>
          ) : (
            <Text style={styles.reviewValue}>
              Entregar até: {formatIsoDate(draft.deadlineDate.trim()) || '—'}
            </Text>
          )}
          {draft.deadlineObservation.trim() ? (
            <>
              <View style={styles.reviewDivider} />
              <Text style={styles.reviewMeta}>
                {draft.deadlineObservation.trim()}
              </Text>
            </>
          ) : null}
        </AppCard>

        <AppInput
          label="Observações"
          value={draft.observations}
          onChangeText={(text) =>
            setDraft((d) => ({ ...d, observations: text }))
          }
          placeholder="Observações adicionais (opcional)"
          accessibilityLabel="Observações"
          multiline
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard>
        <Stack.Screen options={{ title: 'Novo orçamento', headerShown: false }} />

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
            <Text style={styles.subtitle}>
              Preencha os dados e avance pelas etapas
            </Text>
          </View>
        </View>

        <StepProgress current={currentStep} />

        {renderStepContent()}

        {stepError ? (
          <View style={styles.stepErrorRow}>
            <Ionicons
              name="alert-circle-outline"
              size={sizes.icon.sm}
              color={colors.error}
              accessibilityElementsHidden
            />
            <Text style={styles.stepErrorText}>{stepError}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          {currentStep > 0 ? (
            <AppButton
              title="Voltar"
              variant="outline"
              size="lg"
              onPress={goBack}
              accessibilityLabel="Voltar para a etapa anterior"
              style={styles.footerButton}
            />
          ) : null}
          {currentStep < STEP_META.length - 1 ? (
            <AppButton
              title="Continuar"
              size="lg"
              onPress={goNext}
              accessibilityLabel="Continuar para a próxima etapa"
              style={styles.footerButton}
            />
          ) : (
            <AppButton
              title="Gerar orçamento"
              size="lg"
              onPress={handleSubmit}
              loading={createMutation.isPending}
              disabled={createMutation.isPending}
              accessibilityLabel="Gerar orçamento"
              style={styles.footerButton}
            />
          )}
        </View>
      </ScreenContainer>

      <ClientPickerModal
        visible={clientModalVisible}
        clients={clientsQuery.data ?? []}
        isLoading={clientsQuery.isLoading}
        isError={clientsQuery.isError}
        errorMessage={clientsQuery.isError ? toApiError(clientsQuery.error).message : ''}
        onRetry={clientsQuery.refetch}
        onSelect={handleSelectClient}
        onQuickCreate={() => setQuickClientVisible(true)}
        onClose={() => setClientModalVisible(false)}
      />

      <QuickClientModal
        visible={quickClientVisible}
        loading={createClientMutation.isPending}
        onSave={(data) => createClientMutation.mutate(data)}
        onClose={() => setQuickClientVisible(false)}
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
