import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizes, spacing, typography } from '../../theme';

export interface OfflineBannerProps {
  visible: boolean;
  pendingCount?: number;
  style?: ViewStyle;
  testID?: string;
}

function OfflineBanner({
  visible,
  pendingCount = 0,
  style,
  testID,
}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  const message = pendingCount > 0
    ? `Offline — ${pendingCount} altera${pendingCount === 1 ? 'ção' : 'ções'} pendente${pendingCount === 1 ? '' : 's'}`
    : 'Você está offline';

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