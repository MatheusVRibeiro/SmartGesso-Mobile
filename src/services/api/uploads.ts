/**
 * SmartGesso Mobile — Upload e exibição autenticada de fotos (V3 §67, V5 ETAPA 10).
 *
 * POST /uploads (multipart) — envia o arquivo + contexto (entityType/entityId)
 * e retorna a URL do arquivo armazenado.
 *
 * V5 ETAPA 10 (backend commit 59ee7e7): `useStaticAssets` foi removido — a URL
 * retornada NÃO é mais pública. Fotos só são servidas via
 * GET /uploads/:subdir/:filename com JWT Bearer + validação de empresa.
 * Consequência: `<Image source={{ uri: url }} />` direto NÃO funciona (o RN
 * não envia o token). Use `authenticatedImageUri()` para resolver a URL em um
 * uri local temporário (cache) com o header Authorization anexado, ou o
 * componente `<AuthImage />` (src/components/ui/AuthImage.tsx).
 *
 * Observação: o header `Content-Type: multipart/form-data` é definido
 * explicitamente para sobrescrever o default `application/json` do client
 * (axios v1 serializaria o FormData como JSON se o header continuasse JSON).
 * O boundary é adicionado pela camada de rede do React Native.
 */
import { Platform } from 'react-native';
import { getApiClient } from './client';
import { SecureTokenStorage } from '../auth/SecureTokenStorage';
import type { PhotoAttachment } from '../../types/photo';

/** Tipos de entidade que recebem fotos (V3 §67). */
export type UploadEntityType = 'MEDICAO' | 'SERVICO' | 'CLIENTE' | 'PAGAMENTO' | 'DESPESA';

/** Resposta do POST /uploads. */
export interface UploadResult {
  /**
   * URL do arquivo armazenado (rota autenticada GET /uploads/:subdir/:filename
   * desde o commit 59ee7e7 do backend — requer JWT Bearer para exibir).
   */
  url: string;
  /** Nome do arquivo no storage. */
  filename: string;
  /** Tamanho em bytes. */
  size: number;
  /** ID do attachment criado (V5 ETAPA 10). */
  attachmentId?: string;
}

/**
 * Converte a PhotoAttachment (uri/name/type) no formato que o FormData do
 * React Native espera para arquivos locais.
 */
function toFormDataFile(photo: PhotoAttachment): Blob {
  return {
    uri: photo.uri,
    name: photo.name,
    type: photo.type,
  } as unknown as Blob;
}

/** Módulo tipado de uploads (V3 §67). */
export const uploadsService = {
  /**
   * POST /uploads — multipart com `file` + contexto (entityType/entityId).
   * Retorna { url, filename, size, attachmentId? }.
   */
  async uploadPhoto(
    photo: PhotoAttachment,
    entityType: UploadEntityType,
    entityId: string,
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', toFormDataFile(photo));
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    const response = await getApiClient().post<UploadResult>('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ─── Exibição autenticada (V5 ETAPA 10) ─────────────────────────────────────

/**
 * Detecta se a URL aponta para a rota autenticada de uploads do backend
 * (GET /uploads/:subdir/:filename). URLs locais (file://, data:) e de outros
 * hosts não são tratadas como autenticadas.
 */
export function isProtectedUploadUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('file://') || url.startsWith('data:')) return false;
  // Caminho relativo ou absoluto contendo o segmento /uploads/
  return /(^|\/\/[^/]+)\/uploads\//.test(url) || url.includes('/uploads/');
}

/**
 * Resolve a URL de uma imagem de upload em um uri exibível, anexando o JWT
 * Bearer (a URL pública foi desativada no backend — commit 59ee7e7).
 *
 * - Nativo (iOS/Android): baixa com `File.downloadFileAsync` (expo-file-system
 *   SDK 57) para o cacheDirectory e retorna `file://...`.
 * - Web: baixa com fetch + Authorization e retorna um blob: object URL.
 * - URL não autenticada (file://, data:, http público sem /uploads/): retorna
 *   a própria URL inalterada.
 * - Sem token: retorna a URL crua (a requisição falhará com 401 no backend —
 *   comportamento esperado para sessão expirada).
 *
 * Cache: o arquivo é gravado em `<cache>/smartgesso-uploads/<filename>` com
 * `idempotent: true` (re-download sobrescreve — evita erro de destino
 * existente e serve como cache simples por sessão).
 *
 * TODO(perf): invalidação de cache por attachmentId/ETag e limpeza de arquivos
 * órfãos do cache ficam para uma etapa dedicada.
 */
export async function authenticatedImageUri(url: string): Promise<string> {
  if (!isProtectedUploadUrl(url)) {
    return url;
  }

  const token = await SecureTokenStorage.getAccessToken();
  if (!token) {
    // Sem sessão: devolve a URL crua (backend responderá 401).
    return url;
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  if (Platform.OS === 'web') {
    // Web: fetch -> blob -> objectURL (URL.createObjectURL não existe no RN
    // nativo; o caminho nativo usa expo-file-system abaixo).
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Falha ao baixar imagem autenticada (HTTP ${response.status})`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  // Nativo: download direto para o cache com header Authorization.
  // Require lazy (NÃO import estático): expo-file-system carrega o módulo
  // nativo (ExpoModules EventEmitter) que não está disponível em todos os
  // ambientes de teste — um import estático quebraria suites que só precisam
  // do uploadPhoto (ex.: Login → ui barrel → AuthImage → uploads). O require
  // condicional com Platform.OS é estático o suficiente para o Metro resolver
  // e empacotar o módulo no bundle nativo.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Directory, File, Paths } = require('expo-file-system') as typeof import('expo-file-system');

  const filename = url.split('/').pop() || `upload-${Date.now()}.jpg`;
  const cacheDir = new Directory(Paths.cache, 'smartgesso-uploads');
  if (!cacheDir.exists) {
    cacheDir.create({ intermediates: true, idempotent: true });
  }
  const target = new File(cacheDir, filename);
  const downloaded = await File.downloadFileAsync(url, target, {
    headers,
    idempotent: true,
  });
  return downloaded.uri;
}