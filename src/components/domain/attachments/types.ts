/**
 * SmartGesso Mobile — Tipos de anexos.
 *
 * Componentes reutilizáveis para anexar fotos em formulários.
 * O AttachmentPicker captura o arquivo; a tela (parent) é responsável por
 * criar o Attachment com id, name e status, e por orquestrar o upload.
 */

/** Estados de um anexo no ciclo de vida de upload. */
export type AttachmentStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

/** Dados capturados pelo AttachmentPicker (antes de ser persistido). */
export interface PickedAttachment {
  /** URI local do arquivo (file://). */
  uri: string;
  /** MIME type, ex.: image/jpeg */
  mimeType: string;
  /** Tamanho em bytes. */
  size: number;
}

/** Anexo completo exibido no grid. */
export interface Attachment {
  /** ID único (usado como key do FlatList). */
  id: string;
  /** URI local do arquivo (file://). */
  uri: string;
  /** Nome amigável exibido ao usuário. */
  name: string;
  /** MIME type, ex.: image/jpeg */
  mimeType: string;
  /** Tamanho em bytes. */
  size: number;
  /** Estado atual no ciclo de upload. */
  status: AttachmentStatus;
}
