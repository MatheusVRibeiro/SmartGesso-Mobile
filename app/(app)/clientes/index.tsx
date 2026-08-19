import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { clientsService } from '../../../src/services/api/clients';
import { toApiError } from '../../../src/services/api/client';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { Client } from '../../../src/types/client';

interface SnackbarState {
  type: AppSnackbarType;
  message: string;
}

export default function ClientesListScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);
  const params = useLocalSearchParams<{ created?: string; deleted?: string }>();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const shownFeedbackRef = useRef<string | null>(null);

  // Busca com debounce (300ms) antes de refetchar com ?search=
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Feedback de sucesso vindo de novo.tsx (created) e [id].tsx (deleted)
  useEffect(() => {
    const feedback =
      params.created === '1' ? 'created' : params.deleted === '1' ? 'deleted' : null;

    if (feedback) {
      if (shownFeedbackRef.current !== feedback) {
        shownFeedbackRef.current = feedback;
        setSnackbar({
          type: 'success',
          message:
            feedback === 'created'
              ? 'Cliente criado com sucesso'
              : 'Cliente excluído com sucesso',
        });
      }
      router.setParams(feedback === 'created' ? { created: undefined } : { deleted: undefined });
    } else {
      shownFeedbackRef.current = null;
    }
  }, [params.created, params.deleted, router]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['company', companyId, 'clients', search],
    queryFn: () => clientsService.list({ search: search || undefined }),
    enabled: Boolean(companyId),
  });

  // A API real retorna array puro (Client[]); o tipo declara { data, total } — aceita ambos.
  const clients: Client[] = Array.isArray(data) ? data : (data?.data ?? []);

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      onPress={() => router.push(`/clientes/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir cliente ${item.name}`}
      activeOpacity={0.7}
    >
      <AppCard shadow="light" radius={radius.md} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="person-outline"
                size={sizes.icon.md}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>
                <StatusBadge
                  status="active"
                  label={item.type === 'JURIDICA' ? 'PJ' : 'PF'}
                  size="sm"
                />
              </View>

              {item.whatsapp || item.phone ? (
                <View style={styles.cardRow}>
                  <Ionicons
                    name={item.whatsapp ? 'logo-whatsapp' : 'call-outline'}
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.cardRowText} numberOfLines={1}>
                    {item.whatsapp ?? item.phone}
                  </Text>
                </View>
              ) : null}

              {item.email ? (
                <View style={styles.cardRow}>
                  <Ionicons
                    name="mail-outline"
                    size={sizes.icon.sm}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                  <Text style={styles.cardRowText} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={sizes.icon.md}
            color={colors.textLight}
            accessibilityElementsHidden
          />
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  let content: React.ReactNode;

  if (isLoading) {
    content = <LoadingState text="Carregando clientes..." />;
  } else if (isError) {
    content = <ErrorState message={toApiError(error).message} onRetry={() => refetch()} />;
  } else if (clients.length === 0) {
    content = search ? (
      <EmptyState
        title="Nenhum cliente encontrado"
        description={`Nenhum resultado para "${search}". Tente outro termo.`}
        icon="search-outline"
      />
    ) : (
      <EmptyState
        title="Nenhum cliente"
        description="Cadastre seu primeiro cliente para começar."
        icon="people-outline"
        actionLabel="Cadastrar cliente"
        onAction={() => router.push('/clientes/novo')}
      />
    );
  } else {
    content = (
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    );
  }

  return (
    <ScreenContainer padding keyboard={false}>
      <Stack.Screen options={{ title: 'Clientes' }} />

      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity
          onPress={() => router.push('/clientes/novo')}
          accessibilityRole="button"
          accessibilityLabel="Novo cliente"
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.lg} color={colors.white} accessibilityElementsHidden />
        </TouchableOpacity>
      </View>

      <AppInput
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Buscar por nome, CPF/CNPJ ou e-mail"
        accessibilityLabel="Buscar clientes"
        autoCapitalize="none"
        autoCorrect={false}
        leftAccessory={
          <Ionicons
            name="search"
            size={sizes.icon.md}
            color={colors.textLight}
            accessibilityElementsHidden
          />
        }
        rightAccessory={
          searchInput.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchInput('')}
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              hitSlop={8}
            >
              <Ionicons
                name="close-circle"
                size={sizes.icon.md}
                color={colors.textLight}
                accessibilityElementsHidden
              />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {content}

      <AppSnackbar
        visible={snackbar !== null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type ?? 'success'}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  addButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },
  card: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardName: {
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
  cardRowText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
