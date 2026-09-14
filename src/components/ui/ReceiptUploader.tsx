/**
 * SmartGesso Mobile — Componente de upload de comprovante (Fase 6).
 *
 * Exibe um botão para adicionar comprovante via ImagePicker.
 * Se já existir um receiptUrl, mostra preview clicável.
 *
 * V5 ETAPA 10: a URL de /uploads não é mais pública (backend commit 59ee7e7) —
 * o preview usa <AuthImage /> (baixa com JWT Bearer) e o "Ver comprovante"
 * compartilha o arquivo autenticado via expo-sharing (Linking.openURL abriria
 * a rota autenticada sem token e falharia com 401).
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { uploadsService, authenticatedImageUri } from '../../services/api/uploads';
import type { UploadEntityType } from '../../services/api/uploads';
import type { PhotoAttachment } from '../../types/photo';
import { safeErrorMessage } from '../../utils/secureLog';
import { radius, spacing, typography } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { ActivePalette } from '../../theme/ThemeProvider';
import { AuthImage } from './AuthImage';

export interface ReceiptUploaderProps {
  /** URL atual do comprovante (se já existir). */
  receiptUrl?: string | null;
  /** Tipo de entidade (PAYMENT ou EXPENSE). */
  entityType: UploadEntityType;
  /** ID da entidade. */
  entityId: string;
  /** Callback chamado após upload bem-sucedido, com a nova URL. */
  onUploaded: (url: string) => void;
  /** Desabilitar interação (ex.: durante loading). */
  disabled?: boolean;
  /** Estilo customizado. */
  style?: ViewStyle;
}

/**
 * Converte o resultado do ImagePicker em PhotoAttachment.
 */
function imagePickerToPhoto(
  result: ImagePicker.ImagePickerResult,
): PhotoAttachment | null {
  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  const asset = result.assets[0];
  const uri = asset.uri;
  const name = uri.split('/').pop() || 'comprovante.jpg';
  const type = asset.mimeType || 'image/jpeg';
  return { uri, name, type };
}

export function ReceiptUploader({
  receiptUrl,
  entityType,
  entityId,
  onUploaded,
  disabled = false,
  style,
}: ReceiptUploaderProps) {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [uploading, setUploading] = useState(false);

  async function handlePickImage() {
    try {
      // Solicitar permissão da câmera
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.',
        );
        return;
      }

      // Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      const photo = imagePickerToPhoto(result);
      if (!photo) return;

      setUploading(true);
      try {
        const uploadResult = await uploadsService.uploadPhoto(
          photo,
          entityType,
          entityId,
        );
        onUploaded(uploadResult.url);
      } catch (error) {
        // safeErrorMessage: erros do Axios carregam config.headers.Authorization
        // (Bearer token) — nunca logar o objeto inteiro.
        console.error('Erro ao fazer upload:', safeErrorMessage(error));
        Alert.alert('Erro', 'Não foi possível fazer upload do comprovante.');
      } finally {
        setUploading(false);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', safeErrorMessage(error));
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  async function handlePreview() {
    if (!receiptUrl) return;
    try {
      // A URL é autenticada (sem token o backend responde 401): baixa o
      // arquivo localmente e compartilha via expo-sharing. Fallback web:
      // abre em nova aba (blob: não navega via Linking).
      const localUri = await authenticatedImageUri(receiptUrl);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, { mimeType: 'image/jpeg' });
        return;
      }
      await Linking.openURL(localUri);
    } catch (error) {
      console.error('Erro ao abrir comprovante:', safeErrorMessage(error));
      Alert.alert('Erro', 'Não foi possível abrir o comprovante.');
    }
  }

  // Se já existe comprovante, mostra preview clicável
  if (receiptUrl) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.label}>Comprovante</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver comprovante"
          onPress={handlePreview}
          style={styles.previewContainer}
        >
          <AuthImage
            uri={receiptUrl}
            style={styles.previewImage}
            resizeMode="cover"
            accessibilityLabel="Comprovante"
          />
          <View style={styles.previewOverlay}>
            <Ionicons name="eye-outline" size={24} color={colors.textOnPrimary} />
            <Text style={styles.previewText}>Ver comprovante</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // Sem comprovante: mostra botão de upload
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Comprovante</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar comprovante"
        onPress={handlePickImage}
        disabled={disabled || uploading}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
          (disabled || uploading) && styles.addButtonDisabled,
        ]}
      >
        {uploading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Ionicons name="camera-outline" size={24} color={colors.primary} />
        )}
        <Text style={styles.addButtonText}>
          {uploading ? 'Enviando...' : 'Adicionar Comprovante'}
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.transparent,
  },
  addButtonPressed: {
    backgroundColor: colors.primarySoft,
  },
  addButtonDisabled: {
    borderColor: colors.disabledText,
  },
  addButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  previewContainer: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textOnPrimary,
  },
});
const styles = createStyles({} as any, false);
