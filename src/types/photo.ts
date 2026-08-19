/**
 * SmartGesso Mobile — Anexo de foto (V3 §67).
 *
 * Foto capturada pela câmera ou importada da galeria, com compressão aplicada.
 * Enquanto a API não tem endpoint de upload, a foto é salva localmente no
 * dispositivo (expo-file-system) e o upload fica para a próxima versão.
 */
export interface PhotoAttachment {
  /** URI local do arquivo (file://). */
  uri: string;
  /** Nome do arquivo, ex.: foto-medicao-1724....jpg */
  name: string;
  /** MIME type, ex.: image/jpeg */
  type: string;
}
