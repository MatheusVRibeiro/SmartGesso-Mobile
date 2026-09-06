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
import { CatalogItemFormModal } from '@/src/components/catalog/CatalogItemFormModal';
import type { CatalogItemFormValues } from '@/src/components/catalog/CatalogItemFormModal';
import { catalogService } from '@/src/services/api/catalog';
import { toApiError } from '@/src/services/api/client';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { formatCurrency } from '@/src/utils/format';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { CreateCatalogItemInput, ServiceItem } from '@/src/types/catalog';
import { createCatalogoServicosStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const SEARCH_DEBOUNCE_MS = 400;
const LIST_LIMIT = 100;

export default function CatalogServicesScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoServicosStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company.id);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: AppSnackbarType;
  } | null>(null);

  const baseQueryKey = ['company', companyId, 'catalog', 'services'];

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
      catalogService.listServices({
        search: debouncedSearch || undefined,
        limit: LIST_LIMIT,
      }),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCatalogItemInput) =>
      catalogService.createService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
      setModalVisible(false);
      setSnackbar({ message: 'Serviço criado com sucesso', type: 'success' });
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
      <Stack.Screen options={{ title: 'Serviços' }} />

      <View style={styles.header}>
        <Text style={styles.title}>Serviços</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Adicionar serviço"
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
          placeholder="Buscar serviços..."
          accessibilityLabel="Buscar serviços"
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
        <LoadingState text="Carregando serviços..." />
      ) : isError ? (
        <ErrorState
          message={toApiError(error).message}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ServiceCard service={item} />}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              title="Nenhum serviço cadastrado"
              description={
                debouncedSearch
                  ? 'Nenhum serviço encontrado para a busca.'
                  : 'Toque em + para cadastrar o primeiro serviço.'
              }
              icon="hammer-outline"
              actionLabel="Cadastrar serviço"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      )}

      <CatalogItemFormModal
        visible={modalVisible}
        title="Novo serviço"
        submitLabel="Criar serviço"
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

function ServiceCard({ service }: { service: ServiceItem }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoServicosStyles(colors, isDark), [colors, isDark]);
  const isActive = service.status === 'ACTIVE';

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardIcon}>
          <Ionicons
            name="construct-outline"
            size={sizes.icon.md}
            color={colors.primary}
            accessibilityElementsHidden
          />
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName} numberOfLines={1}>
              {service.name}
            </Text>
            <StatusBadge
              status={isActive ? 'active' : 'cancelled'}
              label={isActive ? 'Ativo' : 'Inativo'}
              size="sm"
            />
          </View>

          {service.description ? (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {service.description}
            </Text>
          ) : null}

          <View style={styles.cardMeta}>
            <Text style={styles.cardPrice}>{formatCurrency(service.price)}</Text>
            <Text style={styles.cardUnit}>{service.unit}</Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
