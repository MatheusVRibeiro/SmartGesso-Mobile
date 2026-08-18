import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizes, spacing, typography } from '../../theme';

export interface OfflineBannerProps {
  visible: boolean;
  message?: string;
  style?: ViewStyle;
  testID?: string;
}

function OfflineBanner({
  visible,
  message = 'Você está offline. Verifique sua conexão.',
  style,
  testID,
}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, style]}
    >
      <Ionicons
        name="cloud-offline-outline"
        size={sizes.icon.md}
        color={colors.white}
        accessibilityElementsHidden
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export default OfflineBanner;
export { OfflineBanner };

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  text: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
    flexShrink: 1,
  },
});