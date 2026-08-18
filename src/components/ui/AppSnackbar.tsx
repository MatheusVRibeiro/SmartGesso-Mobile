import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, radius, shadows, sizes, spacing, typography } from '../../theme';

export type AppSnackbarType = 'success' | 'error' | 'info' | 'warning';
export type IconName = ComponentProps<typeof Ionicons>['name'];

const TYPE_CONFIG: Record<
  AppSnackbarType,
  { backgroundColor: string; icon: IconName }
> = {
  success: { backgroundColor: colors.success, icon: 'checkmark-circle' },
  error: { backgroundColor: colors.danger, icon: 'close-circle' },
  info: { backgroundColor: colors.primary, icon: 'information-circle' },
  warning: { backgroundColor: colors.warning, icon: 'warning' },
};

const DEFAULT_DURATION = 3000;

export interface AppSnackbarProps {
  visible: boolean;
  message: string;
  type?: AppSnackbarType;
  /** Duração em ms antes de ocultar automaticamente (default: 3000). */
  duration?: number;
  onHide?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  testID?: string;
}

function AppSnackbar({
  visible,
  message,
  type = 'info',
  duration = DEFAULT_DURATION,
  onHide,
  actionLabel,
  onAction,
  style,
  testID,
}: AppSnackbarProps) {
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onHideRef.current?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration]);

  if (!visible) {
    return null;
  }

  const config = TYPE_CONFIG[type];

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.container, style]}
    >
      <Ionicons
        name={config.icon}
        size={sizes.icon.md}
        color={colors.white}
        accessibilityElementsHidden
      />
      <Text style={styles.text} numberOfLines={3}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={8}
          style={styles.action}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default AppSnackbar;
export { AppSnackbar };

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing['2xl'],
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    ...shadows.strong,
    zIndex: 9999,
    elevation: 9999,
  },
  text: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  action: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textDecorationLine: 'underline',
  },
});