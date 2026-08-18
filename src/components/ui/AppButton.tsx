import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, radius, sizes, typography } from '../../theme';

export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'ghost';

export type AppButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

const VARIANT_STYLES: Record<AppButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: colors.transparent },
};

const TEXT_COLORS: Record<AppButtonVariant, string> = {
  primary: colors.textOnPrimary,
  secondary: colors.textOnSecondary,
  outline: colors.primary,
  danger: colors.textOnPrimary,
  ghost: colors.primary,
};

const SIZE_STYLES: Record<AppButtonSize, ViewStyle> = {
  sm: { height: sizes.buttonHeight.sm, paddingHorizontal: 12 },
  md: { height: sizes.buttonHeight.md, paddingHorizontal: 20 },
  lg: { height: sizes.buttonHeight.lg, paddingHorizontal: 28 },
};

const FONT_SIZES: Record<AppButtonSize, number> = {
  sm: typography.sizes.sm,
  md: typography.sizes.md,
  lg: typography.sizes.lg,
};

function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const textColor = isDisabled ? colors.disabledText : TEXT_COLORS[variant];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            { color: textColor, fontSize: FONT_SIZES[size] },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export default AppButton;
export { AppButton };

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    minHeight: sizes.touchTarget,
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});