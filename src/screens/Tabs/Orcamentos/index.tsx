import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { quotesService } from '@/src/services/api/quotes';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/format';
import type { QuoteStatus, QuoteSummary } from '@/src/types/quote';
import { createOrcamentosStyles } from './styles';

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
  if (Number.isNaN(validUntil.getTime())) return false;
  validUntil.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return validUntil.getTime() < today.getTime();
}

interface QuoteCardProps {
  quote: {
    id: string;
    quoteNumber: number;
    version: number;
    status: QuoteStatus;
    total: number;
    validUntil?: string | null;
    client?: { id: string; name: string };
  };
  onPress: () => void;
  styles: ReturnType<typeof createOrcamentosStyles>;
  colors: any;
}

function QuoteCard({ quote, onPress, styles, colors }: QuoteCardProps) {
  const badge = isQuoteExpired(quote)
    ? { variant: 'expired' as const, label: 'Vencido' }
    : QUOTE_STATUS_BADGE[quote.status];

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver orçamento ${quote.quoteNumber} versão ${quote.version}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardInfo}>
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

            <Text style={styles.cardTotal}>{formatCurrency(quote.total)}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={sizes.icon.md}
            color={colors.textLight}
            accessibilityElementsHidden
          />
        </View>
      </Pressable>
    </AppCard>
  );
}

function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result && Array.isArray((result as any).data)) {
    return (result as { data: T[] }).data;
  }
  if (result && typeof result === 'object' && 'items' in result && Array.isArray((result as any).items)) {
    return (result as { items: T[] }).items;
  }
  return [];
}

export default function OrcamentosScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createOrcamentosStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);

  const [selectedFilter, setSelectedFilter] = useState<'TODOS' | 'RASCUNHO' | 'ENVIADO' | 'APROVADO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

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
    select: (result) => toArray<QuoteSummary>(result),
    enabled: Boolean(companyId),
  });

  const filteredQuotes = useMemo(() => {
    const list = toArray<QuoteSummary>(quotes);
    return list.filter((q) => {
      const matchFilter =
        selectedFilter === 'TODOS' ||
        (selectedFilter === 'RASCUNHO' && q.status === 'RASCUNHO') ||
        (selectedFilter === 'ENVIADO' && (q.status === 'ENVIADO' || q.status === 'AGUARDANDO_APROVACAO')) ||
        (selectedFilter === 'APROVADO' && q.status === 'APROVADO');

      const matchSearch =
        !searchQuery.trim() ||
        q.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(q.quoteNumber).includes(searchQuery);

      return matchFilter && matchSearch;
    });
  }, [quotes, selectedFilter, searchQuery]);

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Orçamentos', headerShown: false }} />

      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Orçamentos</Text>
          <AppButton
            title="+ Novo"
            size="sm"
            accessibilityLabel="Novo orçamento"
            onPress={() => router.push('/orcamentos/novo')}
            style={styles.addButton}
          />
        </View>

        {/* Barra de Busca Rápida */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente ou número..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Chips de Filtro */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['TODOS', 'RASCUNHO', 'ENVIADO', 'APROVADO'] as const).map((fil) => {
            const isActive = selectedFilter === fil;
            const labelMap = {
              TODOS: 'Todos',
              RASCUNHO: 'Rascunho',
              ENVIADO: 'Enviados',
              APROVADO: 'Aprovados',
            };
            return (
              <TouchableOpacity
                key={fil}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(fil)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {labelMap[fil]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando orçamentos..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : filteredQuotes.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento cadastrado'}
          description={
            searchQuery
              ? 'Tente buscar com outro termo ou filtro'
              : 'Comece criando seu primeiro orçamento para um cliente'
          }
          icon="document-text-outline"
          actionLabel="+ Criar orçamento"
          onAction={() => router.push('/orcamentos/novo')}
        />
      ) : (
        <FlatList
          data={filteredQuotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuoteCard
              quote={item}
              onPress={() => router.push(`/orcamentos/${item.id}`)}
              styles={styles}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
    </ScreenContainer>
  );
}
