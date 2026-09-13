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
import { borders, radius, sizes, spacing, typography } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { applyMask, maskKeyboardType, type InputMask } from '../../utils/masks';

export interface AppInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  /** Máscara de entrada com auto-correção (CPF/CNPJ, telefone, CEP, moeda). */
  mask?: InputMask;
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
    mask,
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
  const { colors, isDark } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
          {required ? <Text style={[styles.required, { color: colors.danger }]}> *</Text> : null}
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
            {
              backgroundColor: editable === false ? colors.disabledBackground : colors.inputBackground,
              borderColor: hasError ? colors.danger : focused ? colors.inputFocus : colors.inputBorder,
              color: editable === false ? colors.disabledText : colors.text,
            },
            focused && !hasError && {
              boxShadow: `0px 0px 0px 3px ${colors.focusRing}`,
            },
            hasError && styles.inputError,
            leftAccessory != null && styles.inputWithLeftAccessory,
            rightAccessory != null && styles.inputWithAccessory,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={(text) => {
            onChangeText(mask ? applyMask(mask, text) : text);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          keyboardType={mask ? (maskKeyboardType(mask) as KeyboardTypeOptions) : keyboardType}
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

      {hasError ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
      {!hasError && helper ? (
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>{helper}</Text>
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
    marginBottom: spacing.sm,
  },
  required: {
    fontWeight: typography.weights.bold,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: borders.width.thin,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: sizes.inputHeight,
    fontSize: typography.sizes.md,
  },
  inputError: {
    borderWidth: borders.width.regular,
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
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
});
