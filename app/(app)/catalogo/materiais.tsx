import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppCard,
  AppInput,
  AppSnackbar,
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenContainer,
  StatusBadge,
} from '../../../src/components/ui';
import type { AppSnackbarType } from '../../../src/components/ui';
import { CatalogItemFormModal } from '../../../src/components/catalog/CatalogItemFormModal';
import type { CatalogItemFormValues } from '../../../src/components/catalog/CatalogItemFormModal';
import { catalogService } from '../../../src/services/api/catalog';
import { toApiError } from '../../../src/services/api/client';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { useDebouncedValue } from '../../../src/hooks/useDebouncedValue';
import { formatCurrency } from '../../../src/utils/format';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { CreateMaterialInput, MaterialItem } from '../../../src/types/catalog';

const SEARCH_DEBOUNCE_MS = 400;
const LIST_LIMIT = 100;

export default function CatalogMaterialsScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company.id);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: AppSnackbarType;
  } | null>(null);

  const baseQueryKey = ['company', companyId, 'catalog', 'materials'];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [...baseQueryKey, { search: debouncedSearch }],
    queryFn: () =>
      catalogService.listMaterials({
        search: debouncedSearch || undefined,
        limit: LIST_LIMIT,
      }),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateMaterialInput) =>
      catalogService.createMaterial(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
      setModalVisible(false);
      setSnackbar({ message: 'Material criado com sucesso', type: 'success' });
    },
    onError: (err) => {
      setSnackbar({ message: toApiError(err).message, type: 'error' });
    },
  });

  function handleSubmit(values: CatalogItemFormValues) {
    createMutation.mutate({
      name: values.name,
      description: values.description,
      unit: values.unit,
      price: values.price,
      cost: values.cost,
      status: values.status,
      stockQty: values.stockQty,
      minStockQty: values.minStockQty,
    });
  }

  if (!companyId) {
    return <LoadingState text="Carregando..." />;
  }

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Materiais' }} />

      <View style={styles.header}>
        <Text style={styles.title}>Materiais</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Adicionar material"
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Ionicons
            name="add"
            size={sizes.icon.xl}
            color={colors.textOnPrimary}
            accessibilityElementsHidden
          />
        </Pressable>
      </View>

      <View style={styles.searchWrapper}>
        <AppInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar materiais..."
          accessibilityLabel="Buscar materiais"
          style={styles.searchInput}
          leftAccessory={
            <Ionicons
              name="search"
              size={sizes.icon.md}
              color={colors.textLight}
              accessibilityElementsHidden
            />
          }
          rightAccessory={
            search ? (
              <Pressable
                onPress={() => setSearch('')}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={sizes.icon.lg}
                  color={colors.textLight}
                />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {isLoading ? (
        <LoadingState text="Carregando materiais..." />
      ) : isError ? (
        <ErrorState
          message={toApiError(error).message}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MaterialCard material={item} />}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              title="Nenhum material cadastrado"
              description={
                debouncedSearch
                  ? 'Nenhum material encontrado para a busca.'
                  : 'Toque em + para cadastrar o primeiro material.'
              }
              icon="layers-outline"
              actionLabel="Cadastrar material"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      )}

      <CatalogItemFormModal
        visible={modalVisible}
        title="Novo material"
        submitLabel="Criar material"
        includeStockFields
        submitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onClose={() => setModalVisible(false)}
      />

      <AppSnackbar
        visible={snackbar != null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}

function MaterialCard({ material }: { material: MaterialItem }) {
  const router = useRouter();
  const isActive = material.status === 'ACTIVE';
  const stockQty = material.stockQty ?? 0;
  const minStockQty = material.minStockQty ?? 0;
  const lowStock = stockQty <= minStockQty;

  return (
    <Pressable
      onPress={() => router.push(`/catalogo/${material.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${material.name}`}
    >
      <AppCard shadow="light" radius={radius.lg} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="layers-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>
                {material.name}
              </Text>
              <StatusBadge
                status={isActive ? 'active' : 'cancelled'}
                label={isActive ? 'Ativo' : 'Inativo'}
                size="sm"
              />
            </View>

            {material.description ? (
              <Text style={styles.cardDescription} numberOfLines={2}>
                {material.description}
              </Text>
            ) : null}

            <View style={styles.cardMeta}>
              <Text style={styles.cardPrice}>{formatCurrency(material.price)}</Text>
              <Text style={styles.cardUnit}>{material.unit}</Text>
            </View>

            <View style={styles.stockRow}>
              <Ionicons
                name={lowStock ? 'alert-circle' : 'cube-outline'}
                size={sizes.icon.sm}
                color={lowStock ? colors.warning : colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text
                style={[
                  styles.stockText,
                  lowStock && styles.stockTextLow,
                ]}
              >
                Estoque: {stockQty} · Mínimo: {minStockQty}
              </Text>
              {lowStock ? (
                <StatusBadge status="warning" label="Estoque baixo" size="sm" />
              ) : null}
            </View>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes['2xl'],
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
  addButtonPressed: {
    opacity: 0.85,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
    flexGrow: 1,
  },
  card: {
    padding: spacing.lg,
  },
  cardContent: {
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
  cardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  cardMeta: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  cardPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  cardUnit: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  stockRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  stockTextLow: {
    color: colors.warning,
    fontWeight: typography.weights.semibold,
  },
});
