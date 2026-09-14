import React from 'react';
import { View, ViewStyle } from 'react-native';
import { radius as radiusTokens, shadows, spacing } from '../../theme';
import type { ShadowName } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';

export interface AppCardProps {
  children: React.ReactNode;
  /** Padding interno (default: spacing.lg = 16). */
  padding?: number;
  /** Raio dos cantos (default: radius.lg = 16 — Etapa 3; cards compactos podem usar md = 12). */
  radius?: number;
  /** Sombra opcional (default: 'light'). */
  shadow?: ShadowName | 'none';
  style?: ViewStyle;
  testID?: string;
}

function AppCard({
  children,
  padding = spacing.lg,
  radius: radiusProp = radiusTokens.lg,
  shadow = 'light',
  style,
  testID,
}: AppCardProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
          borderWidth: 1,
        },
        { padding, borderRadius: radiusProp },
        shadow !== 'none' && !isDark && shadows[shadow],
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default AppCard;
export { AppCard };
