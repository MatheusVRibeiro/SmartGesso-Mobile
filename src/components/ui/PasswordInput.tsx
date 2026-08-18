import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizes, spacing } from '../../theme';
import AppInput, { AppInputProps } from './AppInput';

export interface PasswordInputProps
  extends Omit<AppInputProps, 'secureTextEntry' | 'rightAccessory'> {
  /** AccessibilityLabel do botão quando a senha está oculta. */
  showPasswordAccessibilityLabel?: string;
  /** AccessibilityLabel do botão quando a senha está visível. */
  hidePasswordAccessibilityLabel?: string;
}

const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  function PasswordInput(
    {
      showPasswordAccessibilityLabel = 'Mostrar senha',
      hidePasswordAccessibilityLabel = 'Ocultar senha',
      ...props
    },
    ref
  ) {
    const [visible, setVisible] = useState(false);

    function toggleVisibility() {
      setVisible((prev) => !prev);
    }

    return (
      <AppInput
        {...props}
        ref={ref}
        secureTextEntry={!visible}
        rightAccessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible
                ? hidePasswordAccessibilityLabel
                : showPasswordAccessibilityLabel
            }
            accessibilityState={{ expanded: visible }}
            onPress={toggleVisibility}
            hitSlop={8}
            style={styles.toggle}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={sizes.icon.md}
              color={colors.textSecondary}
            />
          </Pressable>
        }
      />
    );
  }
);

export default PasswordInput;
export { PasswordInput };

const styles = StyleSheet.create({
  toggle: {
    padding: spacing.xs,
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});