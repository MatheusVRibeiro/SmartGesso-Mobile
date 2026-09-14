import { useAppTheme } from '../../../../theme/ThemeProvider';
/**
 * SmartGesso Mobile — Etapas 6 & 7: Prazo e Pagamento do wizard de orçamento.
 *
 * Extraído de app/(app)/orcamentos/novo.tsx (ETAPA 4).
 * O estado (draft) permanece no screen; este componente é apresentacional.
 *
 * O `subStep` controla qual bloco renderiza — preservando a navegação
 * sequencial original (prazo → pagamento → revisão).
 */
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppDatePicker } from '../../../ui/AppDatePicker';
import { AppInput } from '../../../ui/AppInput';
import { spacing } from '../../../../theme';
import { createWizardStyles } from '../wizard/styles';
import {
  formatIsoDate,
  type PrazoCalendar,
  type PrazoMode,
} from '../wizard/types';
import { PAYMENT_METHOD_OPTIONS } from '../wizard/types';
import type { QuotePaymentMethod } from '../../../../types/quote';

export type PrazoPagamentoSubStep = 'prazo' | 'pagamento';

/** Modos de preenchimento do prazo (V3). */
const PRAZO_MODES: {
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

export interface PrazoPagamentoStepProps {
  subStep?: PrazoPagamentoSubStep;
  prazoMode: PrazoMode;
  prazoCalendar: PrazoCalendar;
  startDate: string;
  durationDays: string;
  endDate: string;
  deadlineDate: string;
  deadlineObservation: string;
  paymentMethod: QuotePaymentMethod;
  computedEndDate: string | null;
  onPrazoModeChange: (value: PrazoMode) => void;
  onPrazoCalendarChange: (value: PrazoCalendar) => void;
  onStartDateChange: (value: string) => void;
  onDurationDaysChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDeadlineDateChange: (value: string) => void;
  onDeadlineObservationChange: (value: string) => void;
  onPaymentMethodChange: (value: QuotePaymentMethod) => void;
}

export function PrazoPagamentoStep({
  subStep,
  prazoMode,
  prazoCalendar,
  startDate,
  durationDays,
  endDate,
  deadlineDate,
  deadlineObservation,
  paymentMethod,
  computedEndDate,
  onPrazoModeChange,
  onPrazoCalendarChange,
  onStartDateChange,
  onDurationDaysChange,
  onEndDateChange,
  onDeadlineDateChange,
  onDeadlineObservationChange,
  onPaymentMethodChange,
}: PrazoPagamentoStepProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);

  const renderPrazoSection = () => (
    <View>
      <Text style={styles.sectionLabel}>Como informar o prazo?</Text>
      <View style={styles.paymentRow}>
        {PRAZO_MODES.map((mode) => {
          const selected = mode.value === prazoMode;
          return (
            <Pressable
              key={mode.value}
              accessibilityRole="button"
              accessibilityLabel={`Modo de prazo ${mode.label}`}
              accessibilityState={{ selected }}
              onPress={() => onPrazoModeChange(mode.value)}
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

      {prazoMode === 'A' ? (
        <View>
          <AppDatePicker
            label="Previsão de início"
            required
            value={startDate}
            onChange={(iso) => onStartDateChange(iso)}
            placeholder="Selecione a data de início"
            accessibilityLabel="Previsão de início"
          />
          <AppInput
            label="Prazo estimado (dias)"
            required
            value={durationDays}
            onChangeText={onDurationDaysChange}
            placeholder="Ex.: 3"
            keyboardType="number-pad"
            accessibilityLabel="Prazo estimado em dias"
          />
          <Text style={styles.sectionLabel}>Contagem do prazo</Text>
          <View style={styles.paymentRow}>
            {(['UTEIS', 'CORRIDOS'] as const).map((calendar) => {
              const selected = calendar === prazoCalendar;
              return (
                <Pressable
                  key={calendar}
                  accessibilityRole="button"
                  accessibilityLabel={`Contagem em dias ${
                    calendar === 'UTEIS' ? 'úteis' : 'corridos'
                  }`}
                  accessibilityState={{ selected }}
                  onPress={() => onPrazoCalendarChange(calendar)}
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

      {prazoMode === 'B' ? (
        <View>
          <AppDatePicker
            label="Previsão de início"
            required
            value={startDate}
            onChange={(iso) => onStartDateChange(iso)}
            placeholder="Selecione a data de início"
            accessibilityLabel="Previsão de início"
          />
          <AppDatePicker
            label="Previsão de conclusão"
            required
            value={endDate}
            onChange={(iso) => onEndDateChange(iso)}
            placeholder="Selecione a data de conclusão"
            accessibilityLabel="Previsão de conclusão"
          />
        </View>
      ) : null}

      {prazoMode === 'C' ? (
        <AppDatePicker
          label="Entregar até"
          required
          value={deadlineDate}
          onChange={(iso) => onDeadlineDateChange(iso)}
          placeholder="Selecione a data limite"
          accessibilityLabel="Data limite de entrega"
        />
      ) : null}

      <AppInput
        label="Observação de prazo"
        value={deadlineObservation}
        onChangeText={onDeadlineObservationChange}
        placeholder="Ex.: Cliente precisa do serviço concluído antes de um evento (opcional)"
        accessibilityLabel="Observação de prazo"
        multiline
      />
    </View>
  );

  const renderPagamentoSection = () => (
    <View style={{ marginTop: spacing.md }}>
      <Text style={styles.sectionLabel}>Forma de pagamento</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const selected = option.value === paymentMethod;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={`Forma de pagamento ${option.label}`}
              accessibilityState={{ selected }}
              onPress={() => onPaymentMethodChange(option.value)}
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

  if (subStep === 'prazo') return renderPrazoSection();
  if (subStep === 'pagamento') return renderPagamentoSection();

  return (
    <View>
      {renderPrazoSection()}
      {renderPagamentoSection()}
    </View>
  );
}

export default PrazoPagamentoStep;
