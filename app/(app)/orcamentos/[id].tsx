import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { quotesService } from '../../../src/services/api/quotes';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency, formatNumber } from '../../../src/utils/format';
import type { QuoteStatus } from '../../../src/types/quote';

// ─── Helpers ────────────────────────────────────────────────────────────────

const QUOTE_STATUS_BADGE: Record<
  QuoteStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  RASCUNHO: { variant: 'expired', label: 'Rascunho' },
  ENVIADO: { variant: 'warning', label: 'Enviado' },
  APROVADO: { variant: 'active', label: 'Aprovado' },
  REJEITADO: { variant: 'cancelled', label: 'Rejeitado' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalheOrcamentoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const quoteId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const quoteQuery = useQuery({
    queryKey: ['company', companyId, 'quotes', quoteId],
    queryFn: () => quotesService.getById(quoteId as string),
    enabled: Boolean(companyId && quoteId),
  });

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

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe do orçamento', headerShown: true }} />

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

            <View style={styles.actions}>
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
});