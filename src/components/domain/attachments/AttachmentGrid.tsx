/**
 * SmartGesso Mobile — AttachmentGrid.
 *
 * Grid reutilizável de anexos: renderiza um AttachmentPicker no topo e uma
 * FlatList de AttachmentCard. Orquestra os callbacks onAdd, onRemove e
 * onRetry, deixando a tela responsável apenas por manter a lista de
 * Attachments e persistir o upload.
 */
import React from 'react';
import { FlatList, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sizes, spacing, typography } from '../../../theme';
import { useAppTheme } from '../../../theme/ThemeProvider';
import type { ActivePalette } from '../../../theme/ThemeProvider';
import { AttachmentCard } from './AttachmentCard';
import { AttachmentPicker } from './AttachmentPicker';
import type { Attachment, PickedAttachment } from './types';

export interface AttachmentGridProps {
  /** Lista de anexos exibidos no grid. */
  attachments: Attachment[];
  /** Chamado quando um novo anexo é capturado pelo picker. */
  onAdd: (attachment: PickedAttachment) => void;
  /** Chamado ao remover um anexo. */
  onRemove: (attachment: Attachment) => void;
  /** Chamado ao tentar reenviar um anexo que falhou. */
  onRetry?: (attachment: Attachment) => void;
  /** Rótulo do botão de adicionar. */
  addLabel?: string;
  /** Texto exibido quando não há anexos. */
  emptyLabel?: string;
  /** Estilo extra para o container. */
  style?: ViewStyle;
  /** testID para testes. */
  testID?: string;
}

/**
 * AttachmentGrid: picker + FlatList de cards.
 * O picker sempre está visível no topo; a lista abaixo mostra os anexos
 * existentes com suas ações (remover / tentar novamente).
 */
export function AttachmentGrid({
  attachments,
  onAdd,
  onRemove,
  onRetry,
  addLabel = 'Adicionar anexo',
  emptyLabel = 'Nenhum anexo',
  style,
  testID,
}: AttachmentGridProps) {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const renderItem = ({ item }: { item: Attachment }) => (
    <AttachmentCard
      attachment={item}
      onRemove={onRemove}
      onRetry={onRetry}
    />
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      <AttachmentPicker
        label={addLabel}
        onPick={onAdd}
        style={styles.picker}
        testID="attachment-picker"
      />
      <FlatList
        data={attachments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty} testID="empty-state">
            <Ionicons
              name="images-outline"
              size={sizes.icon.xl * 1.5}
              color={colors.textLight}
            />
            <Text style={styles.emptyText}>{emptyLabel}</Text>
          </View>
        }
      />
    </View>
  );
}

export default AttachmentGrid;

const createStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  picker: {
    marginBottom: 0,
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

const styles = createStyles({} as any, false);
