import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, sizes, spacing, typography } from '../../theme';
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
  title = 'Ops, algo deu errado',
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
      <Ionicons
        name="alert-circle-outline"
        size={sizes.icon.xl * 2}
        color={colors.danger}
        accessibilityElementsHidden
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <AppButton
          title={retryLabel}
          variant="danger"
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
  title: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
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