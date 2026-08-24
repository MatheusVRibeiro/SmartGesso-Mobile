/**
 * SmartGesso Mobile — AttachmentPicker.
 *
 * Botão reutilizável que abre o ImagePicker (expo-image-picker) para escolher
 * uma imagem da galeria. Ao selecionar, dispara `onPick` com
 * `{ uri, mimeType, size }`.
 *
 * Estados internos (ciclo de vida do picker):
 * - `ready`     — pronto para abrir o seletor
 * - `uploading` — enviando/processando (mostra loading)
 * - `uploaded`  — foto capturada com sucesso
 * - `failed`    — erro ao capturar
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { borders, colors, radius, sizes, spacing, typography } from '../../theme';
import type { PickedAttachment } from './types';

/** Estados do picker (ciclo de vida interno). */
export type PickerState = 'ready' | 'uploading' | 'uploaded' | 'failed';

export interface AttachmentPickerProps {
  /** Chamado com os dados da foto capturada. */
  onPick: (attachment: PickedAttachment) => void;
  /** Rótulo do botão. */
  label?: string;
  /** Texto auxiliar exibido abaixo do rótulo. */
  hint?: string;
  /** Desabilita o botão. */
  disabled?: boolean;
  /** Estilo extra para o container. */
  style?: ViewStyle;
  /** testID para testes. */
  testID?: string;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 1,
  allowsEditing: false,
};

/**
 * AttachmentPicker controlado: o `onPick` entrega os dados da foto e o
 * componente pai decide como persistir (ex.: criar Attachment e fazer upload).
 */
export function AttachmentPicker({
  onPick,
  label = 'Anexar foto',
  hint = 'Toque para escolher na galeria',
  disabled = false,
  style,
  testID,
}: AttachmentPickerProps) {
  const [state, setState] = useState<PickerState>('ready');

  async function pick() {
    setState('uploading');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à galeria para anexar fotos.',
        );
        setState('failed');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (result.canceled || !result.assets || result.assets.length === 0) {
        setState('ready');
        return;
      }

      const asset = result.assets[0];
      onPick({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        size: asset.fileSize ?? 0,
      });
      setState('uploaded');
    } catch {
      setState('failed');
      Alert.alert('Erro', 'Não foi possível anexar a foto.');
    }
  }

  const isBusy = state === 'uploading';
  const isDisabled = disabled || isBusy;

  const iconName =
    state === 'uploaded'
      ? 'checkmark-circle'
      : state === 'failed'
        ? 'alert-circle'
        : 'image-outline';
  const iconColor =
    state === 'uploaded'
      ? colors.success
      : state === 'failed'
        ? colors.danger
        : colors.primary;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: isBusy }}
        disabled={isDisabled}
        onPress={pick}
        style={({ pressed }) => [
          styles.pickerBox,
          pressed && !isDisabled && styles.pickerBoxPressed,
          isDisabled && styles.pickerBoxDisabled,
        ]}
      >
        {isBusy ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons
            name={iconName}
            size={sizes.icon.xl}
            color={iconColor}
            accessibilityElementsHidden
          />
        )}
        <Text style={styles.pickerLabel}>
          {state === 'uploading' ? 'Anexando...' : label}
        </Text>
        {state !== 'uploading' && (
          <Text style={styles.pickerHint}>{hint}</Text>
        )}
      </Pressable>
    </View>
  );
}

export default AttachmentPicker;
export { AttachmentPicker };

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  pickerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    borderRadius: radius.md,
    borderWidth: borders.width.thin,
    borderStyle: 'dashed',
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
  },
  pickerBoxPressed: {
    backgroundColor: colors.primarySoft,
  },
  pickerBoxDisabled: {
    opacity: 0.5,
  },
  pickerLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  pickerHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
});
