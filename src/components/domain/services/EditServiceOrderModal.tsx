import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../ui/AppButton';
import { AppDatePicker } from '../../ui/AppDatePicker';
import { AppInput } from '../../ui/AppInput';
import { borders, colors, radius, sizes, spacing, typography } from '../../../theme';
import type { ServiceOrder, ServiceOrderStatus } from '../../../types/serviceOrder';

export interface EditServiceOrderModalProps {
  visible: boolean;
  order: ServiceOrder;
  loading: boolean;
  onSave: (data: {
    status: ServiceOrderStatus;
    scheduledDate?: string;
    completedDate?: string;
    observations?: string;
    pauseReason?: string;
    cost?: number;
    saleValue?: number;
  }) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: ServiceOrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'PENDENTE', label: 'Agendado', icon: 'time-outline' },
  { value: 'EM_DESLOCAMENTO', label: 'Deslocamento', icon: 'navigate-outline' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento', icon: 'play-outline' },
  { value: 'PAUSADA', label: 'Pausado', icon: 'pause-circle-outline' },
  { value: 'CONCLUIDA', label: 'Concluído', icon: 'checkmark-circle-outline' },
  { value: 'CANCELADA', label: 'Cancelado', icon: 'close-circle-outline' },
];

export function EditServiceOrderModal({
  visible,
  order,
  loading,
  onSave,
  onClose,
}: EditServiceOrderModalProps) {
  const [status, setStatus] = useState<ServiceOrderStatus>(order.status);
  const [scheduledDate, setScheduledDate] = useState(order.scheduledDate ?? '');
  const [completedDate, setCompletedDate] = useState(order.completedDate ?? '');
  const [observations, setObservations] = useState(order.observations ?? '');
  const [pauseReason, setPauseReason] = useState(order.pauseReason ?? '');
  const [cost, setCost] = useState(order.cost != null ? String(order.cost) : '');
  const [saleValue, setSaleValue] = useState(
    order.saleValue != null ? String(order.saleValue) : ''
  );

  useEffect(() => {
    if (visible) {
      setStatus(order.status);
      setScheduledDate(order.scheduledDate ?? '');
      setCompletedDate(order.completedDate ?? '');
      setObservations(order.observations ?? '');
      setPauseReason(order.pauseReason ?? '');
      setCost(order.cost != null ? String(order.cost) : '');
      setSaleValue(order.saleValue != null ? String(order.saleValue) : '');
    }
  }, [visible, order]);

  const handleSave = () => {
    const parsedCost = cost.trim() !== '' ? parseFloat(cost.replace(',', '.')) : undefined;
    const parsedSale = saleValue.trim() !== '' ? parseFloat(saleValue.replace(',', '.')) : undefined;

    onSave({
      status,
      scheduledDate: scheduledDate.trim() || undefined,
      completedDate: completedDate.trim() || undefined,
      observations: observations.trim() || undefined,
      pauseReason: status === 'PAUSADA' ? pauseReason.trim() || undefined : undefined,
      cost: Number.isNaN(parsedCost) ? undefined : parsedCost,
      saleValue: Number.isNaN(parsedSale) ? undefined : parsedSale,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Editar Ordem de Serviço</Text>
            <Text style={styles.modalSubtitle}>OS #{order.code}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar edição"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
          {/* Status */}
          <Text style={styles.sectionLabel}>Status da OS</Text>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((opt) => {
              const selected = status === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Status ${opt.label}`}
                  accessibilityState={{ selected }}
                  onPress={() => setStatus(opt.value)}
                  style={[
                    styles.statusChip,
                    selected && styles.statusChipSelected,
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={sizes.icon.sm}
                    color={selected ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.statusChipText,
                      selected && styles.statusChipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {status === 'PAUSADA' ? (
            <AppInput
              label="Motivo da pausa"
              value={pauseReason}
              onChangeText={setPauseReason}
              placeholder="Ex.: Aguardando cliente, chuva..."
              accessibilityLabel="Motivo da pausa"
            />
          ) : null}

          {/* Datas */}
          <Text style={styles.sectionLabel}>Datas e Prazos</Text>
          <AppDatePicker
            label="Data agendada (início)"
            value={scheduledDate}
            onChange={(iso) => setScheduledDate(iso)}
            placeholder="Selecione a data agendada"
            accessibilityLabel="Data agendada da OS"
          />

          <AppDatePicker
            label="Data de conclusão"
            value={completedDate}
            onChange={(iso) => setCompletedDate(iso)}
            placeholder="Selecione a data de conclusão"
            accessibilityLabel="Data de conclusão da OS"
          />

          {/* Valores Financeiros */}
          <Text style={styles.sectionLabel}>Financeiro e Valores</Text>
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <AppInput
                label="Valor contratado (Venda)"
                value={saleValue}
                onChangeText={setSaleValue}
                placeholder="0,00"
                keyboardType="decimal-pad"
                accessibilityLabel="Valor de venda da OS"
              />
            </View>
            <View style={styles.halfCol}>
              <AppInput
                label="Custo total realizado"
                value={cost}
                onChangeText={setCost}
                placeholder="0,00"
                keyboardType="decimal-pad"
                accessibilityLabel="Custo realizado da OS"
              />
            </View>
          </View>

          {/* Observações */}
          <Text style={styles.sectionLabel}>Observações gerais</Text>
          <AppInput
            label="Observações da OS"
            value={observations}
            onChangeText={setObservations}
            placeholder="Anotações e detalhes operacionais..."
            multiline
            numberOfLines={4}
            accessibilityLabel="Observações da ordem de serviço"
          />

          <View style={styles.actionButtons}>
            <AppButton
              title="Salvar alterações"
              size="lg"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              accessibilityLabel="Salvar alterações da OS"
              style={styles.saveButton}
            />
            <AppButton
              title="Cancelar"
              variant="outline"
              size="lg"
              onPress={onClose}
              disabled={loading}
              accessibilityLabel="Cancelar edição"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default EditServiceOrderModal;

const styles = StyleSheet.create({
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
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: sizes.screenPadding,
    paddingBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: sizes.touchTarget,
  },
  statusChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  statusChipTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  actionButtons: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  saveButton: {
    marginBottom: spacing.xs,
  },
});
