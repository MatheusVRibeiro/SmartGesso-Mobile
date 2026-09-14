import { BackButton } from '@/src/components/navigation/BackButton';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { FeatureGate } from '@/src/components/ui/FeatureGate';
import { toApiError } from '@/src/services/api/client';
import { goalsService } from '@/src/services/api/goals';
import { quotesService } from '@/src/services/api/quotes';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type { QuoteSummary } from '@/src/types/quote';
import type { SetGoalInput } from '@/src/types/goal';
import { COMPANY_MEMBER_ROLE_LABELS } from '@/src/types/companyMember';
import { formatCurrency } from '@/src/utils/format';
import { onlyDigits, parseCurrencyInput } from '@/src/utils/masks';
import { toArray } from '@/src/utils/toArray';
import { createMetasStyles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

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

function isSameLocalMonth(iso: string, year: number, month: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === year && date.getMonth() === month - 1;
}

function pctOf(actual: number, target: number | null | undefined): number | null {
  if (target == null || target <= 0) return null;
  return Number(((actual / target) * 100).toFixed(2));
}

function roleLabel(role: string): string {
  return (
    (COMPANY_MEMBER_ROLE_LABELS as Record<string, string>)[role] ?? role
  );
}

function ProgressBar({
  percentual,
  styles,
  colors,
}: {
  percentual: number | null;
  styles: ReturnType<typeof createMetasStyles>;
  colors: ActivePalette;
}) {
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

interface GoalProgressCardProps {
  title: string;
  actualLabel: string;
  targetLabel: string;
  pct: number | null;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  styles: ReturnType<typeof createMetasStyles>;
  colors: ActivePalette;
}

function GoalProgressCard({
  title,
  actualLabel,
  targetLabel,
  pct,
  icon,
  iconBackground,
  iconColor,
  styles,
  colors,
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
      <ProgressBar percentual={pct} styles={styles} colors={colors} />
    </AppCard>
  );
}

interface GoalFormState {
  targetApprovedQuotes: string;
  targetRevenue: string;
  targetQuoteAmount: string;
}

interface GoalFormModalProps {
  visible: boolean;
  periodLabel: string;
  initial: GoalFormState;
  saving: boolean;
  error: string | null;
  styles: ReturnType<typeof createMetasStyles>;
  colors: ActivePalette;
  onSave: (form: GoalFormState) => void;
  onClose: () => void;
}

function GoalFormModal({
  visible,
  periodLabel,
  initial,
  saving,
  error,
  styles,
  colors,
  onSave,
  onClose,
}: GoalFormModalProps) {
  const [form, setForm] = useState<GoalFormState>(initial);

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
          {error ? <Text style={styles.modalError}>{error}</Text> : null}

          <AppInput
            label="Meta de orçamentos aprovados (unidades)"
            placeholder="Ex: 10"
            value={form.targetApprovedQuotes}
            onChangeText={(v) =>
              setForm((prev) => ({
                ...prev,
                targetApprovedQuotes: onlyDigits(v),
              }))
            }
            keyboardType="number-pad"
            accessibilityLabel="Meta de orçamentos aprovados"
          />

          <AppInput
            label="Meta de receita (R$)"
            placeholder="Ex: 25000"
            value={form.targetRevenue}
            onChangeText={(v) =>
              setForm((prev) => ({
                ...prev,
                targetRevenue: v,
              }))
            }
            keyboardType="numeric"
            accessibilityLabel="Meta de receita"
          />

          <AppInput
            label="Meta de valor total orçado (R$)"
            placeholder="Ex: 50000"
            value={form.targetQuoteAmount}
            onChangeText={(v) =>
              setForm((prev) => ({
                ...prev,
                targetQuoteAmount: v,
              }))
            }
            keyboardType="numeric"
            accessibilityLabel="Meta de valor orçado"
          />

          <View style={styles.modalActions}>
            <AppButton
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              disabled={saving}
              style={styles.modalAction}
            />
            <AppButton
              title={saving ? 'Salvando...' : 'Salvar'}
              variant="primary"
              onPress={() => onSave(form)}
              loading={saving}
              disabled={saving}
              style={styles.modalAction}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function MetasListScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createMetasStyles(colors, isDark), [colors, isDark]);

  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const {
    data: performance,
    isLoading: loadingPerf,
    isError: errorPerf,
    error: errPerfObj,
    refetch: refetchPerf,
    isRefetching: refetchingPerf,
  } = useQuery({
    queryKey: ['company', companyId, 'goals', 'performance', year, month],
    queryFn: () => goalsService.getPerformance(year, month),
    enabled: Boolean(companyId),
  });

  const {
    data: quotesData,
    isLoading: loadingQuotes,
    refetch: refetchQuotes,
    isRefetching: refetchingQuotes,
  } = useQuery({
    queryKey: ['company', companyId, 'quotes'],
    queryFn: () => quotesService.list(),
    select: (res) => toArray<QuoteSummary>(res),
    enabled: Boolean(companyId),
  });

  const setGoalMutation = useMutation({
    mutationFn: (input: SetGoalInput) => goalsService.setGoal(input),
    onSuccess: () => {
      setGoalModalVisible(false);
      setSnackbar({
        type: 'success',
        message: 'Metas atualizadas com sucesso!',
      });
      refetchPerf();
    },
    onError: (err) => {
      setSnackbar({
        type: 'error',
        message: toApiError(err).message,
      });
    },
  });

  const isRefreshing = refetchingPerf || refetchingQuotes;
  const handleRefresh = useCallback(() => {
    refetchPerf();
    refetchQuotes();
  }, [refetchPerf, refetchQuotes]);

  const quoteAmountActual = useMemo(() => {
    if (!quotesData) return 0;
    return quotesData
      .filter((q) => isSameLocalMonth(q.createdAt, year, month))
      .reduce((sum, q) => sum + (q.total ?? 0), 0);
  }, [quotesData, year, month]);

  const periodLabel = `${MONTH_LABELS[month - 1]} / ${year}`;
  const goals = performance?.goals;
  const totals = performance?.totals;

  const hasGoal =
    goals != null &&
    (goals.targetApprovedQuotes != null ||
      goals.targetRevenue != null ||
      goals.targetQuoteAmount != null);

  const goalFormInitial: GoalFormState = useMemo(
    () => ({
      targetApprovedQuotes:
        goals?.targetApprovedQuotes != null
          ? String(goals.targetApprovedQuotes)
          : '',
      targetRevenue:
        goals?.targetRevenue != null ? String(goals.targetRevenue) : '',
      targetQuoteAmount:
        goals?.targetQuoteAmount != null ? String(goals.targetQuoteAmount) : '',
    }),
    [goals],
  );

  const handleSaveGoal = useCallback(
    (form: GoalFormState) => {
      const parsedApproved = form.targetApprovedQuotes.trim()
        ? parseInt(form.targetApprovedQuotes, 10)
        : null;
      const parsedRev = parseCurrencyInput(form.targetRevenue);
      const parsedAmount = parseCurrencyInput(form.targetQuoteAmount);

      setGoalMutation.mutate({
        year,
        month,
        targetApprovedQuotes:
          parsedApproved != null && !Number.isNaN(parsedApproved)
            ? parsedApproved
            : 0,
        targetRevenue: parsedRev != null ? parsedRev : 0,
        targetQuoteAmount: parsedAmount != null ? parsedAmount : 0,
      });
    },
    [year, month, setGoalMutation],
  );

  if (loadingPerf || loadingQuotes) {
    return (
      <ScreenContainer padding={false} keyboard={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState text="Carregando metas e performance..." />
      </ScreenContainer>
    );
  }

  if (errorPerf) {
    return (
      <ScreenContainer padding={false} keyboard={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState
          message={toApiError(errPerfObj).message}
          onRetry={handleRefresh}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <FeatureGate
        feature="team"
        fallback={
          <EmptyState
            title="Recurso não disponível"
            description="O módulo de metas e performance exige um plano que inclua gestão de equipe."
            icon="lock-closed-outline"
          />
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.header}>
            <BackButton fallback="/(app)/(tabs)/mais" />
            <View style={styles.headerText}>
              <Text style={styles.title}>Metas & Performance</Text>
              <Text style={styles.subtitle}>
                Acompanhamento de metas do período e produtividade da equipe
              </Text>
            </View>
          </View>

          <View style={styles.periodSection}>
            <Text style={styles.periodLabel}>Mês</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.periodScroll}
            >
              {MONTH_LABELS.map((label, index) => {
                const m = index + 1;
                const selected = m === month;
                return (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Selecionar mês ${label}`}
                    onPress={() => setMonth(m)}
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
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.periodLabel, { marginTop: 12 }]}>Ano</Text>
            <View style={styles.yearRow}>
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((value) => {
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
                styles={styles}
                colors={colors}
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
                styles={styles}
                colors={colors}
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
                styles={styles}
                colors={colors}
              />
            </View>
          )}

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
        styles={styles}
        colors={colors}
        onSave={handleSaveGoal}
        onClose={() => setGoalModalVisible(false)}
      />

      <AppSnackbar
        visible={snackbar != null}
        type={snackbar?.type ?? 'info'}
        message={snackbar?.message ?? ''}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}
