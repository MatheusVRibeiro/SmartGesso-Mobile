import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { spacing, typography } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';

export interface LoadingStateProps {
  text?: string;
  size?: 'small' | 'large';
  style?: ViewStyle;
  testID?: string;
}

function LoadingState({
  text = 'Carregando...',
  size = 'large',
  style,
  testID,
}: LoadingStateProps) {
  const { colors } = useAppTheme();

  return (
    <View testID={testID} style={[styles.container, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {text ? <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text> : null}
    </View>
  );
}

export default LoadingState;
export { LoadingState };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    minHeight: 160,
  },
  text: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
