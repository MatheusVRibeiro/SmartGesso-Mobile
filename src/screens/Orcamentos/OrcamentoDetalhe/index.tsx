import { haptics } from '@/src/utils/haptics';
import React, { useState, useMemo } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { quotesService } from '@/src/services/api/quotes';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing } from '@/src/theme';
import { formatCurrency, formatNumber, formatQuoteCode } from '@/src/utils/format';
import type { Quote, QuotePaymentMethod, QuoteStatus } from '@/src/types/quote';
import type { ApproveQuoteResponse } from '@/src/types/quote';
import { createOrcamentoDetalheStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

// ─── Helpers ────────────────────────────────────────────────────────────────

const QUOTE_STATUS_BADGE: Record<
  QuoteStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  RASCUNHO: { variant: 'expired', label: 'Rascunho' },
  PRONTO_PARA_ENVIAR: { variant: 'info', label: 'Pronto p/ enviar' },
  ENVIADO: { variant: 'warning', label: 'Enviado' },
  AGUARDANDO_APROVACAO: { variant: 'warning', label: 'Aguardando' },
  APROVADO: { variant: 'active', label: 'Aprovado' },
  REJEITADO: { variant: 'cancelled', label: 'Rejeitado' },
  VENCIDO: { variant: 'expired', label: 'Vencido' },
  CANCELADO: { variant: 'cancelled', label: 'Cancelado' },
};

const PAYMENT_METHOD_LABEL: Record<QuotePaymentMethod, string> = {
  AVISTA: 'À vista',
  AVISTA_DESCONTO: 'À vista c/ desconto',
  ENTRADA_SALDO: 'Entrada + Saldo',
  QUINZENAL_2X: 'Quinzenal 2x',
  MENSAL: 'Mensal',
  PARCELADO: 'Parcelado',
  PERSONALIZADO: 'Personalizado',
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

function isQuoteExpired(quote: {
  validUntil?: string | null;
  status: QuoteStatus;
}): boolean {
  if (!quote.validUntil) return false;
  if (CLOSED_QUOTE_STATUSES.has(quote.status)) return false;
  const validUntil = new Date(quote.validUntil);
  const now = new Date();
  validUntil.setHours(23, 59, 59, 999);
  return now.getTime() > validUntil.getTime();
}

// ─── Componente Principal ───────────────────────────────────────────────────

export default function OrcamentoDetalheScreen() {
  const router = useRouter();
  const { id: quoteId } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createOrcamentoDetalheStyles(colors, isDark), [colors, isDark]);

  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

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
    onSuccess: (newQuote: Quote) => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'quotes'],
      });
      setSnackbar({
        type: 'success',
        message: `Nova versão (v${newQuote.version}) criada! Abrindo edição...`,
      });
      setTimeout(() => {
        router.push({
          pathname: '/(app)/orcamentos/novo',
          params: { editQuoteId: newQuote.id },
        });
      }, 350);
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

  const quote = quoteQuery.data;
  const statusBadge = quote ? QUOTE_STATUS_BADGE[quote.status] : null;
  const history = quote?.history ?? [];
  const expired = quote ? isQuoteExpired(quote) : false;
  const canApprove =
    quote?.status === 'RASCUNHO' ||
    quote?.status === 'ENVIADO' ||
    quote?.status === 'AGUARDANDO_APROVACAO';

  // Iniciais do cliente
  const clientInitials = useMemo(() => {
    const name = quote?.client?.name?.trim();
    if (!name) return 'OR';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [quote?.client?.name]);

  const handleFollowUpWhatsApp = async () => {
    if (!quote) return;
    const clientName = quote.client?.name ?? 'Cliente';
    const quoteNum = formatQuoteCode(quote.quoteNumber);
    const rawPhone = ((quote.client as any)?.whatsapp || (quote.client as any)?.phone || '').replace(/\D/g, '');
    const phone = rawPhone.length === 10 || rawPhone.length === 11 ? `55${rawPhone}` : rawPhone;

    const message = `Olá ${clientName}, tudo bem? Passando para saber se conseguiu dar uma olhada na proposta ${quoteNum} do seu serviço de gesso. Se tiver qualquer dúvida ou quiser ajustar prazos e condições, fico à disposição!`;

    haptics.selection();
    if (phone) {
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(url).catch(() => false);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    }
    await Share.share({ message });
  };

  const handleShareWhatsApp = async () => {
    if (!quote) return;
    const clientName = quote.client?.name ?? 'Cliente';
    const quoteNum = formatQuoteCode(quote.quoteNumber);
    const totalStr = formatCurrency(quote.total);
    const rawPhone = ((quote.client as any)?.whatsapp || (quote.client as any)?.phone || '').replace(/\D/g, '');
    const phone = rawPhone.length === 10 || rawPhone.length === 11 ? `55${rawPhone}` : rawPhone;

    const text = `Olá, ${clientName}! Segue o orçamento *${quoteNum}* no valor total de *${totalStr}* pela SmartGesso. Ficamos à disposição para tirar qualquer dúvida e agendar a execução do serviço!`;

    if (phone) {
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return;
        }
      } catch {
        // Fallback para Share
      }
    }

    try {
      await Share.share({
        message: text,
        title: `Orçamento ${quoteNum}`,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar via WhatsApp.');
    }
  };

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

  async function handleShareLink() {
    try {
      setSnackbar({ type: 'info', message: 'Gerando link...' });
      const { url } = await quotesService.share(quoteId as string);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(url, { dialogTitle: 'Compartilhar orçamento' });
      } else {
        Alert.alert('Link do orçamento', url);
      }
      setSnackbar({ type: 'success', message: 'Link gerado com sucesso' });
    } catch (shareError) {
      console.error('Erro ao gerar link:', shareError);
      setSnackbar({ type: 'error', message: toApiError(shareError).message });
    }
  }

  if (!quoteId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message="Orçamento não encontrado" />
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Oculta o header nativo duplicado do Stack Navigation */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenContainer scroll padding={false} keyboard={false}>
        <View style={styles.scrollContent}>
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />

          {/* ── CABEÇALHO UNIFICADO E ELEGANTE ─────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/orcamentos')}
                activeOpacity={0.7}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.titleGroup}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>
                    {quote ? `Orçamento ${formatQuoteCode(quote.quoteNumber)}` : 'Detalhe do orçamento'}
                  </Text>
                  {quote && (
                    <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>
                      v{quote.version}
                    </Text>
                  )}
                  {statusBadge && (
                    <StatusBadge status={statusBadge.variant} label={statusBadge.label} size="sm" />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Gerar e compartilhar PDF"
                onPress={handleSharePdf}
                disabled={!quote}
                activeOpacity={0.7}
                style={styles.headerIconBtn}
              >
                <Ionicons name="download-outline" size={19} color={colors.primary} />
              </TouchableOpacity>
            </View>
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
              {/* ── CARD DE CONTEXTO DO CLIENTE & OBRA ────────────────── */}
              <View style={styles.clientCard}>
                <View style={styles.clientTopRow}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>{clientInitials}</Text>
                  </View>
                  <View style={styles.clientMainInfo}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {quote.client?.name ?? 'Cliente não informado'}
                    </Text>
                    {quote.client?.document ? (
                      <Text style={styles.clientDocument} numberOfLines={1}>
                        {quote.client.document}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Chips de Metadados Organizados */}
                <View style={styles.clientMetaGrid}>
                  <View style={styles.metaChip}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.metaChipText}>Criado {formatDate(quote.createdAt)}</Text>
                  </View>

                  {quote.validUntil && (
                    <View style={styles.metaChip}>
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={expired ? colors.danger : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.metaChipText,
                          expired && { color: colors.danger, fontWeight: '700' },
                        ]}
                      >
                        {expired ? 'Vencido em ' : 'Válido até '}
                        {formatDayMonth(quote.validUntil)}
                      </Text>
                    </View>
                  )}

                  {quote.work && (
                    <View style={styles.metaChip}>
                      <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
                      <Text style={styles.metaChipText} numberOfLines={1}>
                        {quote.work.name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* ── SEÇÃO DE ITENS UNIFICADA (ALTA DENSIDADE) ────────── */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionLabel}>Itens da proposta</Text>
                <View style={styles.sectionCountBadge}>
                  <Text style={styles.sectionCountText}>
                    {quote.items.length === 1 ? '1 item' : `${quote.items.length} itens`}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsCard}>
                {quote.items.length === 0 ? (
                  <View style={styles.emptyItemsBox}>
                    <Text style={styles.emptyText}>Nenhum item adicionado à proposta</Text>
                  </View>
                ) : (
                  quote.items.map((item: any, idx: number) => {
                    const isLast = idx === quote.items.length - 1;
                    return (
                      <View key={item.id || idx} style={[styles.itemRow, isLast && styles.itemRowLast]}>
                        <View style={styles.itemMainRow}>
                          <Text style={styles.itemName} numberOfLines={2}>
                            {item.name}
                          </Text>
                          <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
                        </View>
                        <View style={styles.itemSubRow}>
                          <Text style={styles.itemUnitTag}>
                            {formatNumber(item.quantity)} × {formatCurrency(item.unitPrice)} / {item.unit}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* ── RESUMO FINANCEIRO INTEGRADO ───────────────────────── */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(quote.subtotal)}</Text>
                </View>

                {quote.discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Desconto aplicado</Text>
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

                {/* Banner de Total em Destaque */}
                <View style={styles.totalBanner}>
                  <Text style={styles.totalLabel}>Total da proposta</Text>
                  <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
                </View>

                {quote.paymentMethod && (
                  <View style={styles.paymentMethodRow}>
                    <Text style={styles.summaryLabel}>Condição de pagamento</Text>
                    <View style={styles.paymentMethodChip}>
                      <Text style={styles.paymentMethodText}>
                        {PAYMENT_METHOD_LABEL[quote.paymentMethod] ?? quote.paymentMethod}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* ── OBSERVAÇÕES ───────────────────────────────────────── */}
              {quote.observations && (
                <>
                  <Text style={styles.sectionLabel}>Observações</Text>
                  <View style={styles.obsCard}>
                    <Text style={styles.obsText}>{quote.observations}</Text>
                  </View>
                </>
              )}

              {/* ── HISTÓRICO / TIMELINE ──────────────────────────────── */}
              <Text style={styles.sectionLabel}>Histórico</Text>
              <View style={styles.historyCard}>
                {history.length > 0 ? (
                  history.map((event: any, index: number) => (
                    <View
                      key={event.id || index}
                      style={[
                        styles.historyItem,
                        index < history.length - 1 && styles.historyItemBorder,
                      ]}
                    >
                      <View style={styles.historyDot} />
                      <View style={styles.historyContent}>
                        <Text style={styles.historyStatus}>
                          {formatDayMonth(event.changedAt)} —{' '}
                          {QUOTE_STATUS_BADGE[event.status as QuoteStatus]?.label ?? event.status}
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
              </View>

              {/* ── PAINEL DE AÇÕES REDESENHADO ───────────────────────── */}
              <View style={styles.actionsSection}>
                {/* 1. Ações Comerciais Decisivas */}
                <View style={styles.primaryActionsGroup}>
                  {canApprove && (
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => setConfirmApproveVisible(true)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Aprovar orçamento"
                    >
                      <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                      <Text style={styles.approveButtonText}>Aprovar proposta</Text>
                    </TouchableOpacity>
                  )}

                  {canApprove && (
                    <TouchableOpacity
                      style={[
                        styles.approveButton,
                        {
                          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : colors.editActionBg,
                          borderWidth: 1,
                          borderColor: isDark ? colors.editActionBorder : colors.editActionBorder,
                        },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: '/(app)/orcamentos/novo',
                          params: { editQuoteId: quote.id },
                        })
                      }
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Editar orçamento"
                    >
                      <Ionicons name="create-outline" size={20} color={isDark ? colors.editActionText : colors.editActionText} />
                      <Text
                        style={[
                          styles.approveButtonText,
                          { color: isDark ? colors.editActionText : colors.editActionText },
                        ]}
                      >
                        Editar proposta
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.whatsAppButton}
                    onPress={handleShareWhatsApp}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Enviar orçamento por WhatsApp"
                  >
                    <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
                    <Text style={styles.whatsAppButtonText}>Enviar por WhatsApp</Text>
                  </TouchableOpacity>

                  {(quote.status === 'ENVIADO' || quote.status === 'AGUARDANDO_APROVACAO') && (
                    <TouchableOpacity
                      style={styles.followUpWhatsAppBtn}
                      onPress={handleFollowUpWhatsApp}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Enviar mensagem de lembrete por WhatsApp"
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={17} color={isDark ? colors.followUpText : colors.followUpText} />
                      <Text style={styles.followUpWhatsAppText}>Lembrar cliente no WhatsApp</Text>
                    </TouchableOpacity>
                  )}

                  {expired && (
                    <TouchableOpacity
                      style={[styles.approveButton, { backgroundColor: colors.warning }]}
                      onPress={() => duplicateMutation.mutate()}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      accessibilityLabel="Duplicar orçamento vencido e atualizar"
                      disabled={duplicateMutation.isPending}
                    >
                      <Ionicons name="refresh-outline" size={19} color={colors.white} />
                      <Text style={styles.approveButtonText}>Duplicar e atualizar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 2. Grade de Ações Rápidas (2x2) */}
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={handleSharePdf}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Gerar e compartilhar PDF"
                  >
                    <Ionicons name="document-text-outline" size={17} color={colors.primary} />
                    <Text style={styles.quickActionText}>Gerar PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={handleShareLink}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Compartilhar link público do orçamento"
                  >
                    <Ionicons name="share-social-outline" size={17} color={colors.primary} />
                    <Text style={styles.quickActionText}>Link público</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => router.push(`/orcamentos/${quoteId}/follow-ups`)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Gerenciar follow-ups do orçamento"
                  >
                    <Ionicons name="chatbubbles-outline" size={17} color={colors.primary} />
                    <Text style={styles.quickActionText}>Follow-ups</Text>
                  </TouchableOpacity>

                  {!expired && (
                    <TouchableOpacity
                      style={styles.quickActionCard}
                      onPress={() => duplicateMutation.mutate()}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Duplicar orçamento"
                      disabled={duplicateMutation.isPending}
                    >
                      <Ionicons name="copy-outline" size={17} color={colors.primary} />
                      <Text style={styles.quickActionText}>Duplicar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 3. Ações Secundárias / Gestão no Rodapé */}
                <View style={styles.secondaryActionsRow}>
                  {canApprove && (
                    <TouchableOpacity
                      style={styles.secondaryOutlineBtn}
                      onPress={() => setRejectVisible(true)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Marcar orçamento como não aprovado"
                    >
                      <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.secondaryOutlineText}>Não aprovado</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.secondaryOutlineBtn}
                    onPress={() => generateVersionMutation.mutate()}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Gerar nova versão do orçamento"
                    disabled={generateVersionMutation.isPending}
                  >
                    <Ionicons name="git-branch-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.secondaryOutlineText}>Nova versão</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setConfirmDeleteVisible(true)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Excluir orçamento"
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.deleteButtonText}>Excluir orçamento</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </ScreenContainer>

      {/* ── DIÁLOGOS DE CONFIRMAÇÃO E MODAIS ───────────────────────── */}
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
