import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, radius, sizes, spacing, typography } from '../../theme';
import AppButton from './AppButton';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  testID?: string;
}

function EmptyState({
  title,
  description,
  icon = 'file-tray-outline',
  iconColor = colors.primary,
  actionLabel,
  onAction,
  style,
  testID,
}: EmptyStateProps) {
  return (
    <View testID={testID} style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons
          name={icon}
          size={sizes.icon.xl}
          color={iconColor}
          accessibilityElementsHidden
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          variant="outline"
          size="sm"
          onPress={onAction}
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
    padding: spacing['3xl'],
  },
  iconCircle: {
    width: sizes.iconCircle,
    height: sizes.iconCircle,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.xl,
  },
});
