import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { radius, sizes, spacing, typography } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import AppButton, { AppButtonProps } from './AppButton';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    title: string;
    onPress: () => void;
    variant?: AppButtonProps['variant'];
  };
  style?: ViewStyle;
  testID?: string;
}

function EmptyState({
  title,
  description,
  icon = 'file-tray-outline',
  iconColor,
  actionLabel,
  onAction,
  action,
  style,
  testID,
}: EmptyStateProps) {
  const { colors, isDark } = useAppTheme();
  const effectiveIconColor = iconColor ?? colors.primary;

  return (
    <View testID={testID} style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? 'rgba(94, 106, 210, 0.15)' : colors.primarySoft },
        ]}
      >
        <Ionicons
          name={icon}
          size={sizes.icon.xl}
          color={effectiveIconColor}
          accessibilityElementsHidden
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          variant="outline"
          size="sm"
          onPress={onAction}
          style={styles.action}
        />
      ) : action ? (
        <AppButton
          title={action.title}
          variant={action.variant ?? 'primary'}
          onPress={action.onPress}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

export default EmptyState;
export { EmptyState };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    minHeight: 240,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.5,
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  action: {
    marginTop: spacing.sm,
  },
});
