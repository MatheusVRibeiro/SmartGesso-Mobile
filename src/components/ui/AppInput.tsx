import React, { forwardRef, useState } from 'react';
import {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { borders, colors, radius, sizes, spacing, typography } from '../../theme';

export interface AppInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  editable?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  maxLength?: number;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  accessibilityLabel?: string;
  /** Elemento renderizado à esquerda do campo (ex.: ícone de busca). */
  leftAccessory?: React.ReactNode;
  /** Elemento renderizado à direita do campo (ex.: toggle de senha). */
  rightAccessory?: React.ReactNode;
  /** Habilita campo de múltiplas linhas (ex.: observações). */
  multiline?: boolean;
  /** Número de linhas visíveis quando `multiline` (default: 3). */
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  testID?: string;
}

const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  {
    label,
    value,
    onChangeText,
    placeholder,
    error,
    helper,
    required = false,
    keyboardType,
    secureTextEntry = false,
    editable = true,
    autoCapitalize,
    autoCorrect,
    maxLength,
    returnKeyType,
    onSubmitEditing,
    accessibilityLabel,
    leftAccessory,
    rightAccessory,
    multiline = false,
    numberOfLines = 3,
    style,
    inputStyle,
    testID,
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <View style={styles.inputWrapper}>
        {leftAccessory != null ? (
          <View style={styles.leftAccessory}>{leftAccessory}</View>
        ) : null}
        <TextInput
          ref={ref}
          testID={testID}
          style={[
            styles.input,
            focused && !hasError && styles.inputFocused,
            hasError && styles.inputError,
            editable === false && styles.inputDisabled,
            leftAccessory != null && styles.inputWithLeftAccessory,
            rightAccessory != null && styles.inputWithAccessory,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: !editable }}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
        />
        {rightAccessory != null ? (
          <View style={styles.accessory}>{rightAccessory}</View>
        ) : null}
      </View>

      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
      {!hasError && helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
});

export default AppInput;
export { AppInput };

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.danger,
    fontWeight: typography.weights.bold,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: sizes.inputHeight,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.inputFocus,
    boxShadow: `0px 0px 0px 3px ${colors.focusRing}`,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: borders.width.regular,
  },
  inputDisabled: {
    backgroundColor: colors.disabledBackground,
    color: colors.disabledText,
  },
  inputWithLeftAccessory: {
    paddingLeft: 48,
  },
  leftAccessory: {
    position: 'absolute',
    left: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  inputWithAccessory: {
    paddingRight: 48,
  },
  inputMultiline: {
    height: 'auto',
    minHeight: 96,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    textAlignVertical: 'top',
  },
  accessory: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
