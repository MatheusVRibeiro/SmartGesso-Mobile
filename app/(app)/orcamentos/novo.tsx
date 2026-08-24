import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { clientsService } from '../../../src/services/api/clients';
import { compositionsService } from '../../../src/services/api/compositions';
import { quotesService } from '../../../src/services/api/quotes';
import { quoteEnvironmentsService } from '../../../src/services/api/quoteEnvironments';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { PermissionGate } from '../../../src/components/domain/PermissionGate';
import { COST_VIEW_ROLES } from '../../../src/types/permissions';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency, formatNumber } from '../../../src/utils/format';
import { parseCurrencyInput } from '../../../src/utils/masks';
import type { Client, CreateClientInput } from '../../../src/types/client';
import type { CreateQuoteInput, QuotePaymentMethod } from '../../../src/types/quote';
import type { MeasurementApplicationType } from '../../../src/types/measurement';
import type {
  QuoteEnvironment,
  QuoteEnvironmentMeasurement,
} from '../../../src/types/quoteEnvironment';
import type {
  CalculateMaterialsInput,
  CalculateMaterialsResponse,
} from '../../../src/types/composition';
import { z } from 'zod';
import { createQuoteSchema } from '../../../src/validation/schemas';

// ─── Tipos do wizard ────────────────────────────────────────────────────────

type StepKey =
  | 'cliente'
  | 'local'
  | 'ambientes'
  | 'itens'
  | 'valores'
  | 'prazo'
  | 'pagamento'
  | 'revisao';

interface ServiceDraft {
  id: string;
  name: string;
  unitPrice: string;
}

interface MaterialDraft {
  key: string;
  materialType: string;
  name: string;
  unit: string;
  quantity: string;
  unitPrice?: number | null;
  total?: number | null;
}

/** Endereço livre do local do serviço (Etapa 2 — V3). */
interface QuoteLocalDraft {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
}

/** Modos da etapa Prazo (V3): A = início + duração, B = início + conclusão, C = data-limite. */
type PrazoMode = 'A' | 'B' | 'C';

/** Contagem do prazo no Modo A: dias úteis ou corridos. */
type PrazoCalendar = 'UTEIS' | 'CORRIDOS';

/** Medição local de um ambiente dentro do wizard (campos em texto para edição). */
interface QuoteEnvironmentMeasurementDraft {
  length: string;
  width: string;
  height: string;
  area: string;
  perimeter: string;
  observations: string;
}

/** Ambiente criado localmente no wizard — antes de ser persistido na API. */
interface QuoteEnvironmentDraft {
  id: string;
  name: string;
  description: string;
  order: number;
  applicationType: MeasurementApplicationType;
  measurement: QuoteEnvironmentMeasurementDraft;
}

interface QuoteDraft {
  clientId: string;
  local: QuoteLocalDraft;
  environments: QuoteEnvironmentDraft[];
  materials: MaterialDraft[];
  services: ServiceDraft[];
  discount: string;
  marginPct: string;
  prazoMode: PrazoMode;
  prazoCalendar: PrazoCalendar;
  startDate: string;
  durationDays: string;
  endDate: string;
  deadlineDate: string;
  deadlineObservation: string;
  paymentMethod: QuotePaymentMethod;
  observations: string;
}

type ServiceErrors = Record<string, { name?: string; unitPrice?: string }>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * A API real retorna array puro em GET /clients, /works e
 * /works/:workId/measurements (Prisma findMany), enquanto os tipos
 * declarados são { data, total }. Normaliza ambos os formatos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

/** Converte texto digitado (pt-BR) em número. Aceita vírgula decimal. */
function parseNumber(value: string): number {
  const normalized = String(value).trim().replace(',', '.');
  if (normalized === '') return 0;
  const n = Number(normalized);
  return Number.isNaN(n) ? NaN : n;
}

/** Converte texto em número — retorna undefined quando vazio/NaN. */
function parseMeasurementValue(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = parseNumber(value);
  return Number.isNaN(n) ? undefined : n;
}

/** Verdadeiro se algum campo de medição do ambiente tem valor. */
function environmentHasMeasurements(env: QuoteEnvironmentDraft): boolean {
  const m = env.measurement;
  return Boolean(
    m.length.trim() ||
      m.width.trim() ||
      m.height.trim() ||
      m.area.trim() ||
      m.perimeter.trim(),
  );
}

/** Valida data no formato AAAA-MM-DD (ISO). */
function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Soma dias corridos a uma data ISO (AAAA-MM-DD). */
function addDaysToIsoDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Soma dias úteis (seg–sex) a uma data ISO (AAAA-MM-DD). */
function addBusinessDaysToIsoDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return date.toISOString().slice(0, 10);
}

/** Formata data ISO (AAAA-MM-DD) como DD/MM/AAAA. */
function formatIsoDate(value: string): string {
  if (!isValidIsoDate(value)) return value;
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

/** Monta resumo legível do endereço local (Etapa 2). */
function buildLocalSummary(local: QuoteLocalDraft): string {
  const parts = [
    [local.street.trim(), local.number.trim()].filter(Boolean).join(', '),
    local.complement.trim(),
    local.neighborhood.trim(),
    [local.city.trim(), local.state.trim()].filter(Boolean).join(' - '),
    local.zipCode.trim(),
  ].filter(Boolean);
  return parts.join(' · ');
}

/** Calcula a conclusão prevista (Modo A) a partir de início + prazo em dias. */
function computeEndDate(draft: QuoteDraft): string | null {
  if (draft.prazoMode !== 'A') return null;
  const start = draft.startDate.trim();
  const days = parseNumber(draft.durationDays);
  if (!isValidIsoDate(start) || !Number.isInteger(days) || days <= 0) return null;
  return draft.prazoCalendar === 'UTEIS'
    ? addBusinessDaysToIsoDate(start, days)
    : addDaysToIsoDate(start, days);
}

/** Monta o payload de cálculo de materiais a partir das medições dos ambientes. */
function buildCalculateInput(environments: QuoteEnvironmentDraft[]): CalculateMaterialsInput {
  const measurements = environments
    .filter(environmentHasMeasurements)
    .flatMap((env) => {
      const m = env.measurement;
      return [
        {
          length: parseMeasurementValue(m.length),
          width: parseMeasurementValue(m.width),
          ceilingHeight: parseMeasurementValue(m.height),
          area: parseMeasurementValue(m.area),
          perimeter: parseMeasurementValue(m.perimeter),
        },
      ];
    });

  return {
    applicationType: environments[0]?.applicationType ?? 'DRYWALL',
    measurements,
  };
}

let serviceIdCounter = 0;
function nextServiceId(): string {
  serviceIdCounter += 1;
  return `servico-${serviceIdCounter}`;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const PAYMENT_METHOD_OPTIONS: { value: QuotePaymentMethod; label: string }[] = [
  { value: 'AVISTA', label: 'À vista' },
  { value: 'AVISTA_DESCONTO', label: 'À vista c/ desconto' },
  { value: 'ENTRADA_SALDO', label: 'Entrada + saldo' },
  { value: 'QUINZENAL_2X', label: 'Quinzenal 2x' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'PARCELADO', label: 'Parcelado' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
];

const APPLICATION_TYPE_BADGE: Record<
  MeasurementApplicationType,
  { variant: StatusBadgeVariant; label: string }
> = {
  DRYWALL: { variant: 'active', label: 'Drywall' },
  FORRO: { variant: 'warning', label: 'Forro' },
  PAREDE: { variant: 'active', label: 'Parede' },
  SANCA: { variant: 'expired', label: 'Sanca' },
  REBAIXAMENTO: { variant: 'warning', label: 'Rebaixamento' },
  OUTRO: { variant: 'cancelled', label: 'Outro' },
};

const STEP_META: {
  key: StepKey;
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  { key: 'cliente', title: 'Cliente', icon: 'person-outline' },
  { key: 'local', title: 'Local', icon: 'location-outline' },
  { key: 'ambientes', title: 'Ambientes', icon: 'home-outline' },
  { key: 'itens', title: 'Serviço/Materiais', icon: 'cube-outline' },
  { key: 'valores', title: 'Valores', icon: 'calculator-outline' },
  { key: 'prazo', title: 'Prazo', icon: 'time-outline' },
  { key: 'pagamento', title: 'Pagamento', icon: 'card-outline' },
  { key: 'revisao', title: 'Revisão', icon: 'document-text-outline' },
];

// ─── Validação por etapa (zod) ──────────────────────────────────────────────

const stepClienteSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente para continuar'),
});

const serviceRowSchema = z.object({
  name: z.string().trim().min(1, 'Descrição é obrigatória'),
  unitPrice: z
    .string()
    .trim()
    .min(1, 'Informe o valor do serviço')
    .refine((v) => !Number.isNaN(parseNumber(v)), 'Valor inválido')
    .refine((v) => parseNumber(v) >= 0, 'Valor não pode ser negativo'),
});

const stepValoresSchema = z.object({
  discount: z
    .string()
    .refine((v) => !Number.isNaN(parseNumber(v)), 'Desconto inválido')
    .refine((v) => parseNumber(v) >= 0, 'Desconto não pode ser negativo'),
  marginPct: z
    .string()
    .refine((v) => !Number.isNaN(parseNumber(v)), 'Margem inválida')
    .refine((v) => parseNumber(v) >= 0, 'Margem não pode ser negativa')
    .refine((v) => parseNumber(v) <= 100, 'Margem deve ser no máximo 100%'),
});

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
          name={STEP_META[current].icon}
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

  const [materialsCalc, setMaterialsCalc] = useState<{
    key: string;
    result: CalculateMaterialsResponse;
  } | null>(null);
  const [materialsCalcPending, setMaterialsCalcPending] = useState(false);
  const [materialsCalcError, setMaterialsCalcError] = useState<string | null>(null);

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
          name: env.name.trim(),
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
      const hasLocal = Object.values(draft.local).some(
        (value) => value.trim() !== '',
      );
      if (!hasLocal) {
        setStepError('Informe o local onde o serviço será realizado');
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

  let environmentIdCounter = 0;
  function nextEnvironmentId(): string {
    environmentIdCounter += 1;
    return `env-${environmentIdCounter}`;
  }

  function addEnvironment() {
    const newEnv: QuoteEnvironmentDraft = {
      id: nextEnvironmentId(),
      name: '',
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
        <View>
          <Text style={styles.sectionLabel}>Cliente</Text>
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
                    draft.clientId === '' && styles.selectorPlaceholder,
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
        </View>
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
        <View>
          <Text style={styles.sectionLabel}>Ambientes e medições</Text>

          {draft.environments.length === 0 ? (
            <EmptyState
              title="Nenhum ambiente adicionado"
              description="Adicione ambientes com as medições do local para calcular os materiais da composição."
              icon="home-outline"
            />
          ) : (
            <View>
              {draft.environments.map((env) => (
                <AppCard
                  key={env.id}
                  shadow="light"
                  style={styles.environmentCard}
                >
                  <View style={styles.environmentHeader}>
                    <View style={styles.environmentNameField}>
                      <AppInput
                        label="Nome do ambiente"
                        required
                        value={env.name}
                        onChangeText={(text) =>
                          updateEnvironment(env.id, 'name', text)
                        }
                        placeholder="Ex.: Sala de estar"
                        accessibilityLabel={`Nome do ambiente ${
                          env.order + 1
                        }`}
                      />
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ambiente ${env.name}`}
                      onPress={() => removeEnvironment(env.id)}
                      hitSlop={8}
                      style={styles.removeEnvironmentButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={sizes.icon.sm}
                        color={colors.error}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.environmentSectionLabel}>
                    Tipo de aplicação
                  </Text>
                  <View style={styles.applicationTypeRow}>
                    {(
                      [
                        'DRYWALL',
                        'FORRO',
                        'PAREDE',
                        'SANCA',
                        'REBAIXAMENTO',
                        'OUTRO',
                      ] as const
                    ).map((type) => {
                      const selected = env.applicationType === type;
                      const badge = APPLICATION_TYPE_BADGE[type];
                      return (
                        <Pressable
                          key={type}
                          accessibilityRole="button"
                          accessibilityLabel={`Tipo de aplicação ${badge.label}`}
                          accessibilityState={{ selected }}
                          onPress={() =>
                            updateEnvironment(env.id, 'applicationType', type)
                          }
                          style={[
                            styles.applicationTypeChip,
                            selected && styles.applicationTypeChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.applicationTypeChipText,
                              selected &&
                                styles.applicationTypeChipTextSelected,
                            ]}
                          >
                            {badge.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={styles.environmentSectionLabel}>
                    Medidas (em metros)
                  </Text>
                  <View style={styles.environmentMeasurementRow}>
                    <View style={styles.environmentMeasurementField}>
                      <AppInput
                        label="Comprimento"
                        value={env.measurement.length}
                        onChangeText={(text) =>
                          updateMeasurement(env.id, 'length', text)
                        }
                        placeholder="0"
                        keyboardType="decimal-pad"
                        accessibilityLabel={`Comprimento do ambiente ${env.name}`}
                      />
                    </View>
                    <View style={styles.environmentMeasurementField}>
                      <AppInput
                        label="Largura"
                        value={env.measurement.width}
                        onChangeText={(text) =>
                          updateMeasurement(env.id, 'width', text)
                        }
                        placeholder="0"
                        keyboardType="decimal-pad"
                        accessibilityLabel={`Largura do ambiente ${env.name}`}
                      />
                    </View>
                  </View>
                  <View style={styles.environmentMeasurementRow}>
                    <View style={styles.environmentMeasurementField}>
                      <AppInput
                        label="Altura"
                        value={env.measurement.height}
                        onChangeText={(text) =>
                          updateMeasurement(env.id, 'height', text)
                        }
                        placeholder="0"
                        keyboardType="decimal-pad"
                        accessibilityLabel={`Altura do ambiente ${env.name}`}
                      />
                    </View>
                    <View style={styles.environmentMeasurementField}>
                      <AppInput
                        label="Área (m²)"
                        value={env.measurement.area}
                        onChangeText={(text) =>
                          updateMeasurement(env.id, 'area', text)
                        }
                        placeholder="0"
                        keyboardType="decimal-pad"
                        accessibilityLabel={`Área do ambiente ${env.name}`}
                        helper={
                          env.measurement.length && env.measurement.width
                            ? 'Auto-calculada'
                            : undefined
                        }
                      />
                    </View>
                  </View>
                  <View style={styles.environmentMeasurementRow}>
                    <View style={styles.environmentMeasurementField}>
                      <AppInput
                        label="Perímetro (m)"
                        value={env.measurement.perimeter}
                        onChangeText={(text) =>
                          updateMeasurement(env.id, 'perimeter', text)
                        }
                        placeholder="0"
                        keyboardType="decimal-pad"
                        accessibilityLabel={`Perímetro do ambiente ${env.name}`}
                      />
                    </View>
                    <View style={styles.environmentMeasurementField}>
                      <AppInput
                        label="Observações"
                        value={env.measurement.observations}
                        onChangeText={(text) =>
                          updateMeasurement(env.id, 'observations', text)
                        }
                        placeholder="Opcional"
                        accessibilityLabel={`Observações do ambiente ${env.name}`}
                      />
                    </View>
                  </View>
                </AppCard>
              ))}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar ambiente"
            onPress={addEnvironment}
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
            <Text style={styles.addItemText}>Adicionar ambiente</Text>
          </Pressable>
        </View>
      );
    }

    if (stepKey === 'itens') {
      const result = materialsCalc?.result ?? null;
      return (
        <View>
          <Text style={styles.sectionLabel}>Materiais</Text>
          {draft.environments.filter(environmentHasMeasurements).length === 0 ? (
            <EmptyState
              title="Nenhum ambiente com medições"
              description="Adicione ambientes com medições na Etapa 3 para calcular os materiais da composição."
              icon="cube-outline"
            />
          ) : materialsCalcPending ? (
            <LoadingState text="Calculando materiais..." />
          ) : materialsCalcError ? (
            <ErrorState
              message={materialsCalcError}
              onRetry={handleRecalculate}
            />
          ) : !result ? (
            <LoadingState text="Preparando materiais..." />
          ) : (
            <View>
              <AppCard shadow="light" style={styles.compositionCard}>
                <View style={styles.compositionRow}>
                  <Text style={styles.compositionCode}>
                    {result.composition.code}
                  </Text>
                  <StatusBadge
                    status="active"
                    label={`v${result.composition.version}`}
                    size="sm"
                  />
                </View>
                <Text style={styles.compositionName} numberOfLines={2}>
                  {result.composition.name}
                </Text>
              </AppCard>

              <Text style={styles.sectionLabel}>Materiais calculados</Text>
              {draft.materials.length === 0 ? (
                <EmptyState
                  title="Nenhum material calculado"
                  description="A composição não retornou materiais para os ambientes selecionados."
                  icon="cube-outline"
                />
              ) : (
                draft.materials.map((material) => (
                  <AppCard
                    key={material.key}
                    shadow="light"
                    style={styles.materialCard}
                  >
                    <View style={styles.materialRow}>
                      <View style={styles.materialInfo}>
                        <Text style={styles.materialName} numberOfLines={2}>
                          {material.name}
                        </Text>
                        <Text style={styles.materialMeta} numberOfLines={1}>
                          {material.unitPrice != null
                            ? `${formatCurrency(material.unitPrice)}/${material.unit}`
                            : 'Preço não cadastrado'}
                        </Text>
                      </View>
                      <View style={styles.materialQtyField}>
                        <AppInput
                          label="Qtd"
                          value={material.quantity}
                          onChangeText={(text) =>
                            updateMaterialQuantity(material.key, text)
                          }
                          keyboardType="decimal-pad"
                          placeholder="0"
                          accessibilityLabel={`Quantidade de ${material.name}`}
                          style={styles.materialQtyInput}
                        />
                      </View>
                    </View>
                    <View style={styles.itemSubtotalRow}>
                      <Text style={styles.itemSubtotalLabel}>
                        Total ({material.unit})
                      </Text>
                      <Text style={styles.itemSubtotalValue}>
                        {formatCurrency(
                          parseNumber(material.quantity) *
                            (material.unitPrice ?? 0),
                        )}
                      </Text>
                    </View>
                  </AppCard>
                ))
              )}

              <AppCard shadow="light" style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumo</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Área total</Text>
                  <Text style={styles.summaryValue}>
                    {formatNumber(result.totalArea)} m²
                  </Text>
                </View>
                <PermissionGate allow={COST_VIEW_ROLES}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Custo estimado</Text>
                    <Text style={styles.summaryCost}>
                      {formatCurrency(result.estimatedCost)}
                    </Text>
                  </View>
                </PermissionGate>
              </AppCard>

              <AppButton
                title="Calcular novamente"
                variant="outline"
                size="lg"
                loading={materialsCalcPending}
                onPress={handleRecalculate}
                accessibilityLabel="Calcular novamente"
                style={styles.recalculateButton}
              />
            </View>
          )}

          <Text style={styles.sectionLabel}>Serviços</Text>
          {draft.services.length === 0 ? (
            <EmptyState
              title="Nenhum serviço adicionado"
              description="Adicione os serviços que serão executados (ex.: instalação de forro de drywall)."
              icon="construct-outline"
            />
          ) : (
            draft.services.map((service) => {
              const errors = serviceErrors[service.id] ?? {};
              return (
                <AppCard
                  key={service.id}
                  shadow="light"
                  style={styles.serviceCard}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemLabel}>Serviço</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remover serviço"
                      onPress={() => removeService(service.id)}
                      hitSlop={8}
                      style={styles.removeItemButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={sizes.icon.sm}
                        color={colors.error}
                      />
                    </Pressable>
                  </View>
                  <AppInput
                    label="Descrição"
                    required
                    value={service.name}
                    onChangeText={(text) =>
                      updateService(service.id, 'name', text)
                    }
                    placeholder="Ex.: Instalação de forro de drywall"
                    error={errors.name}
                    accessibilityLabel="Descrição do serviço"
                  />
                  <AppInput
                    label="Valor (R$)"
                    required
                    value={service.unitPrice}
                    onChangeText={(text) =>
                      updateService(service.id, 'unitPrice', text)
                    }
                    mask="currency"
                    placeholder="0,00"
                    error={errors.unitPrice}
                    accessibilityLabel="Valor do serviço"
                  />
                </AppCard>
              );
            })
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar serviço"
            onPress={addService}
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
            <Text style={styles.addItemText}>Adicionar serviço</Text>
          </Pressable>
        </View>
      );
    }

    if (stepKey === 'valores') {
      return (
        <View>
          <AppCard shadow="light" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo dos valores</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Materiais</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(materialsTotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Serviços</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(servicesTotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(itemsTotal)}
              </Text>
            </View>

            <View style={styles.summaryFieldsRow}>
              <View style={styles.itemFieldHalf}>
                <AppInput
                  label="Desconto (R$)"
                  value={draft.discount}
                  onChangeText={(text) =>
                    setDraft((d) => ({ ...d, discount: text }))
                  }
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Desconto"
                  style={styles.summaryInput}
                />
              </View>
              <PermissionGate allow={COST_VIEW_ROLES}>
                <View style={styles.itemFieldHalf}>
                  <AppInput
                    label="Margem (%)"
                    value={draft.marginPct}
                    onChangeText={(text) =>
                      setDraft((d) => ({ ...d, marginPct: text }))
                    }
                    placeholder="0"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Margem percentual"
                    style={styles.summaryInput}
                  />
                </View>
              </PermissionGate>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{formatCurrency(quoteTotal)}</Text>
            </View>
          </AppCard>
        </View>
      );
    }

    if (stepKey === 'prazo') {
      const prazoModes: {
        value: PrazoMode;
        label: string;
        description: string;
      }[] = [
        {
          value: 'A',
          label: 'Início + prazo',
          description: 'Previsão de início e prazo em dias',
        },
        {
          value: 'B',
          label: 'Início + conclusão',
          description: 'Previsão de início e de conclusão',
        },
        {
          value: 'C',
          label: 'Entregar até',
          description: 'Data-limite comercial',
        },
      ];
      return (
        <View>
          <Text style={styles.sectionLabel}>Como informar o prazo?</Text>
          <View style={styles.paymentRow}>
            {prazoModes.map((mode) => {
              const selected = mode.value === draft.prazoMode;
              return (
                <Pressable
                  key={mode.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Modo de prazo ${mode.label}`}
                  accessibilityState={{ selected }}
                  onPress={() =>
                    setDraft((d) => ({ ...d, prazoMode: mode.value }))
                  }
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
                    {mode.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {draft.prazoMode === 'A' ? (
            <View>
              <AppInput
                label="Previsão de início"
                required
                value={draft.startDate}
                onChangeText={(text) =>
                  setDraft((d) => ({ ...d, startDate: text }))
                }
                placeholder="AAAA-MM-DD"
                autoCapitalize="none"
                accessibilityLabel="Previsão de início"
              />
              <AppInput
                label="Prazo estimado (dias)"
                required
                value={draft.durationDays}
                onChangeText={(text) =>
                  setDraft((d) => ({ ...d, durationDays: text }))
                }
                placeholder="Ex.: 3"
                keyboardType="number-pad"
                accessibilityLabel="Prazo estimado em dias"
              />
              <Text style={styles.sectionLabel}>Contagem do prazo</Text>
              <View style={styles.paymentRow}>
                {(['UTEIS', 'CORRIDOS'] as const).map((calendar) => {
                  const selected = calendar === draft.prazoCalendar;
                  return (
                    <Pressable
                      key={calendar}
                      accessibilityRole="button"
                      accessibilityLabel={`Contagem em dias ${
                        calendar === 'UTEIS' ? 'úteis' : 'corridos'
                      }`}
                      accessibilityState={{ selected }}
                      onPress={() =>
                        setDraft((d) => ({ ...d, prazoCalendar: calendar }))
                      }
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
                        {calendar === 'UTEIS' ? 'Dias úteis' : 'Dias corridos'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.computedDateBox}>
                <Text style={styles.computedDateLabel}>
                  Previsão calculada de conclusão
                </Text>
                <Text style={styles.computedDateValue}>
                  {computedEndDate ? formatIsoDate(computedEndDate) : '—'}
                </Text>
              </View>
            </View>
          ) : null}

          {draft.prazoMode === 'B' ? (
            <View>
              <AppInput
                label="Previsão de início"
                required
                value={draft.startDate}
                onChangeText={(text) =>
                  setDraft((d) => ({ ...d, startDate: text }))
                }
                placeholder="AAAA-MM-DD"
                autoCapitalize="none"
                accessibilityLabel="Previsão de início"
              />
              <AppInput
                label="Previsão de conclusão"
                required
                value={draft.endDate}
                onChangeText={(text) =>
                  setDraft((d) => ({ ...d, endDate: text }))
                }
                placeholder="AAAA-MM-DD"
                autoCapitalize="none"
                accessibilityLabel="Previsão de conclusão"
              />
            </View>
          ) : null}

          {draft.prazoMode === 'C' ? (
            <AppInput
              label="Entregar até"
              required
              value={draft.deadlineDate}
              onChangeText={(text) =>
                setDraft((d) => ({ ...d, deadlineDate: text }))
              }
              placeholder="AAAA-MM-DD"
              autoCapitalize="none"
              accessibilityLabel="Data limite de entrega"
            />
          ) : null}

          <AppInput
            label="Observação de prazo"
            value={draft.deadlineObservation}
            onChangeText={(text) =>
              setDraft((d) => ({ ...d, deadlineObservation: text }))
            }
            placeholder="Ex.: Cliente precisa do serviço concluído antes de um evento (opcional)"
            accessibilityLabel="Observação de prazo"
            multiline
          />
        </View>
      );
    }

    if (stepKey === 'pagamento') {
      return (
        <View>
          <Text style={styles.sectionLabel}>Forma de pagamento</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_METHOD_OPTIONS.map((option) => {
              const selected = option.value === draft.paymentMethod;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Forma de pagamento ${option.label}`}
                  accessibilityState={{ selected }}
                  onPress={() =>
                    setDraft((d) => ({ ...d, paymentMethod: option.value }))
                  }
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
        </View>
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

      <WorkPickerModal
        visible={workModalVisible}
        works={clientWorks}
        isLoading={worksQuery.isLoading}
        isError={worksQuery.isError}
        errorMessage={worksQuery.isError ? toApiError(worksQuery.error).message : ''}
        onRetry={worksQuery.refetch}
        onSelect={handleSelectWork}
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
    marginBottom: spacing.lg,
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
  // Progresso
  progressWrap: {
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  progressDotDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  progressNumber: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textLight,
  },
  progressNumberCurrent: {
    color: colors.textOnPrimary,
  },
  progressCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressCaption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Etapa 1 — Cliente
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
  // Etapa 2 — Local
  localRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  localFieldHalf: {
    flex: 1,
  },
  // Etapa 3 — Medições
  infoCard: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  measurementOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  measurementOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  measurementMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectionCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Etapa 4 — Serviço/Materiais
  compositionCard: {
    marginBottom: spacing.lg,
  },
  compositionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  compositionCode: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compositionName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  materialCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  materialMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  materialQtyField: {
    width: 96,
  },
  materialQtyInput: {
    marginBottom: spacing.xs,
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
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
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
  itemFieldHalf: {
    flex: 1,
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
  summaryCost: {
    fontSize: typography.sizes.xl,
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
  recalculateButton: {
    marginBottom: spacing.sm,
  },
  // Etapa 4 — Serviço/Materiais
  serviceCard: {
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
  // Etapa 7 — Pagamento
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
  // Etapa 6 — Prazo
  computedDateBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.lg,
  },
  computedDateLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  computedDateValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Etapa 8 — Revisão
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  reviewValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  reviewMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  reviewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewItemName: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  reviewItemQty: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Erro da etapa + rodapé de navegação
  stepErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  stepErrorText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing['3xl'],
  },
  footerButton: {
    flex: 1,
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
  modalBody: {
    flex: 1,
  },
  modalFooter: {
    padding: sizes.screenPadding,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // Cadastro rápido de cliente (V3 §12)
  quickForm: {
    padding: sizes.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  quickFormHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  quickFormSection: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickFormRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickFormFieldHalf: {
    flex: 1,
  },
  quickFormSubmit: {
    marginTop: spacing.sm,
  },
});