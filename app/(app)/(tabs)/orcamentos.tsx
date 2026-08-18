import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { toApiError } from '../../../src/services/api/client';
import { quotesService } from '../../../src/services/api/quotes';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, sizes, spacing, typography } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';
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

// ─── Card de orçamento ─────────────────────────────────────────────────────

interface QuoteCardProps {
  quote: {
    id: string;
    quoteNumber: number;
    version: number;
    status: QuoteStatus;
    total: number;
    client?: { id: string; name: string };
    createdAt: string;
  };
  onPress: () => void;
}

function QuoteCard({ quote, onPress }: QuoteCardProps) {
  const badge = QUOTE_STATUS_BADGE[quote.status];

  return (
    <AppCard shadow="light" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver orçamento ${quote.quoteNumber} versão ${quote.version}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            #{quote.quoteNumber} v{quote.version}
          </Text>
          <StatusBadge status={badge.variant} label={badge.label} size="sm" />
        </View>

        <View style={styles.cardRow}>
          <Ionicons
            name="person-outline"
            size={sizes.icon.sm}
            color={colors.textSecondary}
            accessibilityElementsHidden
          />
          <Text style={styles.cardText} numberOfLines={1}>
            {quote.client?.name ?? 'Cliente não informado'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{formatDate(quote.createdAt)}</Text>
          <Text style={styles.cardTotal}>{formatCurrency(quote.total)}</Text>
        </View>
      </Pressable>
    </AppCard>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function OrcamentosScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const {
    data: quotes,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'quotes'],
    queryFn: () => quotesService.list(),
    enabled: Boolean(companyId),
  });

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Orçamentos', headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Orçamentos</Text>
        <AppButton
          title="+"
          size="md"
          accessibilityLabel="Novo orçamento"
          onPress={() => router.push('/orcamentos/novo')}
          style={styles.addButton}
        />
      </View>

      {isLoading ? (
        <LoadingState text="Carregando orçamentos..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : quotes && quotes.length === 0 ? (
        <EmptyState
          title="Nenhum orçamento cadastrado"
          description="Comece criando seu primeiro orçamento para um cliente"
          icon="document-text-outline"
          actionLabel="Novo orçamento"
          onAction={() => router.push('/orcamentos/novo')}
        />
      ) : (
        <FlatList
          data={quotes ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuoteCard
              quote={item}
              onPress={() => router.push(`/orcamentos/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  addButton: {
    minWidth: sizes.touchTarget,
    paddingHorizontal: 0,
  },
  listContent: {
    padding: sizes.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing['3xl'],
  },
  card: {
    marginBottom: spacing.md,
  },
  cardPressable: {
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardDate: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  cardTotal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
