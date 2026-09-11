import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, sizes, spacing, typography } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import AppButton from './AppButton';

export interface ErrorStateProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

function ErrorState({
  message = 'Ocorreu um erro ao carregar os dados.',
  title = 'Algo deu errado',
  onRetry,
  retryLabel = 'Tentar novamente',
  style,
  testID,
}: ErrorStateProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View testID={testID} style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? 'rgba(240, 113, 113, 0.15)' : colors.dangerSoft },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={sizes.icon.xl}
          color={colors.danger}
          accessibilityElementsHidden
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry ? (
        <AppButton
          title={retryLabel}
          variant="outline"
          onPress={onRetry}
          style={styles.retryButton}
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
  message: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.5,
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
});
