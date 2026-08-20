/**
 * SmartGesso Mobile — Upload de fotos para a API (V3 §67).
 *
 * POST /uploads (multipart) — endpoint novo da API SmartGesso-API (criado em
 * paralelo). Envia o arquivo + contexto (entityType/entityId) e retorna a URL
 * pública do arquivo armazenado.
 *
 * Observação: o header `Content-Type: multipart/form-data` é definido
 * explicitamente para sobrescrever o default `application/json` do client
 * (axios v1 serializaria o FormData como JSON se o header continuasse JSON).
 * O boundary é adicionado pela camada de rede do React Native.
 */
import { getApiClient } from './client';
import type { PhotoAttachment } from '../../types/photo';

/** Tipos de entidade que recebem fotos (V3 §67). */
export type UploadEntityType = 'MEDICAO' | 'SERVICO' | 'CLIENTE';

/** Resposta do POST /uploads. */
export interface UploadResult {
  /** URL pública do arquivo armazenado. */
  url: string;
  /** Nome do arquivo no storage. */
  filename: string;
  /** Tamanho em bytes. */
  size: number;
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
   * Retorna { url, filename, size }.
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