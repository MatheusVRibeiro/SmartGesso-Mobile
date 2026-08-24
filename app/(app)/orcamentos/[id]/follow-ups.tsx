import React, { useState } from 'react';
import { FlatList, Modal, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../../src/components/ui/AppButton';
import { AppCard } from '../../../../src/components/ui/AppCard';
import { AppInput } from '../../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../../src/components/ui/AppSnackbar';
import { ErrorState } from '../../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../../src/components/ui/StatusBadge';
import { quoteFollowUpsService } from '../../../../src/services/api/quoteFollowUps';
import { colors, radius, spacing, typography } from '../../../../src/theme';
import type { QuoteFollowUp, QuoteFollowUpCreateRequest } from '../../../../src/types/followUp';

// ─── Constants ──────────────────────────────────────────────────────────────

const FOLLOW_UP_TYPE_LABELS: Record<QuoteFollowUp['type'], string> = {
  CALL: 'Ligação',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  OTHER: 'Outro',
};

const FOLLOW_UP_STATUS_BADGE: Record<
  QuoteFollowUp['status'],
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDING: { variant: 'warning', label: 'Pendente' },
  DONE: { variant: 'active', label: 'Concluído' },
  CANCELLED: { variant: 'cancelled', label: 'Cancelado' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function FollowUpsScreen() {
  const { id: quoteId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFollowUpType, setNewFollowUpType] = useState<QuoteFollowUp['type']>('CALL');
  const [newFollowUpNotes, setNewFollowUpNotes] = useState('');
  const [newFollowUpScheduledAt, setNewFollowUpScheduledAt] = useState('');
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: AppSnackbarType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // ─── Queries ────────────────────────────────────────────────────────────

  const { data: followUps, isLoading, error, refetch } = useQuery({
    queryKey: ['quoteFollowUps', quoteId],
    queryFn: () => quoteFollowUpsService.listByQuote(quoteId!),
    enabled: !!quoteId,
  });

  // ─── Mutations ──────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (data: QuoteFollowUpCreateRequest) =>
      quoteFollowUpsService.create(quoteId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteFollowUps', quoteId] });
      setShowCreateModal(false);
      resetCreateForm();
      setSnackbar({ visible: true, message: 'Follow-up criado com sucesso!', type: 'success' });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Erro ao criar follow-up', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'DONE' | 'CANCELLED' }) =>
      quoteFollowUpsService.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteFollowUps', quoteId] });
      setSnackbar({ visible: true, message: 'Follow-up atualizado!', type: 'success' });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Erro ao atualizar follow-up', type: 'error' });
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────

  const resetCreateForm = () => {
    setNewFollowUpType('CALL');
    setNewFollowUpNotes('');
    setNewFollowUpScheduledAt('');
  };

  const handleCreate = () => {
    if (!newFollowUpType) return;
    createMutation.mutate({
      type: newFollowUpType,
      notes: newFollowUpNotes || undefined,
      scheduledAt: newFollowUpScheduledAt || undefined,
    });
  };

  const handleMarkAsDone = (id: string) => {
    updateMutation.mutate({ id, status: 'DONE' });
  };

  const handleCancel = (id: string) => {
    updateMutation.mutate({ id, status: 'CANCELLED' });
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  const renderFollowUpItem = ({ item }: { item: QuoteFollowUp }) => (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardType}>
          <Ionicons
            name={item.type === 'CALL' ? 'call' : item.type === 'WHATSAPP' ? 'logo-whatsapp' : item.type === 'EMAIL' ? 'mail' : 'chatbubble'}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.cardTypeText}>{FOLLOW_UP_TYPE_LABELS[item.type]}</Text>
        </View>
        <StatusBadge
          status={FOLLOW_UP_STATUS_BADGE[item.status].variant}
          label={FOLLOW_UP_STATUS_BADGE[item.status].label}
          size="sm"
        />
      </View>
      
      {item.notes && (
        <Text style={styles.cardNotes}>{item.notes}</Text>
      )}
      
      {item.scheduledAt && (
        <Text style={styles.cardScheduled}>
          Agendado: {new Date(item.scheduledAt).toLocaleDateString('pt-BR')}
        </Text>
      )}
      
      {item.doneAt && (
        <Text style={styles.cardDoneAt}>
          Concluído: {new Date(item.doneAt).toLocaleDateString('pt-BR')}
        </Text>
      )}
      
      {item.status === 'PENDING' && (
        <View style={styles.cardActions}>
          <AppButton
            title="Concluir"
            variant="primary"
            size="sm"
            onPress={() => handleMarkAsDone(item.id)}
            loading={updateMutation.isPending}
          />
          <AppButton
            title="Cancelar"
            variant="outline"
            size="sm"
            onPress={() => handleCancel(item.id)}
            loading={updateMutation.isPending}
          />
        </View>
      )}
    </AppCard>
  );

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Erro ao carregar follow-ups"
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Follow-ups do Orçamento</Text>
        <AppButton
          title="Novo Follow-up"
          variant="primary"
          size="sm"
          onPress={() => setShowCreateModal(true)}
        />
      </View>

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={followUps?.data || []}
          keyExtractor={(item) => item.id}
          renderItem={renderFollowUpItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhum follow-up registrado</Text>
            </View>
          }
        />
      )}

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Follow-up</Text>
            
            <Text style={styles.label}>Tipo *</Text>
            <View style={styles.typeSelector}>
              {(['CALL', 'WHATSAPP', 'EMAIL', 'OTHER'] as QuoteFollowUp['type'][]).map((type) => (
                <AppButton
                  key={type}
                  title={FOLLOW_UP_TYPE_LABELS[type]}
                  variant={newFollowUpType === type ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setNewFollowUpType(type)}
                  style={styles.typeButton}
                />
              ))}
            </View>

            <AppInput
              label="Notas"
              value={newFollowUpNotes}
              onChangeText={setNewFollowUpNotes}
              placeholder="Observações sobre o follow-up"
              multiline
              numberOfLines={3}
            />

            <AppInput
              label="Data Agendada"
              value={newFollowUpScheduledAt}
              onChangeText={setNewFollowUpScheduledAt}
              placeholder="DD/MM/AAAA"
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
              />
              <AppButton
                title="Criar"
                variant="primary"
                onPress={handleCreate}
                loading={createMutation.isPending}
              />
            </View>
          </View>
        </View>
      </Modal>

      <AppSnackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={() => setSnackbar({ ...snackbar, visible: false })}
      />
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTypeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  cardNotes: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardScheduled: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  cardDoneAt: {
    fontSize: typography.sizes.xs,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});