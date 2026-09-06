import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, shadows, spacing, typography } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import AppButton from './AppButton';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
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
  const { colors, isDark } = useAppTheme();

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
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={handleBackdropPress}
        accessibilityLabel="Fechar"
      >
        <Pressable
          testID={testID}
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    ...shadows.medium,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.md,
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
