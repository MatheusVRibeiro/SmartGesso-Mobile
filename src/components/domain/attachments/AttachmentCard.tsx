/**
 * SmartGesso Mobile — AttachmentCard.
 *
 * Exibe um anexo (thumbnail, nome, tamanho e estado) com botões de remover
 * e, opcionalmente, tentar novamente (quando o estado é `failed`).
 */
import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borders, colors, radius, sizes, spacing, typography } from '../../../theme';
import type { Attachment, AttachmentStatus } from './types';

export interface AttachmentCardProps {
  /** Anexo a ser exibido. */
  attachment: Attachment;
  /** Chamado ao remover o anexo. */
  onRemove: (attachment: Attachment) => void;
  /** Chamado ao tentar reenviar (aparece apenas quando status === 'failed'). */
  onRetry?: (attachment: Attachment) => void;
  /** Estilo extra para o card. */
  style?: ViewStyle;
  /** testID para testes. */
  testID?: string;
}

const STATUS_LABELS: Record<AttachmentStatus, string> = {
  pending: 'Pendente',
  uploading: 'Enviando',
  uploaded: 'Enviado',
  failed: 'Falhou',
};

const STATUS_COLORS: Record<AttachmentStatus, string> = {
  pending: colors.textSecondary,
  uploading: colors.info,
  uploaded: colors.success,
  failed: colors.danger,
};

const STATUS_ICONS: Record<AttachmentStatus, React.ComponentProps<typeof Ionicons>['name']> = {
  pending: 'time-outline',
  uploading: 'sync-outline',
  uploaded: 'checkmark-circle',
  failed: 'alert-circle',
};

/** Formata bytes para exibição amigável (B, KB, MB, GB). */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * AttachmentCard reutilizável: mostra thumbnail, metadados e ações.
 * O estado visual (ícone + cor) reflete o `status` do anexo.
 */
export function AttachmentCard({
  attachment,
  onRemove,
  onRetry,
  style,
  testID,
}: AttachmentCardProps) {
  const statusLabel = STATUS_LABELS[attachment.status];
  const statusColor = STATUS_COLORS[attachment.status];
  const statusIcon = STATUS_ICONS[attachment.status];
  const isFailed = attachment.status === 'failed';
  const isUploading = attachment.status === 'uploading';

  return (
    <View style={[styles.card, style]} testID={testID}>
      <Image
        source={{ uri: attachment.uri }}
        style={styles.thumbnail}
        resizeMode="cover"
        accessibilityLabel={`Miniatura de ${attachment.name}`}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {attachment.name}
        </Text>
        <Text style={styles.size}>{formatFileSize(attachment.size)}</Text>
        <View style={styles.statusRow}>
          <Ionicons
            name={statusIcon}
            size={sizes.icon.sm}
            color={statusColor}
            accessibilityElementsHidden
          />
          <Text style={[styles.status, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {isFailed && onRetry && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Tentar novamente ${attachment.name}`}
          onPress={() => onRetry(attachment)}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          testID={`retry-${attachment.id}`}
        >
          <Ionicons
            name="reload-outline"
            size={sizes.icon.sm}
            color={colors.primary}
            accessibilityElementsHidden
          />
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remover ${attachment.name}`}
        onPress={() => onRemove(attachment)}
        style={({ pressed }) => [
          styles.actionButton,
          styles.actionButtonDanger,
          pressed && styles.actionButtonPressed,
        ]}
        testID={`remove-${attachment.id}`}
      >
        <Ionicons
          name="trash-outline"
          size={sizes.icon.sm}
          color={colors.danger}
          accessibilityElementsHidden
        />
      </Pressable>
    </View>
  );
}

export default AttachmentCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  size: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  status: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  actionButton: {
    padding: spacing.xs,
  },
  actionButtonDanger: {
    // estilo base — a cor vem do ícone
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
});
