import React, { useState, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Stack } from 'expo-router';
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
} from '@/src/components/ui';
import type { AppSnackbarType } from '@/src/components/ui';
import {
  CatalogItemFormModal,
} from '@/src/components/catalog/CatalogItemFormModal';
import type { CatalogItemFormValues } from '@/src/components/catalog/CatalogItemFormModal';
import { catalogService } from '@/src/services/api/catalog';
import { toApiError } from '@/src/services/api/client';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { formatCurrency } from '@/src/utils/format';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { CreateCatalogItemInput, Product } from '@/src/types/catalog';
import { createCatalogoProdutosStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const SEARCH_DEBOUNCE_MS = 400;
const LIST_LIMIT = 100;

export default function CatalogProductsScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoProdutosStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company.id);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: AppSnackbarType;
  } | null>(null);

  const baseQueryKey = ['company', companyId, 'catalog', 'products'];

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
      catalogService.listProducts({
        search: debouncedSearch || undefined,
        limit: LIST_LIMIT,
      }),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCatalogItemInput) =>
      catalogService.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
      setModalVisible(false);
      setSnackbar({ message: 'Produto criado com sucesso', type: 'success' });
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
    });
  }

  if (!companyId) {
    return <LoadingState text="Carregando..." />;
  }

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ title: 'Produtos' }} />

      <View style={styles.header}>
        <Text style={styles.title}>Produtos</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Adicionar produto"
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
          placeholder="Buscar produtos..."
          accessibilityLabel="Buscar produtos"
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
        <LoadingState text="Carregando produtos..." />
      ) : isError ? (
        <ErrorState
          message={toApiError(error).message}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              title="Nenhum produto cadastrado"
              description={
                debouncedSearch
                  ? 'Nenhum produto encontrado para a busca.'
                  : 'Toque em + para cadastrar o primeiro produto.'
              }
              icon="cube-outline"
              actionLabel="Cadastrar produto"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      )}

      <CatalogItemFormModal
        visible={modalVisible}
        title="Novo produto"
        submitLabel="Criar produto"
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

function ProductCard({ product }: { product: Product }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoProdutosStyles(colors, isDark), [colors, isDark]);
  const isActive = product.status === 'ACTIVE';

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardIcon}>
          <Ionicons
            name="cube-outline"
            size={sizes.icon.md}
            color={colors.primary}
            accessibilityElementsHidden
          />
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName} numberOfLines={1}>
              {product.name}
            </Text>
            <StatusBadge
              status={isActive ? 'active' : 'cancelled'}
              label={isActive ? 'Ativo' : 'Inativo'}
              size="sm"
            />
          </View>

          {product.description ? (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {product.description}
            </Text>
          ) : null}

          <View style={styles.cardMeta}>
            <Text style={styles.cardPrice}>{formatCurrency(product.price)}</Text>
            <Text style={styles.cardUnit}>{product.unit}</Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
