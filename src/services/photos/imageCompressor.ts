import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
}

export interface CompressOptions {
  maxWidth?: number;
  quality?: number;
}

/**
 * Comprime e redimensiona imagens de forma eficiente para upload rápido
 * em redes móveis (3G/4G/5G) na obra, reduzindo fotos pesadas de ~5MB para ~200KB.
 */
export async function compressImage(
  uri: string,
  options: CompressOptions = {}
): Promise<CompressedImageResult> {
  const maxWidth = options.maxWidth ?? 1280;
  const quality = options.quality ?? 0.75;

  if (Platform.OS === 'web') {
    return { uri, width: 1280, height: 720 };
  }

  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
    };
  } catch (error) {
    console.warn('[ImageCompressor] Falha ao comprimir imagem, usando original:', error);
    return { uri, width: 1280, height: 720 };
  }
}
