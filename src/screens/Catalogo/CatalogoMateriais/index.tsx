import React, { useState, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
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
} from '@/src/components/ui';
import type { AppSnackbarType } from '@/src/components/ui';
import { CatalogItemFormModal } from '@/src/components/catalog/CatalogItemFormModal';
import type { CatalogItemFormValues } from '@/src/components/catalog/CatalogItemFormModal';
import { catalogService } from '@/src/services/api/catalog';
import { inventoryService } from '@/src/services/api/inventory';
import { toApiError } from '@/src/services/api/client';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { formatCurrency } from '@/src/utils/format';
import { radius, sizes, spacing, typography } from '@/src/theme';
import type { CreateMaterialInput, MaterialItem, UpdateCatalogItemInput } from '@/src/types/catalog';
import { createCatalogoMateriaisStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const SEARCH_DEBOUNCE_MS = 350;

type FilterType = 'todos' | 'alerta' | 'zerado' | 'ativos' | 'inativos';

interface MaterialVisualMeta {
  icon: keyof typeof Ionicons.glyphMap;
  bgLight: string;
  bgDark: string;
  accent: string;
}

/** Identifica o tipo de insumo pelo nome para exibir ícone e cor contextual. */
function getMaterialVisualMeta(name: string): MaterialVisualMeta {
  const lower = name.toLowerCase();
  if (lower.includes('placa') || lower.includes('drywall') || lower.includes('ru') || lower.includes('st')) {
    return {
      icon: 'grid-outline',
      bgLight: 'rgba(59, 130, 246, 0.12)',
      bgDark: 'rgba(59, 130, 246, 0.2)',
      accent: '#3B82F6',
    };
  }
  if (lower.includes('perfil') || lower.includes('canaleta') || lower.includes('f530') || lower.includes('montante') || lower.includes('guia')) {
    return {
      icon: 'reorder-two-outline',
      bgLight: 'rgba(99, 102, 241, 0.12)',
      bgDark: 'rgba(99, 102, 241, 0.2)',
      accent: '#6366F1',
    };
  }
  if (lower.includes('parafuso') || lower.includes('bucha') || lower.includes('gn 25') || lower.includes('regulador') || lower.includes('pendural')) {
    return {
      icon: 'hardware-chip-outline',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      bgDark: 'rgba(245, 158, 11, 0.2)',
      accent: '#F59E0B',
    };
  }
  if (lower.includes('fita')) {
    return {
      icon: 'bandage-outline',
      bgLight: 'rgba(168, 85, 247, 0.12)',
      bgDark: 'rgba(168, 85, 247, 0.2)',
      accent: '#A855F7',
    };
  }
  if (lower.includes('massa') || lower.includes('gesso')) {
    return {
      icon: 'color-fill-outline',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      bgDark: 'rgba(16, 185, 129, 0.2)',
      accent: '#10B981',
    };
  }
  return {
    icon: 'layers-outline',
    bgLight: 'rgba(100, 116, 139, 0.12)',
    bgDark: 'rgba(100, 116, 139, 0.2)',
    accent: '#64748B',
  };
}

export default function CatalogMaterialsScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoMateriaisStyles(colors, isDark), [colors, isDark]);
  const companyId = useSessionStore((s) => s.activeCompany?.company.id);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todos');

  // Modal de criação / edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

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
      inventoryService.listMaterials({
        search: debouncedSearch || undefined,
      }),
    enabled: !!companyId,
  });

  const materials = useMemo(() => data ?? [], [data]);

  // ─── Métricas ─────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = materials.length;
    let lowStockCount = 0;
    let zeroStockCount = 0;
    let activeCount = 0;
    let totalPrice = 0;
    let withPriceCount = 0;

    for (const m of materials) {
      if (m.status === 'ACTIVE') activeCount++;
      const stock = m.stockQty ?? 0;
      const min = m.minStockQty ?? 0;
      if (stock === 0) zeroStockCount++;
      if (stock <= min && min > 0) lowStockCount++;
      if (m.price != null && Number(m.price) > 0) {
        totalPrice += Number(m.price);
        withPriceCount++;
      }
    }

    const avgPrice = withPriceCount > 0 ? totalPrice / withPriceCount : 0;

    return {
      total,
      activeCount,
      inactiveCount: total - activeCount,
      lowStockCount,
      zeroStockCount,
      avgPrice,
      withPriceCount,
    };
  }, [materials]);

  // ─── Filtros ──────────────────────────────────────────────────────────────
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const stock = m.stockQty ?? 0;
      const min = m.minStockQty ?? 0;
      switch (activeFilter) {
        case 'alerta':
          return stock <= min && min > 0;
        case 'zerado':
          return stock === 0;
        case 'ativos':
          return m.status === 'ACTIVE';
        case 'inativos':
          return m.status !== 'ACTIVE';
        case 'todos':
        default:
          return true;
      }
    });
  }, [materials, activeFilter]);

  // ─── Mutações ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (input: CreateMaterialInput) =>
      catalogService.createMaterial(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
      setModalVisible(false);
      setEditingMaterial(null);
      setSnackbar({ message: 'Material criado com sucesso!', type: 'success' });
    },
    onError: (err) => {
      setSnackbar({ message: toApiError(err).message, type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCatalogItemInput }) =>
      catalogService.updateMaterial(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
      setModalVisible(false);
      setEditingMaterial(null);
      setSnackbar({ message: 'Material atualizado com sucesso!', type: 'success' });
    },
    onError: (err) => {
      setSnackbar({ message: toApiError(err).message, type: 'error' });
    },
  });

  const seedMutation = useMutation<{ success: boolean; materialsAdded: number; servicesAdded: number }>({
    mutationFn: () => catalogService.seedDefaults(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
      const added = res?.materialsAdded ?? 0;
      setSnackbar({
        message: added > 0
          ? `${added} materiais padrão adicionados com sucesso!`
          : 'Os materiais padrão já estão no catálogo.',
        type: 'success',
      });
    },
    onError: (err) => {
      setSnackbar({ message: toApiError(err).message, type: 'error' });
    },
  });

  function handleOpenCreate() {
    setEditingMaterial(null);
    setModalVisible(true);
  }

  function handleOpenEdit(material: MaterialItem) {
    setEditingMaterial(material);
    setModalVisible(true);
  }

  function handleSubmit(values: CatalogItemFormValues) {
    if (editingMaterial) {
      updateMutation.mutate({
        id: editingMaterial.id,
        input: {
          name: values.name,
          description: values.description,
          unit: values.unit,
          price: values.price,
          cost: values.cost,
          status: values.status,
        },
      });
    } else {
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
  }

  if (!companyId) {
    return <LoadingState text="Carregando..." />;
  }

  return (
    <ScreenContainer padding={false} keyboard={false} maxContentWidth={1040}>
      <Stack.Screen options={{ title: 'Catálogo de Materiais' }} />

      {isLoading ? (
        <LoadingState text="Carregando materiais..." />
      ) : isError ? (
        <ErrorState
          message={toApiError(error).message}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={filteredMaterials}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MaterialCard
                material={item}
                onEdit={() => handleOpenEdit(item)}
              />
            </View>
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              {/* Header Superior */}
              <View style={styles.header}>
                <View style={styles.headerTop}>
                  <View style={styles.headerTitles}>
                    <Text style={styles.title}>Catálogo de Materiais</Text>
                    <Text style={styles.subtitle}>
                      Custos, preços de orçamento e controle de estoque
                    </Text>
                  </View>

                  <View style={styles.headerActions}>
                    {materials.length === 0 && (
                      <Pressable
                        onPress={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending}
                        accessibilityRole="button"
                        accessibilityLabel="Carregar materiais padrão"
                        style={({ pressed }) => [
                          styles.headerSecondaryButton,
                          pressed && styles.headerSecondaryButtonPressed,
                        ]}
                      >
                        <Ionicons
                          name="sparkles-outline"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.headerSecondaryButtonText}>
                          {seedMutation.isPending ? 'Carregando...' : 'Restaurar Padrões'}
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={handleOpenCreate}
                      accessibilityRole="button"
                      accessibilityLabel="Adicionar material"
                      style={({ pressed }) => [
                        styles.primaryAddButton,
                        pressed && styles.primaryAddButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name="add"
                        size={sizes.icon.md}
                        color={colors.textOnPrimary}
                      />
                      <Text style={styles.primaryAddButtonText}>Novo Material</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Cards de Métricas / Resumo */}
              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="layers-outline" size={14} color={colors.primary} />
                    <Text style={styles.metricLabel}>Total Insumos</Text>
                  </View>
                  <Text style={styles.metricValue}>{metrics.total}</Text>
                  <Text style={styles.metricSub}>{metrics.activeCount} ativos</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons
                      name={metrics.lowStockCount > 0 ? 'alert-circle' : 'checkmark-circle-outline'}
                      size={14}
                      color={metrics.lowStockCount > 0 ? colors.warning : colors.success}
                    />
                    <Text style={styles.metricLabel}>Alerta Estoque</Text>
                  </View>
                  <Text
                    style={[
                      styles.metricValue,
                      metrics.lowStockCount > 0 && { color: colors.warning },
                    ]}
                  >
                    {metrics.lowStockCount}
                  </Text>
                  <Text style={styles.metricSub}>
                    {metrics.lowStockCount > 0 ? 'precisam reposição' : 'estoque regular'}
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="pricetag-outline" size={14} color={colors.success} />
                    <Text style={styles.metricLabel}>Preço Médio</Text>
                  </View>
                  <Text style={styles.metricValue}>
                    {metrics.avgPrice > 0 ? formatCurrency(metrics.avgPrice) : 'R$ 0,00'}
                  </Text>
                  <Text style={styles.metricSub}>{metrics.withPriceCount} com preço</Text>
                </View>
              </View>

              {/* Campo de Busca */}
              <View style={styles.searchWrapper}>
                <AppInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar placa, perfil, fita, parafuso, massa..."
                  accessibilityLabel="Buscar materiais"
                  style={styles.searchInput}
                  leftAccessory={
                    <Ionicons
                      name="search"
                      size={sizes.icon.md}
                      color={colors.textLight}
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

              {/* Filtros em Chips */}
              <View style={styles.filtersContainer}>
                <Pressable
                  onPress={() => setActiveFilter('todos')}
                  style={[
                    styles.filterChip,
                    activeFilter === 'todos' && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === 'todos' && styles.filterChipTextActive,
                    ]}
                  >
                    Todos
                  </Text>
                  <View
                    style={[
                      styles.filterBadge,
                      activeFilter === 'todos' && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        activeFilter === 'todos' && styles.filterBadgeTextActive,
                      ]}
                    >
                      {metrics.total}
                    </Text>
                  </View>
                </Pressable>

                {metrics.lowStockCount > 0 && (
                  <Pressable
                    onPress={() => setActiveFilter('alerta')}
                    style={[
                      styles.filterChip,
                      activeFilter === 'alerta' && styles.filterChipActive,
                    ]}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={13}
                      color={activeFilter === 'alerta' ? colors.textOnPrimary : colors.warning}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilter === 'alerta' && styles.filterChipTextActive,
                      ]}
                    >
                      Estoque Baixo
                    </Text>
                    <View
                      style={[
                        styles.filterBadge,
                        activeFilter === 'alerta' && styles.filterBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          activeFilter === 'alerta' && styles.filterBadgeTextActive,
                        ]}
                      >
                        {metrics.lowStockCount}
                      </Text>
                    </View>
                  </Pressable>
                )}

                {metrics.zeroStockCount > 0 && (
                  <Pressable
                    onPress={() => setActiveFilter('zerado')}
                    style={[
                      styles.filterChip,
                      activeFilter === 'zerado' && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilter === 'zerado' && styles.filterChipTextActive,
                      ]}
                    >
                      Sem Estoque
                    </Text>
                    <View
                      style={[
                        styles.filterBadge,
                        activeFilter === 'zerado' && styles.filterBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          activeFilter === 'zerado' && styles.filterBadgeTextActive,
                        ]}
                      >
                        {metrics.zeroStockCount}
                      </Text>
                    </View>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => setActiveFilter('ativos')}
                  style={[
                    styles.filterChip,
                    activeFilter === 'ativos' && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === 'ativos' && styles.filterChipTextActive,
                    ]}
                  >
                    Ativos
                  </Text>
                  <View
                    style={[
                      styles.filterBadge,
                      activeFilter === 'ativos' && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        activeFilter === 'ativos' && styles.filterBadgeTextActive,
                      ]}
                    >
                      {metrics.activeCount}
                    </Text>
                  </View>
                </Pressable>

                {metrics.inactiveCount > 0 && (
                  <Pressable
                    onPress={() => setActiveFilter('inativos')}
                    style={[
                      styles.filterChip,
                      activeFilter === 'inativos' && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilter === 'inativos' && styles.filterChipTextActive,
                      ]}
                    >
                      Inativos
                    </Text>
                    <View
                      style={[
                        styles.filterBadge,
                        activeFilter === 'inativos' && styles.filterBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          activeFilter === 'inativos' && styles.filterBadgeTextActive,
                        ]}
                      >
                        {metrics.inactiveCount}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title={
                debouncedSearch || activeFilter !== 'todos'
                  ? 'Nenhum material encontrado'
                  : 'Nenhum material cadastrado'
              }
              description={
                debouncedSearch
                  ? `Nenhum resultado para "${debouncedSearch}".`
                  : activeFilter !== 'todos'
                  ? 'Nenhum material com o filtro selecionado.'
                  : 'Cadastre seus insumos ou carregue os padrões de drywall com 1 clique.'
              }
              icon="layers-outline"
              actionLabel={
                materials.length === 0
                  ? 'Carregar Materiais Padrão'
                  : 'Cadastrar Novo Material'
              }
              onAction={() => {
                if (materials.length === 0) {
                  seedMutation.mutate();
                } else {
                  handleOpenCreate();
                }
              }}
            />
          }
        />
      )}

      {/* Modal de Criação / Edição de Material */}
      <CatalogItemFormModal
        visible={modalVisible}
        title={editingMaterial ? 'Editar material' : 'Novo material'}
        submitLabel={editingMaterial ? 'Salvar alterações' : 'Criar material'}
        includeStockFields={!editingMaterial}
        initialValues={
          editingMaterial
            ? {
                name: editingMaterial.name,
                description: editingMaterial.description ?? '',
                unit: editingMaterial.unit,
                price: editingMaterial.price != null ? Number(editingMaterial.price) : undefined,
                cost: editingMaterial.cost != null ? Number(editingMaterial.cost) : undefined,
                status: editingMaterial.status,
              }
            : undefined
        }
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onClose={() => {
          setModalVisible(false);
          setEditingMaterial(null);
        }}
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

function MaterialCard({
  material,
  onEdit,
}: {
  material: MaterialItem;
  onEdit: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoMateriaisStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();

  const isActive = material.status === 'ACTIVE';
  const stockQty = material.stockQty ?? 0;
  const minStockQty = material.minStockQty ?? 0;
  const isZeroStock = stockQty === 0;
  const isLowStock = stockQty <= minStockQty && minStockQty > 0;

  const visual = useMemo(() => getMaterialVisualMeta(material.name), [material.name]);

  // Margem %
  const marginPct = useMemo(() => {
    if (material.price != null && material.cost != null && Number(material.cost) > 0) {
      const p = Number(material.price);
      const c = Number(material.cost);
      return Math.round(((p - c) / c) * 100);
    }
    return null;
  }, [material.price, material.cost]);

  return (
    <AppCard shadow="light" radius={radius.xl} style={styles.card}>
      <View style={styles.cardMain}>
        {/* Ícone contextual por tipo de material */}
        <Pressable
          onPress={() => router.push(`/catalogo/${material.id}`)}
          style={[
            styles.cardIconBox,
            { backgroundColor: isDark ? visual.bgDark : visual.bgLight },
          ]}
        >
          <Ionicons name={visual.icon} size={22} color={visual.accent} />
        </Pressable>

        {/* Informações Centrais */}
        <View style={styles.cardInfo}>
          <Pressable
            onPress={() => router.push(`/catalogo/${material.id}`)}
            style={{ gap: 4 }}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardNameAndUnit}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {material.name}
                </Text>
                <View style={styles.unitPill}>
                  <Text style={styles.unitPillText}>{material.unit}</Text>
                </View>
              </View>

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

            {/* Faixa Financeira */}
            <View style={styles.financialsStrip}>
              <View style={styles.priceItem}>
                <Text style={styles.financialLabel}>Venda / Orçamento</Text>
                <Text style={styles.priceValue}>
                  {material.price != null ? formatCurrency(material.price) : 'R$ 0,00'}
                </Text>
              </View>

              <View style={styles.priceItem}>
                <Text style={styles.financialLabel}>Custo Unitário</Text>
                <Text style={styles.costValue}>
                  {material.cost != null ? formatCurrency(material.cost) : 'Não inf.'}
                </Text>
              </View>

              {marginPct != null ? (
                <View style={styles.marginBadge}>
                  <Ionicons name="trending-up-outline" size={12} color={colors.success} />
                  <Text style={styles.marginText}>+{marginPct}%</Text>
                </View>
              ) : null}
            </View>
          </Pressable>

          {/* Faixa de Estoque e Ações Rápidas */}
          <View style={styles.stockRow}>
            <Pressable
              onPress={() => router.push(`/catalogo/${material.id}`)}
              style={styles.stockLeft}
            >
              <Ionicons
                name={
                  isZeroStock
                    ? 'close-circle-outline'
                    : isLowStock
                    ? 'alert-circle'
                    : 'cube-outline'
                }
                size={14}
                color={
                  isZeroStock
                    ? colors.danger
                    : isLowStock
                    ? colors.warning
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.stockText,
                  isZeroStock && styles.stockTextDanger,
                  isLowStock && !isZeroStock && styles.stockTextAlert,
                ]}
              >
                {isZeroStock
                  ? 'Sem estoque'
                  : `Estoque: ${stockQty} ${material.unit}`}
                {minStockQty > 0 ? ` · Mín: ${minStockQty}` : ''}
              </Text>
            </Pressable>

            <View style={styles.cardActionRow}>
              <Pressable
                onPress={() => router.push(`/catalogo/movimento?materialId=${material.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Dar entrada em ${material.name}`}
                hitSlop={6}
                style={styles.quickMovementButton}
              >
                <Ionicons name="arrow-down-circle-outline" size={13} color={colors.success} />
                <Text style={styles.quickMovementButtonText}>Entrada / Estoque</Text>
              </Pressable>

              <Pressable
                onPress={onEdit}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${material.name}`}
                hitSlop={6}
                style={styles.quickEditButton}
              >
                <Ionicons name="pencil-outline" size={12} color={colors.primary} />
                <Text style={styles.quickEditButtonText}>Editar</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push(`/catalogo/${material.id}`)}
                hitSlop={6}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textLight}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
