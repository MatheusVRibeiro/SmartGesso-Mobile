import { useAppTheme } from '../../theme/ThemeProvider';
/**
 * SmartGesso Mobile — PhotoPicker (V3 §67).
 *
 * Captura foto real: câmera ou galeria (expo-image-picker), compressão JPEG
 * (expo-image-manipulator: lado maior ≤ 1600px, qualidade 0.7) e preview com
 * opções de trocar/remover. Enquanto a API não tem endpoint de upload, o
 * componente avisa que a foto fica salva no dispositivo — a persistência em si
 * é responsabilidade da tela (src/services/photos/photoStorage).
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { borders, colors, radius, sizes, spacing, typography } from '../../theme';
import { buildPhotoName } from '../../services/photos/photoStorage';
import type { PhotoAttachment } from '../../types/photo';

/** Lado maior máximo após compressão (px). */
const MAX_LONG_EDGE = 1600;
/** Qualidade JPEG da compressão (0–1). */
const JPEG_COMPRESSION = 0.7;

type PhotoSource = 'camera' | 'library';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 1,
};

interface PhotoPickerProps {
  label: string;
  value: PhotoAttachment | null;
  onChange: (photo: PhotoAttachment | null) => void;
  /** Texto auxiliar exibido no box vazio. */
  hint?: string;
  accessibilityLabel?: string;
}

/** Dimensões da imagem via Image.getSize (promise wrapper). */
function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

/**
 * Comprime a foto: reduz o lado maior para no máx. 1600px (mantendo a
 * proporção) e re-encoda em JPEG com qualidade 0.7. Imagens menores só
 * re-encodam (sem upscale).
 */
async function compressPhoto(uri: string): Promise<string> {
  const { width, height } = await getImageSize(uri);
  const longEdge = Math.max(width, height);
  const actions: ImageManipulator.Action[] =
    longEdge > MAX_LONG_EDGE
      ? [
          {
            resize:
              longEdge === width
                ? { width: MAX_LONG_EDGE }
                : { height: MAX_LONG_EDGE },
          },
        ]
      : [];
  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: JPEG_COMPRESSION,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
}

/**
 * PhotoPicker controlado: `value`/`onChange` seguem o padrão dos inputs RHF.
 * A tela decide quando persistir (ex.: no submit do formulário).
 */
export function PhotoPicker({

  label,
  value,
  onChange,
  hint = 'Câmera ou galeria',
  accessibilityLabel,
}: PhotoPickerProps) {
  const [picking, setPicking] = useState(false);

  async function pick(source: PhotoSource) {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permissão necessária',
        source === 'camera'
          ? 'Permita o acesso à câmera para tirar a foto.'
          : 'Permita o acesso à galeria para escolher a foto.',
      );
      return;
    }

    setPicking(true);
    try {
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      const asset = result.assets[0];
      const compressedUri = await compressPhoto(asset.uri);
      onChange({
        uri: compressedUri,
        name: buildPhotoName('app'),
        type: 'image/jpeg',
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a foto.');
    } finally {
      setPicking(false);
    }
  }

  function showSourceOptions() {
    Alert.alert('Adicionar foto', 'Escolha a origem da foto:', [
      { text: 'Câmera', onPress: () => pick('camera') },
      { text: 'Galeria', onPress: () => pick('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  const pickerAccessibilityLabel = accessibilityLabel ?? label;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {value ? (
        <View>
          <Image
            source={{ uri: value.uri }}
            style={styles.preview}
            resizeMode="cover"
            accessibilityLabel={`${pickerAccessibilityLabel} selecionada`}
          />
          <Text style={styles.localNote}>
            Salva no dispositivo — upload na próxima versão.
          </Text>
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Trocar ${pickerAccessibilityLabel}`}
              disabled={picking}
              onPress={showSourceOptions}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonOutline,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={sizes.icon.sm}
                color={colors.primary}
                accessibilityElementsHidden
              />
              <Text style={styles.actionButtonOutlineText}>
                {picking ? 'Abrindo...' : 'Trocar'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remover ${pickerAccessibilityLabel}`}
              disabled={picking}
              onPress={() => onChange(null)}
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonDanger,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={sizes.icon.sm}
                color={colors.danger}
                accessibilityElementsHidden
              />
              <Text style={styles.actionButtonDangerText}>Remover</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Adicionar ${pickerAccessibilityLabel}`}
          disabled={picking}
          onPress={showSourceOptions}
          style={({ pressed }) => [
            styles.addBox,
            pressed && styles.addBoxPressed,
          ]}
        >
          {picking ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons
              name="camera-outline"
              size={sizes.icon.xl}
              color={colors.primary}
              accessibilityElementsHidden
            />
          )}
          <Text style={styles.addLabel}>
            {picking ? 'Abrindo...' : 'Adicionar foto'}
          </Text>
          <Text style={styles.addHint}>{hint}</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addBox: {
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
  addBoxPressed: {
    backgroundColor: colors.primarySoft,
  },
  addLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  addHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  localNote: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: sizes.buttonHeight.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: borders.width.thin,
  },
  actionButtonOutline: {
    borderColor: colors.primary,
  },
  actionButtonDanger: {
    borderColor: colors.danger,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonOutlineText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  actionButtonDangerText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.danger,
  },
});
const styles = createStyles(colors, false);
