import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { FeatureGate } from '../../../src/components/ui/FeatureGate';
import { toApiError } from '../../../src/services/api/client';
import { goalsService } from '../../../src/services/api/goals';
import { quotesService } from '../../../src/services/api/quotes';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { QuoteSummary } from '../../../src/types/quote';
import type { SetGoalInput } from '../../../src/types/goal';
import { COMPANY_MEMBER_ROLE_LABELS } from '../../../src/types/companyMember';
import { formatCurrency } from '../../../src/utils/format';
import { onlyDigits, parseCurrencyInput } from '../../../src/utils/masks';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Helpers ────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

/**
 * A API real retorna array puro em GET /quotes (Prisma findMany), enquanto
 * os tipos declarados podem ser { data, total }. Normaliza ambos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

/** Verifica se a data ISO pertence ao mês/ano local informado. */
function isSameLocalMonth(iso: string, year: number, month: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === year && date.getMonth() === month - 1;
}

/** Percentual de atingimento (null quando não há meta ou meta = 0). */
function pctOf(actual: number, target: number | null | undefined): number | null {
  if (target == null || target <= 0) return null;
  return Number(((actual / target) * 100).toFixed(2));
}

function roleLabel(role: string): string {
  return (
    (COMPANY_MEMBER_ROLE_LABELS as Record<string, string>)[role] ?? role
  );
}

// ─── Barra de progresso ─────────────────────────────────────────────────────

function ProgressBar({ percentual }: { percentual: number | null }) {
  const clamped =
    percentual == null ? 0 : Math.min(Math.max(percentual, 0), 100);

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${clamped}%`,
              backgroundColor:
                clamped >= 100
                  ? colors.success
                  : clamped >= 80
                    ? colors.warning
                    : colors.danger,
            },
          ]}
        />
      </View>
      <Text style={styles.progressBarText}>
        {percentual == null ? '—' : `${clamped.toFixed(1)}%`}
      </Text>
    </View>
  );
}

// ─── Card de meta vs realizado ──────────────────────────────────────────────

interface GoalProgressCardProps {
  title: string;
  actualLabel: string;
  targetLabel: string;
  pct: number | null;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
}

function GoalProgressCard({
  title,
  actualLabel,
  targetLabel,
  pct,
  icon,
  iconBackground,
  iconColor,
}: GoalProgressCardProps) {
  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.goalCard}>
      <View style={styles.goalCardHeader}>
        <View
          style={[styles.goalCardIcon, { backgroundColor: iconBackground }]}
        >
          <Ionicons
            name={icon}
            size={sizes.icon.md}
            color={iconColor}
            accessibilityElementsHidden
          />
        </View>
        <Text style={styles.goalCardTitle}>{title}</Text>
      </View>
      <Text style={styles.goalCardValue} numberOfLines={1} adjustsFontSizeToFit>
        {actualLabel} de {targetLabel}
      </Text>
      <ProgressBar percentual={pct} />
    </AppCard>
  );
}

// ─── Modal de definição de metas ────────────────────────────────────────────

interface GoalFormState {
  quoteAmount: string;
  revenue: string;
  approvedQuotes: string;
}

interface GoalFormModalProps {
  visible: boolean;
  periodLabel: string;
  initial: GoalFormState;
  saving: boolean;
  error: string | null;
  onSave: (values: GoalFormState) => void;
  onClose: () => void;
}

function GoalFormModal({
  visible,
  periodLabel,
  initial,
  saving,
  error,
  onSave,
  onClose,
}: GoalFormModalProps) {
  const [form, setForm] = useState<GoalFormState>(initial);

  // Reabrir o modal reseta o formulário para os valores iniciais.
  const [lastVisible, setLastVisible] = useState(visible);
  if (visible !== lastVisible) {
    setLastVisible(visible);
    if (visible) setForm(initial);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Definir metas</Text>
            <Text style={styles.modalSubtitle}>{periodLabel}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar definição de metas"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons
              name="close"
              size={sizes.icon.lg}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalBody}
          keyboardShouldPersistTaps="handled"
        >
          <AppInput
            label="Valor de orçamentos (R$)"
            value={form.quoteAmount}
            onChangeText={(text) =>
              setForm((f) => ({ ...f, quoteAmount: text }))
            }
            placeholder="Ex.: 50.000,00"
            mask="currency"
            required
            testID="goal-quote-amount"
          />
          <AppInput
            label="Receita (R$)"
            value={form.revenue}
            onChangeText={(text) => setForm((f) => ({ ...f, revenue: text }))}
            placeholder="Ex.: 30.000,00"
            mask="currency"
            required
            testID="goal-revenue"
          />
          <AppInput
            label="Orçamentos aprovados (quantidade)"
            value={form.approvedQuotes}
            onChangeText={(text) =>
              setForm((f) => ({ ...f, approvedQuotes: onlyDigits(text) }))
            }
            placeholder="Ex.: 10"
            keyboardType="number-pad"
            required
            testID="goal-approved-quotes"
          />

          {error ? <Text style={styles.modalError}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <AppButton
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              style={styles.modalAction}
            />
            <AppButton
              title="Salvar metas"
              variant="primary"
              loading={saving}
              onPress={() => onSave(form)}
              style={styles.modalAction}
              testID="goal-save"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function MetasScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const yearOptions = useMemo(
    () => [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['metas', companyId, year, month],
    queryFn: async () => {
      const [performance, quotesResult] = await Promise.all([
        goalsService.getPerformance(year, month),
        quotesService.list(),
      ]);
      // O endpoint de performance não expõe o valor total de orçamentos do
      // mês (apenas o pct vs meta) — calcula no mobile a partir da listagem,
      // no mesmo padrão da tela Meta vs Realizado.
      const quoteAmountActual = toArray<QuoteSummary>(quotesResult)
        .filter((q) => isSameLocalMonth(q.createdAt, year, month))
        .reduce((sum, q) => sum + q.total, 0);
      return { performance, quoteAmountActual };
    },
    enabled: Boolean(companyId),
  });

  const setGoalMutation = useMutation({
    mutationFn: (input: SetGoalInput) => goalsService.setGoal(input),
    onSuccess: () => {
      setGoalModalVisible(false);
      setSnackbar({
        type: 'success',
        message: 'Meta do mês atualizada com sucesso',
      });
      refetch();
    },
    onError: (mutationError: unknown) => {
      setSnackbar({
        type: 'error',
        message: toApiError(mutationError).message,
      });
    },
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const performance = data?.performance;
  const quoteAmountActual = data?.quoteAmountActual ?? 0;
  const goals = performance?.goals ?? null;
  const totals = performance?.totals;

  const hasGoal =
    goals != null &&
    (goals.targetQuoteAmount != null ||
      goals.targetRevenue != null ||
      goals.targetApprovedQuotes != null);

  const periodLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  const goalFormInitial = useMemo<GoalFormState>(
    () => ({
      quoteAmount:
        goals?.targetQuoteAmount != null && goals.targetQuoteAmount > 0
          ? formatCurrency(goals.targetQuoteAmount).replace('R$ ', '')
          : '',
      revenue:
        goals?.targetRevenue != null && goals.targetRevenue > 0
          ? formatCurrency(goals.targetRevenue).replace('R$ ', '')
          : '',
      approvedQuotes:
        goals?.targetApprovedQuotes != null && goals.targetApprovedQuotes > 0
          ? String(goals.targetApprovedQuotes)
          : '',
    }),
    [goals],
  );

  function handleSaveGoal(values: GoalFormState) {
    if (
      values.quoteAmount === '' ||
      values.revenue === '' ||
      values.approvedQuotes === ''
    ) {
      setSnackbar({
        type: 'error',
        message: 'Preencha os três campos da meta.',
      });
      return;
    }
    setGoalMutation.mutate({
      year,
      month,
      targetQuoteAmount: parseCurrencyInput(values.quoteAmount),
      targetRevenue: parseCurrencyInput(values.revenue),
      targetApprovedQuotes: parseInt(values.approvedQuotes, 10),
    });
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState text="Carregando metas e performance..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Metas & Performance', headerShown: true }} />

      <FeatureGate
        feature="team"
        fallback={
          <EmptyState
            title="Funcionalidade não habilitada"
            description="A feature de equipe não está habilitada para sua empresa. Fale com o suporte para habilitar."
            icon="people-outline"
          />
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Metas & Performance</Text>
            <Text style={styles.subtitle}>
              Acompanhe as metas do mês e o desempenho da equipe
            </Text>
          </View>

          {/* Seleção de mês/ano */}
          <View style={styles.periodSection}>
            <Text style={styles.periodLabel}>Mês</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.periodScroll}
            >
              {MONTH_LABELS.map((label, index) => {
                const value = index + 1;
                const selected = value === month;
                return (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Selecionar mês ${label}`}
                    onPress={() => setMonth(value)}
                    style={[styles.periodChip, selected && styles.periodChipActive]}
                  >
                    <Text
                      style={[
                        styles.periodChipText,
                        selected && styles.periodChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.periodLabel, { marginTop: spacing.md }]}>
              Ano
            </Text>
            <View style={styles.yearRow}>
              {yearOptions.map((value) => {
                const selected = value === year;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Selecionar ano ${value}`}
                    onPress={() => setYear(value)}
                    style={[
                      styles.periodChip,
                      selected && styles.periodChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodChipText,
                        selected && styles.periodChipTextActive,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Meta vs Realizado */}
          {!hasGoal ? (
            <EmptyState
              title="Defina sua meta do mês"
              description={`Configure as metas de orçamentos, receita e valor para ${periodLabel} e acompanhe o progresso da equipe.`}
              icon="flag-outline"
              actionLabel="Definir metas"
              onAction={() => setGoalModalVisible(true)}
            />
          ) : (
            <View style={styles.goalCards}>
              <GoalProgressCard
                title="Orçamentos aprovados"
                actualLabel={String(totals?.quotesApproved ?? 0)}
                targetLabel={String(goals?.targetApprovedQuotes ?? 0)}
                pct={
                  goals?.approvedQuotesPct ??
                  pctOf(totals?.quotesApproved ?? 0, goals?.targetApprovedQuotes)
                }
                icon="checkmark-circle-outline"
                iconBackground={colors.successSoft}
                iconColor={colors.success}
              />
              <GoalProgressCard
                title="Receita"
                actualLabel={formatCurrency(totals?.revenue ?? 0)}
                targetLabel={formatCurrency(goals?.targetRevenue ?? 0)}
                pct={
                  goals?.revenuePct ??
                  pctOf(totals?.revenue ?? 0, goals?.targetRevenue)
                }
                icon="cash-outline"
                iconBackground={colors.primarySoft}
                iconColor={colors.primary}
              />
              <GoalProgressCard
                title="Valor de orçamentos"
                actualLabel={formatCurrency(quoteAmountActual)}
                targetLabel={formatCurrency(goals?.targetQuoteAmount ?? 0)}
                pct={
                  goals?.quoteAmountPct ??
                  pctOf(quoteAmountActual, goals?.targetQuoteAmount)
                }
                icon="document-text-outline"
                iconBackground={colors.infoSoft}
                iconColor={colors.info}
              />
            </View>
          )}

          {/* Resumo do período */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo do período</Text>
            <Text style={styles.sectionSubtitle}>{periodLabel}</Text>

            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {totals?.quotesCreated ?? 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Orçamentos criados</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {totals?.quotesApproved ?? 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Aprovados</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {totals?.approvalRate == null
                      ? '—'
                      : `${totals.approvalRate.toFixed(1)}%`}
                  </Text>
                  <Text style={styles.summaryLabel}>Taxa de aprovação</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {totals?.followUpsDone ?? 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Follow-ups feitos</Text>
                </View>
              </View>
            </AppCard>
          </View>

          {/* Performance por vendedor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por vendedor</Text>
            <Text style={styles.sectionSubtitle}>
              Desempenho dos membros da equipe no período
            </Text>

            <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
              {(performance?.byMember ?? []).length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum membro ativo na empresa
                </Text>
              ) : (
                (performance?.byMember ?? []).map((member, index, array) => (
                  <View
                    key={member.memberId}
                    style={[
                      styles.memberItem,
                      index < array.length - 1 && styles.memberItemBorder,
                    ]}
                  >
                    <View style={styles.memberHeader}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                          {member.memberName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {member.memberName}
                        </Text>
                        <Text style={styles.memberRole}>
                          {roleLabel(member.role)}
                        </Text>
                      </View>
                      <Text style={styles.memberRevenue}>
                        {formatCurrency(member.revenue)}
                      </Text>
                    </View>
                    <View style={styles.memberStats}>
                      <Text style={styles.memberStat}>
                        {member.quotesCreated} orç. criados
                      </Text>
                      <Text style={styles.memberStat}>
                        {member.quotesApproved} aprovados
                      </Text>
                      <Text style={styles.memberStat}>
                        {member.approvalRate == null
                          ? '—'
                          : `${member.approvalRate.toFixed(1)}% aprovação`}
                      </Text>
                      <Text style={styles.memberStat}>
                        {member.followUpsDone} follow-ups
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </AppCard>
          </View>

          {/* Botão de definição de metas */}
          <View style={styles.buttonContainer}>
            <AppButton
              title="Definir metas"
              variant="primary"
              onPress={() => setGoalModalVisible(true)}
              style={styles.button}
              testID="open-goal-modal"
            />
          </View>
        </ScrollView>
      </FeatureGate>

      <GoalFormModal
        visible={goalModalVisible}
        periodLabel={periodLabel}
        initial={goalFormInitial}
        saving={setGoalMutation.isPending}
        error={null}
        onSave={handleSaveGoal}
        onClose={() => setGoalModalVisible(false)}
      />

      <AppSnackbar
        visible={snackbar != null}
        type={snackbar?.type ?? 'info'}
        message={snackbar?.message ?? ''}
        onHide={() => setSnackbar(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: sizes.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
    paddingTop: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },

  // ── Seleção de período ──
  periodSection: {
    marginBottom: spacing['2xl'],
  },
  periodLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  periodScroll: {
    flexGrow: 0,
  },
  periodChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  periodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  periodChipTextActive: {
    color: colors.textOnPrimary,
  },
  yearRow: {
    flexDirection: 'row',
  },

  // ── Cards de meta vs realizado ──
  goalCards: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  goalCard: {
    padding: spacing.lg,
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  goalCardIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCardTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  goalCardValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  progressBarText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    minWidth: 44,
    textAlign: 'right',
  },

  // ── Seções ──
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionCard: {
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // ── Resumo do período ──
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
  },
  summaryItem: {
    alignItems: 'center',
    width: '45%',
  },
  summaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // ── Lista por vendedor ──
  memberItem: {
    paddingVertical: spacing.md,
  },
  memberItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  memberRole: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberRevenue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  memberStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginLeft: 44,
  },
  memberStat: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },

  // ── Botão ──
  buttonContainer: {
    marginTop: spacing.xl,
  },
  button: {
    width: '100%',
  },

  // ── Modal ──
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalClose: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  modalError: {
    fontSize: typography.sizes.sm,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalAction: {
    flex: 1,
  },
});
