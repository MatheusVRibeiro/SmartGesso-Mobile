/**
 * SmartGesso Mobile — Persistência local de fotos (V3 §67).
 *
 * A API ainda não expõe endpoint de upload (verificado 2026-08-19: nenhum
 * módulo em SmartGesso-API/src/modules trata multipart/upload). Enquanto isso,
 * as fotos são copiadas para o diretório de documentos do app:
 *
 *   <document>/smartgesso-fotos/<contexto>/<nome>
 *
 * Usa a API nova do expo-file-system (SDK 57): File / Directory / Paths.
 */
import { Directory, File, Paths } from 'expo-file-system';
import type { PhotoAttachment } from '../../types/photo';

/** Diretório raiz das fotos do app (documentDirectory). */
const PHOTOS_ROOT = 'smartgesso-fotos';

/**
 * Copia a foto (uri de cache do picker) para o armazenamento permanente do app.
 * Retorna a URI final persistida.
 */
export async function savePhotoLocally(
  photo: PhotoAttachment,
  context: string,
): Promise<string> {
  const dir = new Directory(Paths.document, PHOTOS_ROOT, context);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }

  const source = new File(photo.uri);
  const target = new File(dir, photo.name);
  if (target.exists) {
    target.delete();
  }
  await source.copy(target);
  return target.uri;
}

/** Nome de arquivo único para uma foto (timestamp). */
export function buildPhotoName(prefix: string, ext = 'jpg'): string {
  return `foto-${prefix}-${Date.now()}.${ext}`;
}
