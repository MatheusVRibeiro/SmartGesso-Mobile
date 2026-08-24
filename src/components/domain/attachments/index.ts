/**
 * SmartGesso Mobile — Componentes de domínio de anexos.
 *
 * Barrel export: ponto único de importação para os componentes de anexos.
 */
export { AttachmentPicker } from './AttachmentPicker';
export type { AttachmentPickerProps, PickerState } from './AttachmentPicker';

export { AttachmentCard } from './AttachmentCard';
export type { AttachmentCardProps } from './AttachmentCard';

export { AttachmentGrid } from './AttachmentGrid';
export type { AttachmentGridProps } from './AttachmentGrid';

export type {
  Attachment,
  AttachmentStatus,
  PickedAttachment,
} from './types';
