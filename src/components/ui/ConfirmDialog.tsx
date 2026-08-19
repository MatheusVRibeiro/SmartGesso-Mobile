import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import AppButton from './AppButton';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Quando true, o botão de confirmar usa variante danger (vermelho). */
  danger?: boolean;
  loading?: boolean;
  /** Quando true, o botão de confirmar fica desabilitado (ex.: offline). */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  testID,
}: ConfirmDialogProps) {
  function handleBackdropPress() {
    if (!loading) {
      onCancel();
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleBackdropPress}
        accessibilityLabel="Fechar"
      >
        <Pressable
          testID={testID}
          accessibilityViewIsModal
          style={styles.card}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <AppButton
              title={cancelLabel}
              variant="ghost"
              size="sm"
              onPress={onCancel}
              disabled={loading}
              style={styles.cancelButton}
            />
            <AppButton
              title={confirmLabel}
              variant={danger ? 'danger' : 'primary'}
              size="sm"
              loading={loading}
              onPress={onConfirm}
              disabled={confirmDisabled}
              style={styles.confirmButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default ConfirmDialog;
export { ConfirmDialog };

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    ...shadows.medium,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});