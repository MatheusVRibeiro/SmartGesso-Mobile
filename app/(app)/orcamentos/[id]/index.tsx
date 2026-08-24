import React, { useState } from 'react';
import { Alert, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../../src/components/ui/AppButton';
import { AppCard } from '../../../../src/components/ui/AppCard';
import { AppInput } from '../../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../../src/components/ui/AppSnackbar';
import { ConfirmDialog } from '../../../../src/components/ui/ConfirmDialog';
import { ErrorState } from '../../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../../src/services/api/client';
import { quotesService } from '../../../../src/services/api/quotes';
import { useSessionStore } from '../../../../src/store/useSessionStore';
import { colors, radius, shadows, sizes, spacing, typography } from '../../../../src/theme';
import { formatCurrency, formatNumber, formatQuoteCode } from '../../../../src/utils/format';
import type { QuoteStatus } from '../../../../src/types/quote';
import type { ApproveQuoteResponse } from '../../../../src/types/quote';

// ─── Helpers ────────────────────────────────────────────────────────────────

const QUOTE_STATUS_BADGE: Record<
  QuoteStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  RASCUNHO: { variant: 'expired', label: 'Rascunho' },
  PRONTO_PARA_ENVIAR: { variant: 'info', label: 'Pronto para enviar' },
  ENVIADO: { variant: 'warning', label: 'Enviado' },
  AGUARDANDO_APROVACAO: { variant: 'warning', label: 'Aguardando aprovação' },
  APROVADO: { variant: 'active', label: 'Aprovado' },
  REJEITADO: { variant: 'cancelled', label: 'Rejeitado' },
  VENCIDO: { variant: 'expired', label: 'Vencido' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

/** dd/mm — datas da timeline do orçamento (V3 §40). */
function formatDayMonth(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Status que encerram o ciclo comercial — nunca exibem badge de vencimento. */
const CLOSED_QUOTE_STATUSES: ReadonlySet<QuoteStatus> = new Set([
  'APROVADO',
  'CANCELADO',
]);

/**
 * Orçamento vencido (V3 §39): status VENCIDO pela API ou validade ultrapassada
 * com ciclo comercial ainda aberto (não aprovado nem cancelado).
 */
function isQuoteExpired(quote: {
  status: QuoteStatus;
  validUntil?: string | null;
}): boolean {
  if (quote.status === 'VENCIDO') return true;
  if (!quote.validUntil) return false;
  if (CLOSED_QUOTE_STATUSES.has(quote.status)) return false;
  const validUntil = new Date(quote.validUntil);
  if (Number.isNaN(validUntil.getTime())) return false;
  validUntil.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return validUntil.getTime() < today.getTime();
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalheOrcamentoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const quoteId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [refreshing, setRefreshing] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmApproveVisible, setConfirmApproveVisible] = useState(false);

  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const quoteQuery = useQuery({
    queryKey: ['company', companyId, 'quotes', quoteId],
    queryFn: () => quotesService.getById(quoteId as string),
    enabled: Boolean(companyId && quoteId),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await quoteQuery.refetch();
    setRefreshing(false);
  };

  const generateVersionMutation = useMutation({
    mutationFn: () => quotesService.generateVersion(quoteId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      setSnackbar({ type: 'success', message: 'Nova versão gerada com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => quotesService.remove(quoteId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Orçamento excluído com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => quotesService.approve(quoteId as string),
    onSuccess: (response: ApproveQuoteResponse) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'service-orders'],
      });
      setConfirmApproveVisible(false);
      const message = response.serviceOrderCreated
        ? 'Serviço criado'
        : 'Serviço já existente';
      setSnackbar({ type: 'success', message });
      // Navegar imediatamente para o serviço
      router.replace({
        pathname: '/servicos/[id]',
        params: { id: response.serviceOrder.id, quoteId },
      });
    },
    onError: (error: unknown) => {
      setConfirmApproveVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (note?: string) => quotesService.reject(quoteId as string, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      setRejectVisible(false);
      setRejectNote('');
      setSnackbar({ type: 'success', message: 'Orçamento marcado como não aprovado' });
    },
    onError: (error: unknown) => {
      setRejectVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => quotesService.duplicate(quoteId as string),
    onSuccess: (duplicated) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      setSnackbar({ type: 'success', message: 'Orçamento duplicado com sucesso' });
      router.push(`/orcamentos/${duplicated.id}`);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });



  async function handleSharePdf() {
    try {
      setSnackbar({ type: 'info', message: 'Gerando PDF...' });
      const blob = await quotesService.getPdf(quoteId as string);

      // Convert blob to base64 for file system
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const fileName = `orcamento_${quoteQuery.data?.quoteNumber}_v${quoteQuery.data?.version}.pdf`;

          // Use new expo-file-system API
          const cacheDir = Paths.cache;
          const file = new File(cacheDir, fileName);
          file.write(base64Data, { encoding: 'base64' });

          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(file.uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartilhar orçamento',
            });
          } else {
            Alert.alert('PDF gerado', `Arquivo salvo em: ${file.uri}`);
          }

          setSnackbar({ type: 'success', message: 'PDF compartilhado com sucesso' });
        } catch (fileError) {
          console.error('Erro ao salvar/compartilhar PDF:', fileError);
          setSnackbar({ type: 'error', message: 'Erro ao compartilhar PDF' });
        }
      };
      reader.readAsDataURL(blob);
    } catch (pdfError) {
      console.error('Erro ao gerar PDF:', pdfError);
      setSnackbar({ type: 'error', message: toApiError(pdfError).message });
    }
  }

  if (!quoteId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Orçamento', headerShown: true }} />
        <ErrorState message="Orçamento não encontrado" />
      </ScreenContainer>
    );
  }

  const quote = quoteQuery.data;
  const statusBadge = quote ? QUOTE_STATUS_BADGE[quote.status] : null;
  const history = quote?.history ?? [];
  const expired = quote ? isQuoteExpired(quote) : false;
  const canApprove =
    quote?.status === 'RASCUNHO' ||
    quote?.status === 'ENVIADO' ||
    quote?.status === 'AGUARDANDO_APROVACAO';

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe do orçamento', headerShown: true }} />
        
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {quote ? `#${quote.quoteNumber} v${quote.version}` : 'Detalhe do orçamento'}
          </Text>
          {statusBadge && (
            <StatusBadge status={statusBadge.variant} label={statusBadge.label} size="sm" />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gerar e compartilhar PDF"
            onPress={handleSharePdf}
            disabled={!quote}
            style={({ pressed }) => [
              styles.pdfButton,
              pressed && styles.pdfButtonPressed,
              !quote && styles.pdfButtonDisabled,
            ]}
          >
            <Ionicons
              name="download-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </Pressable>
        </View>

        {quoteQuery.isLoading ? (
          <LoadingState text="Carregando orçamento..." />
        ) : quoteQuery.isError ? (
          <ErrorState
            message={toApiError(quoteQuery.error).message}
            onRetry={quoteQuery.refetch}
          />
        ) : quote ? (
          <>
            <AppCard shadow="light" radius={radius.lg} style={styles.clientCard}>
              <View style={styles.clientContent}>
                <View style={styles.clientIcon}>
                  <Ionicons
                    name="person-outline"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName} numberOfLines={1}>
                    {quote.client?.name ?? 'Cliente não informado'}
                  </Text>
                  {quote.client?.document ? (
                    <Text style={styles.clientContact} numberOfLines={1}>
                      {quote.client.document}
                    </Text>
                  ) : null}

                  {quote.work && (
                    <View style={styles.clientRow}>
                      <Ionicons
                        name="construct-outline"
                        size={sizes.icon.sm}
                        color={colors.textSecondary}
                        accessibilityElementsHidden
                      />
                      <Text style={styles.clientRowText} numberOfLines={1}>
                        {quote.work.name}
                      </Text>
                    </View>
                  )}

                  <View style={styles.clientRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={sizes.icon.sm}
                      color={colors.textSecondary}
                      accessibilityElementsHidden
                    />
                    <Text style={styles.clientRowText}>{formatDate(quote.createdAt)}</Text>
                  </View>
                </View>
              </View>
            </AppCard>

            <Text style={styles.sectionLabel}>Itens</Text>
            {quote.items.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum item adicionado</Text>
            ) : (
              quote.items.map((item: { id: string; name: string; quantity: number; unit: string; unitPrice: number; total: number }) => (
                <AppCard key={item.id} shadow="light" style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
                  </View>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemQuantity}>
                      {formatNumber(item.quantity)} × {formatCurrency(item.unitPrice)}
                    </Text>
                    <Text style={styles.itemUnitPrice}>{item.unit}</Text>
                  </View>
                </AppCard>
              ))
            )}

            <AppCard shadow="light" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(quote.subtotal)}</Text>
              </View>
              {quote.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Desconto</Text>
                  <Text style={[styles.summaryValue, styles.discountValue]}>
                    -{formatCurrency(quote.discount)}
                  </Text>
                </View>
              )}
              {quote.marginPct > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Margem ({quote.marginPct}%)</Text>
                  <Text style={styles.summaryValue}>
                    +{formatCurrency(quote.subtotal * (quote.marginPct / 100))}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
              </View>
            </AppCard>

            {quote.observations && (
              <>
                <Text style={styles.sectionLabel}>Observações</Text>
                <AppCard shadow="light" style={styles.obsCard}>
                  <Text style={styles.obsText}>{quote.observations}</Text>
                </AppCard>
              </>
            )}

            <Text style={styles.sectionLabel}>Histórico</Text>
            <AppCard shadow="light" style={styles.historyCard}>
              {history.length > 0 ? (
                history.map((event, index) => (
                  <View
                    key={event.id}
                    style={[
                      styles.historyItem,
                      index < history.length - 1 && styles.historyItemBorder,
                    ]}
                  >
                    <View style={styles.historyDot} />
                    <View style={styles.historyContent}>
                      <Text style={styles.historyStatus}>
                        {formatDayMonth(event.changedAt)} —{' '}
                        {QUOTE_STATUS_BADGE[event.status]?.label ?? event.status}
                      </Text>
                      {event.note ? (
                        <Text style={styles.historyNote}>{event.note}</Text>
                      ) : null}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>
                      Criado em {formatDayMonth(quote.createdAt)}
                    </Text>
                  </View>
                </View>
              )}
            </AppCard>

            <View style={styles.actions}>
              <AppButton
                title="Follow-ups"
                variant="secondary"
                size="lg"
                accessibilityLabel="Gerenciar follow-ups do orçamento"
                onPress={() => router.push(`/orcamentos/${quoteId}/follow-ups`)}
                style={styles.actionButton}
              />
              {canApprove && (
                <>
                  <AppButton
                    title="Aprovar orçamento"
                    size="lg"
                    accessibilityLabel="Aprovar orçamento"
                    onPress={() => setConfirmApproveVisible(true)}
                    style={styles.actionButton}
                  />
                  <AppButton
                    title="Não aprovado"
                    variant="secondary"
                    size="lg"
                    accessibilityLabel="Marcar orçamento como não aprovado"
                    onPress={() => setRejectVisible(true)}
                    style={styles.actionButton}
                  />
                </>
              )}
              {expired ? (
                <AppButton
                  title="Duplicar e atualizar"
                  size="lg"
                  accessibilityLabel="Duplicar orçamento vencido e atualizar"
                  onPress={() => duplicateMutation.mutate()}
                  loading={duplicateMutation.isPending}
                  disabled={duplicateMutation.isPending}
                  style={styles.actionButton}
                />
              ) : (
                <AppButton
                  title="Duplicar"
                  variant="secondary"
                  size="lg"
                  accessibilityLabel="Duplicar orçamento"
                  onPress={() => duplicateMutation.mutate()}
                  loading={duplicateMutation.isPending}
                  disabled={duplicateMutation.isPending}
                  style={styles.actionButton}
                />
              )}
              <AppButton
                title="Gerar PDF"
                size="lg"
                accessibilityLabel="Gerar e compartilhar PDF"
                onPress={handleSharePdf}
                style={styles.actionButton}
              />
              <AppButton
                title="Nova versão"
                variant="secondary"
                size="lg"
                accessibilityLabel="Gerar nova versão do orçamento"
                onPress={() => generateVersionMutation.mutate()}
                loading={generateVersionMutation.isPending}
                disabled={generateVersionMutation.isPending}
                style={styles.actionButton}
              />
              <AppButton
                title="Excluir"
                variant="danger"
                size="lg"
                accessibilityLabel="Excluir orçamento"
                onPress={() => setConfirmDeleteVisible(true)}
                style={styles.actionButton}
              />
            </View>
          </>
        ) : null}
      </ScreenContainer>

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Excluir orçamento"
        message="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDeleteVisible(false)}
      />

      <ConfirmDialog
        visible={confirmApproveVisible}
        title="Aprovar orçamento"
        message={
          quote
            ? `O cliente aprovou este orçamento?\n\n${formatQuoteCode(
                quote.quoteNumber
              )} · ${quote.client?.name ?? 'Cliente não informado'}\n${formatCurrency(
                quote.total
              )}`
            : 'O cliente aprovou este orçamento?'
        }
        confirmLabel="Aprovar"
        cancelLabel="Cancelar"
        loading={approveMutation.isPending}
        onConfirm={() => approveMutation.mutate()}
        onCancel={() => setConfirmApproveVisible(false)}
      />



      <Modal
        visible={rejectVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Não aprovado</Text>
            <Text style={styles.modalMessage}>
              Registre o motivo (opcional) para o histórico do orçamento.
            </Text>
            <AppInput
              label="Motivo"
              value={rejectNote}
              onChangeText={setRejectNote}
              placeholder="Ex.: cliente pediu desconto"
              multiline
              numberOfLines={3}
              maxLength={500}
              accessibilityLabel="Motivo da não aprovação"
              style={styles.rejectInput}
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancelar"
                variant="ghost"
                size="sm"
                onPress={() => setRejectVisible(false)}
                disabled={rejectMutation.isPending}
                style={styles.modalButton}
              />
              <AppButton
                title="Confirmar"
                variant="danger"
                size="sm"
                onPress={() => rejectMutation.mutate(rejectNote.trim() || undefined)}
                loading={rejectMutation.isPending}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {snackbar && (
        <AppSnackbar
          visible={true}
          type={snackbar.type}
          message={snackbar.message}
          onHide={() => setSnackbar(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  backButton: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  pdfButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfButtonPressed: {
    opacity: 0.8,
  },
  pdfButtonDisabled: {
    opacity: 0.5,
  },
  clientCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  clientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clientIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  clientName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  clientContact: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clientRowText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  itemName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  itemTotal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  itemQuantity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  itemUnitPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  summaryCard: {
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  discountValue: {
    color: colors.error,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  obsCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  obsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  historyCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
    gap: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  historyStatus: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  historyDate: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  historyNote: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    ...shadows.medium,
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
  rejectInput: {
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
});