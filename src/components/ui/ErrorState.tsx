import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, radius, sizes, spacing, typography } from '../../theme';
import AppButton from './AppButton';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface ErrorStateProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

function ErrorState({
  message,
  title = 'Algo deu errado',
  onRetry,
  retryLabel = 'Tentar novamente',
  style,
  testID,
}: ErrorStateProps) {
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={[styles.container, style]}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name="alert-circle"
          size={sizes.icon.xl}
          color={colors.danger}
          accessibilityElementsHidden
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <AppButton
          title={retryLabel}
          variant="primary"
          size="sm"
          onPress={onRetry}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

export default ErrorState;
export { ErrorState };

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
    backgroundColor: colors.dangerSoft,
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
  message: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.xl,
  },
});
