/**
 * SmartGesso Mobile — V5 ETAPA 9: orquestrador fino do wizard de orçamento.
 *
 * A lógica foi extraída para src/features/quotes/create/ (hooks, components,
 * types, utils). Este arquivo mantém apenas o layout da tela — incluindo o
 * formulário inline da etapa 'local' e a etapa de revisão, acoplados ao
 * estado de UI do draft. Zero mudança de comportamento em relação ao
 * monólito original (1676 linhas).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { toApiError } from '@/src/services/api/client';
import { clientsService } from '@/src/services/api/clients';
import { quotesService } from '@/src/services/api/quotes';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { PermissionGate } from '@/src/components/domain/PermissionGate';
import { COST_VIEW_ROLES } from '@/src/types/permissions';
import { sizes } from '@/src/theme';
import { formatCurrency, formatNumber, formatQuoteCode } from '@/src/utils/format';
import { ClienteStep } from '@/src/components/domain/quotes/steps/ClienteStep';
import { AmbientesStep } from '@/src/components/domain/quotes/steps/AmbientesStep';
import { ItensStep } from '@/src/components/domain/quotes/steps/ItensStep';
import { ValoresStep } from '@/src/components/domain/quotes/steps/ValoresStep';
import { PrazoPagamentoStep } from '@/src/components/domain/quotes/steps/PrazoPagamentoStep';
import {
  buildLocalSummary,
  computeEndDate,
  formatIsoDate,
  nextEnvironmentId,
  parseNumber,
  toArray,
  PAYMENT_METHOD_OPTIONS,
  STEP_META,
  type MeasurementApplicationType,
  type Client,
  type QuoteEnvironmentDraft,
  type QuoteLocalDraft,
} from '@/src/components/domain/quotes/wizard/types';
import { createWizardStyles } from './styles';
import { ClientPickerModal } from '@/src/features/quotes/create/components/ClientPickerModal';
import { QuickClientModal } from '@/src/features/quotes/create/components/QuickClientModal';
import { StepProgress } from '@/src/features/quotes/create/components/StepProgress';
import { useQuoteDraft } from '@/src/features/quotes/create/hooks/useQuoteDraft';
import { useQuoteWizard } from '@/src/features/quotes/create/hooks/useQuoteWizard';
import { useMaterialCalculation } from '@/src/features/quotes/create/hooks/useMaterialCalculation';
import { useQuoteSubmit } from '@/src/features/quotes/create/hooks/useQuoteSubmit';
import type { QuoteSnackbarState } from '@/src/features/quotes/create/hooks/useQuoteSubmit.types';
import {
  computeCalcKey,
  computeQuoteTotal,
} from '@/src/features/quotes/create/utils';

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function NovoOrcamentoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [quickClientVisible, setQuickClientVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<QuoteSnackbarState | null>(null);

  const {
    draft,
    setDraft,
    serviceErrors,
    setServiceErrors,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    updateMeasurement,
    updateMaterialQuantity,
    addService,
    updateService,
    removeService,
    materialsTotal,
    servicesTotal,
  } = useQuoteDraft();

  const { currentStep, stepError, goNext, goBack } = useQuoteWizard(draft);

  const params = useLocalSearchParams<{
    clientId?: string;
    calcType?: string;
    calcName?: string;
    calcLength?: string;
    calcWidth?: string;
    calcHeight?: string;
    calcArea?: string;
    calcPerimeter?: string;
    calcLaborPrice?: string;
  }>();

  // Pré-preenchimento vindo da Calculadora ou de percurso com cliente
  useEffect(() => {
    if (params.calcType && params.calcArea) {
      setDraft((d) => {
        if (d.environments.length > 0) return d;
        const initialEnv: QuoteEnvironmentDraft = {
          id: nextEnvironmentId(),
          name: params.calcName || 'Ambiente Calculado',
          description: `Calculado: ${params.calcName || params.calcType}`,
          order: 0,
          applicationType: (params.calcType as MeasurementApplicationType) || 'DRYWALL',
          measurement: {
            length: params.calcLength || '',
            width: params.calcWidth || '',
            height: params.calcHeight || '',
            area: params.calcArea || '',
            perimeter: params.calcPerimeter || '',
            observations: '',
          },
        };
        return {
          ...d,
          clientId: params.clientId || d.clientId,
          environments: [initialEnv],
        };
      });
    } else if (params.clientId) {
      setDraft((d) => ({ ...d, clientId: params.clientId || d.clientId }));
    }
  }, [params.calcType, params.calcArea, params.calcName, params.calcLength, params.calcWidth, params.calcHeight, params.calcPerimeter, params.clientId, setDraft]);

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
    () => computeCalcKey(draft.environments),
    [draft.environments],
  );

  const itemsTotal = materialsTotal + servicesTotal;

  const quoteTotal = useMemo(
    () => computeQuoteTotal(itemsTotal, draft.discount, draft.marginPct),
    [itemsTotal, draft.discount, draft.marginPct],
  );

  /** Conclusão calculada no Modo A (início + prazo em dias). */
  const computedEndDate = useMemo(() => computeEndDate(draft), [draft]);

  // ── Cálculo de materiais (Etapa 4) ─────────────────────────────────────────

  const {
    materialsCalc,
    materialsCalcPending,
    materialsCalcError,
    runMaterialsCalculation,
    clearMaterialsCalc,
  } = useMaterialCalculation(
    setDraft,
    currentStep,
    calcKey,
    draft.environments,
  );

  // ── Submissão (Etapa 8) ────────────────────────────────────────────────────

  function handleSelectClient(clientId: string) {
    setDraft((d) => ({
      ...d,
      clientId,
      environments: [],
    }));
    clearMaterialsCalc();
    setClientModalVisible(false);
  }

  const { createMutation, createClientMutation, handleSubmit } = useQuoteSubmit({
    companyId,
    onBack: () => router.back(),
    setSnackbar,
    onClientCreated: handleSelectClient,
    onCloseQuickClient: () => setQuickClientVisible(false),
  });

  function handleRecalculate() {
    if (draft.environments.length === 0 || calcKey === '') return;
    runMaterialsCalculation(draft.environments, calcKey);
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
      <ScreenContainer scroll padding keyboardAvoiding>
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
              onPress={() => goNext(setServiceErrors)}
              accessibilityLabel="Continuar para a próxima etapa"
              style={styles.footerButton}
            />
          ) : (
            <AppButton
              title="Gerar orçamento"
              size="lg"
              onPress={() => handleSubmit(draft)}
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
