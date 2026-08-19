import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius as radiusTokens, shadows, spacing } from '../../theme';
import type { ShadowName } from '../../theme';

export interface AppCardProps {
  children: React.ReactNode;
  /** Padding interno (default: spacing.lg = 16). */
  padding?: number;
  /** Raio dos cantos (default: radius.md = 12). */
  radius?: number;
  /** Sombra opcional (default: 'light'). */
  shadow?: ShadowName | 'none';
  style?: ViewStyle;
  testID?: string;
}

function AppCard({
  children,
  padding = spacing.lg,
  radius: radiusProp = radiusTokens.md,
  shadow = 'light',
  style,
  testID,
}: AppCardProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.base,
        { padding, borderRadius: radiusProp },
        shadow !== 'none' && shadows[shadow],
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default AppCard;
export { AppCard };

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
