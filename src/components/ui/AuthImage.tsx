/**
 * SmartGesso Mobile — Image com autenticação Bearer (V5 ETAPA 10).
 *
 * Desde o commit 59ee7e7 do backend, as URLs de /uploads não são mais públicas:
 * fotos só são servidas via GET /uploads/:subdir/:filename com JWT Bearer.
 * O <Image> do React Native não envia headers — usar este componente no lugar
 * de <Image source={{ uri: uploadUrl }} />.
 *
 * Fluxo:
 * 1. Se a URL não é de /uploads (file://, data:, http público), renderiza
 *    direto — sem custo de rede extra.
 * 2. Se é protegida, resolve um uri local temporário via
 *    `authenticatedImageUri()` (expo-file-system no nativo, blob: na web)
 *    e renderiza o resultado.
 *
 * Estados: placeholder (ActivityIndicator) enquanto baixa; fallback
 * (Ionicons image-outline) em caso de falha (401, rede, etc.).
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authenticatedImageUri, isProtectedUploadUrl } from '../../services/api/uploads';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { ActivePalette } from '../../theme/ThemeProvider';

export interface AuthImageProps {
  /** URL da imagem (pode ser uma URL protegida de /uploads ou qualquer uri). */
  uri: string;
  /** Estilo do <Image> interno (tamanho é obrigatório via style do container). */
  style?: ImageStyle;
  /** Estilo do container (fallback/placeholder herdam o tamanho daqui). */
  containerStyle?: ViewStyle;
  /** accessibilityLabel repassado ao <Image>. */
  accessibilityLabel?: string;
  /** resizeMode do <Image>. */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export function AuthImage({
  uri,
  style,
  containerStyle,
  accessibilityLabel,
  resizeMode = 'cover',
}: AuthImageProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const isProtected = isProtectedUploadUrl(uri);

  useEffect(() => {
    if (!isProtected) {
      // URL não autenticada: exibe direto, sem resolver.
      setResolvedUri(uri);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setResolvedUri(null);
    setFailed(false);

    authenticatedImageUri(uri)
      .then((localUri) => {
        if (!cancelled) setResolvedUri(localUri);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('[AuthImage] falha ao resolver imagem autenticada:', error);
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uri, isProtected]);

  if (failed) {
    return (
      <View style={[styles.fallback, containerStyle]} testID="auth-image-fallback">
        <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
      </View>
    );
  }

  if (!resolvedUri) {
    return (
      <View style={[styles.placeholder, containerStyle]} testID="auth-image-loading">
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolvedUri }}
      style={style}
      resizeMode={resizeMode}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailed(true)}
    />
  );
}

const createStyles = (colors: ActivePalette) =>
  StyleSheet.create({
    placeholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
  });

export default AuthImage;
