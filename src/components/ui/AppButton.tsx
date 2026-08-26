import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { borders, colors, radius, sizes, typography } from '../../theme';
import { PressableScale } from './PressableScale';

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
  secondary: {
    backgroundColor: colors.transparent,
    borderWidth: borders.width.thin,
    borderColor: colors.inputBorder,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: borders.width.thin,
    borderColor: colors.primary,
  },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: colors.transparent },
};

const TEXT_COLORS: Record<AppButtonVariant, string> = {
  primary: colors.textOnPrimary,
  secondary: colors.text,
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
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      style={style}
    >
      <Pressable
        testID={testID}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
          pressed && !isDisabled && variant === 'primary' && styles.pressedPrimary,
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
    </PressableScale>
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
  },
  disabled: {
    backgroundColor: colors.disabledBackground,
  },
  pressed: {
    opacity: 0.85,
  },
  pressedPrimary: {
    backgroundColor: colors.primaryDark,
  },
  label: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
