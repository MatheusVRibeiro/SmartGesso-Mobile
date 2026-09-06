import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { borders, colors, radius, sizes, spacing, typography } from '../../theme';
import {
  formatDateBr,
  getDaysInMonth,
  getFirstDayOfWeek,
  isValidIsoDate,
  MONTH_NAMES_PT_BR,
  parseDateBrToIso,
  toIsoDateString,
  WEEKDAY_SHORT_PT_BR,
} from '../../utils/date';

export interface AppDatePickerProps {
  label?: string;
  /** Valor da data (pode ser ISO 'AAAA-MM-DD' ou BR 'DD/MM/AAAA') */
  value?: string | null;
  /** Callback com valor em formato ISO 'AAAA-MM-DD' e formatado 'DD/MM/AAAA' */
  onChange: (isoDate: string, brDate: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

export function AppDatePicker({
  label,
  value,
  onChange,
  placeholder = 'Selecione a data',
  error,
  helper,
  required = false,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: AppDatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Converte o valor inicial para Date
  const initialDate = useMemo(() => {
    if (!value) return new Date();
    const iso = parseDateBrToIso(value);
    if (iso && isValidIsoDate(iso)) {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [tempSelectedIso, setTempSelectedIso] = useState<string | null>(
    value ? parseDateBrToIso(value) : null
  );

  const displayFormatted = value ? formatDateBr(value) : '';
  const hasError = Boolean(error);

  const openPicker = () => {
    if (disabled) return;
    const baseDate = value ? parseDateBrToIso(value) : null;
    if (baseDate && isValidIsoDate(baseDate)) {
      const [y, m, d] = baseDate.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
      setTempSelectedIso(baseDate);
    } else {
      const today = new Date();
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setTempSelectedIso(null);
    }
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    const iso = toIsoDateString(selected);
    setTempSelectedIso(iso);
    const br = formatDateBr(iso);
    onChange(iso, br);
    setModalVisible(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const iso = toIsoDateString(today);
    setTempSelectedIso(iso);
    const br = formatDateBr(iso);
    onChange(iso, br);
    setModalVisible(false);
  };

  const handleClear = () => {
    setTempSelectedIso(null);
    onChange('', '');
    setModalVisible(false);
  };

  // Monta os dias do mês atual
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  const todayIso = toIsoDateString(new Date());

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? 'Selecionar data'}
        accessibilityState={{ disabled }}
        onPress={openPicker}
        style={[
          styles.inputWrapper,
          hasError && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        <Text
          style={[
            styles.inputText,
            !displayFormatted && styles.inputPlaceholder,
            disabled && styles.inputTextDisabled,
          ]}
        >
          {displayFormatted || placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={sizes.icon.md}
          color={disabled ? colors.disabledText : colors.primary}
          style={styles.calendarIcon}
        />
      </Pressable>

      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
      {!hasError && helper ? <Text style={styles.helperText}>{helper}</Text> : null}

      {/* ── Modal do Calendário Brasileiro ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {label ? `Selecionar ${label}` : 'Selecionar data'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar calendário"
                  onPress={() => setModalVisible(false)}
                  hitSlop={8}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={sizes.icon.md} color={colors.text} />
                </Pressable>
              </View>

              {/* Mês / Ano Navigator */}
              <View style={styles.monthHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mês anterior"
                  onPress={handlePrevMonth}
                  style={styles.navButton}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </Pressable>

                <Text style={styles.monthYearText}>
                  {MONTH_NAMES_PT_BR[viewMonth]} de {viewYear}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Próximo mês"
                  onPress={handleNextMonth}
                  style={styles.navButton}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </Pressable>
              </View>

              {/* Cabeçalho dos dias da semana */}
              <View style={styles.weekdaysRow}>
                {WEEKDAY_SHORT_PT_BR.map((w, i) => (
                  <Text
                    key={w}
                    style={[styles.weekdayText, (i === 0 || i === 6) && styles.weekendText]}
                  >
                    {w}
                  </Text>
                ))}
              </View>

              {/* Grade de dias */}
              <View style={styles.daysGrid}>
                {/* Espaços vazios antes do 1º dia */}
                {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.dayCellEmpty} />
                ))}

                {/* Dias do mês */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const currentCellDate = new Date(viewYear, viewMonth, day);
                  const currentCellIso = toIsoDateString(currentCellDate);

                  const isSelected = tempSelectedIso === currentCellIso;
                  const isToday = todayIso === currentCellIso;

                  return (
                    <Pressable
                      key={`day-${day}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${day} de ${MONTH_NAMES_PT_BR[viewMonth]} de ${viewYear}`}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => handleSelectDay(day)}
                      style={[
                        styles.dayCell,
                        isToday && styles.dayCellToday,
                        isSelected && styles.dayCellSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.dayTextToday,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Ações inferiores */}
              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar hoje"
                  onPress={handleSelectToday}
                  style={styles.todayButton}
                >
                  <Text style={styles.todayButtonText}>Hoje</Text>
                </Pressable>

                {!required ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Limpar data"
                    onPress={handleClear}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>Limpar</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar"
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

export default AppDatePicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.danger,
    fontWeight: typography.weights.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: sizes.inputHeight,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: borders.width.regular,
  },
  inputDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  inputText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
  },
  inputPlaceholder: {
    color: colors.textLight,
  },
  inputTextDisabled: {
    color: colors.disabledText,
  },
  calendarIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  monthYearText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  weekendText: {
    color: colors.textLight,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  dayCellEmpty: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    marginVertical: 2,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  todayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginRight: 'auto',
  },
  todayButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.danger,
    fontWeight: typography.weights.medium,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});
