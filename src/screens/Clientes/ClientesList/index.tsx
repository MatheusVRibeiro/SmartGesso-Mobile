import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { BackButton } from '@/src/components/navigation/BackButton';
import { clientsService } from '@/src/services/api/clients';
import { toApiError } from '@/src/services/api/client';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes, spacing, typography } from '@/src/theme';
import type { Client } from '@/src/types/client';
import { createClientesListStyles } from './styles';

interface SnackbarState {
  type: AppSnackbarType;
  message: string;
}

type ClientFilter = 'todos' | 'pf' | 'pj' | 'com_whatsapp';

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatPhoneDigits(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

interface ClienteCardProps {
  item: Client;
  onPress: (clientId: string) => void;
  onNewQuote: (clientId: string) => void;
  styles: ReturnType<typeof createClientesListStyles>;
  colors: ActivePalette;
  isDark: boolean;
}

const ClienteCard = React.memo(function ClienteCard({
  item,
  onPress,
  onNewQuote,
  styles,
  colors,
  isDark,
}: ClienteCardProps) {
  const isPJ = item.type === 'JURIDICA';
  const rawWhatsapp = formatPhoneDigits(item.whatsapp);
  const rawPhone = formatPhoneDigits(item.phone);

  const openWhatsapp = useCallback(() => {
    if (!rawWhatsapp) return;
    const url = `https://wa.me/55${rawWhatsapp}`;
    Linking.openURL(url).catch(() => {});
  }, [rawWhatsapp]);

  const openCall = useCallback(() => {
    if (!rawPhone) return;
    Linking.openURL(`tel:${rawPhone}`).catch(() => {});
  }, [rawPhone]);

  return (
    <View style={styles.cardWrapper}>
      <AppCard
        shadow="none"
        radius={radius.xl}
        style={styles.card}
      >
        <TouchableOpacity
          onPress={() => onPress(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir detalhes de ${item.name}`}
          activeOpacity={0.7}
          style={styles.cardMainPressable}
        >
          {/* Avatar com Iniciais */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isPJ
                  ? isDark
                    ? 'rgba(168, 85, 247, 0.18)'
                    : 'rgba(147, 51, 234, 0.12)'
                  : isDark
                    ? 'rgba(94, 106, 210, 0.18)'
                    : 'rgba(30, 64, 175, 0.12)',
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: isPJ ? (isDark ? '#C084FC' : '#9333EA') : (isDark ? '#8B93E6' : colors.primary) },
              ]}
            >
              {getInitials(item.name)}
            </Text>
          </View>

          {/* Dados do Cliente */}
          <View style={styles.cardInfo}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor: isPJ
                      ? isDark
                        ? 'rgba(168, 85, 247, 0.15)'
                        : 'rgba(147, 51, 234, 0.1)'
                      : isDark
                        ? 'rgba(94, 106, 210, 0.15)'
                        : 'rgba(30, 64, 175, 0.1)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    { color: isPJ ? (isDark ? '#C084FC' : '#9333EA') : (isDark ? '#8B93E6' : colors.primary) },
                  ]}
                >
                  {isPJ ? 'PJ' : 'PF'}
                </Text>
              </View>
            </View>

            <View style={styles.cardMetaRow}>
              {item.document ? (
                <View style={styles.metaItem}>
                  <Ionicons name="card-outline" size={12} color={colors.textLight} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.document}
                  </Text>
                </View>
              ) : null}

              {item.city ? (
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={12} color={colors.textLight} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.city}{item.state ? ` - ${item.state}` : ''}
                  </Text>
                </View>
              ) : null}

              {!item.document && !item.city && item.email ? (
                <View style={styles.metaItem}>
                  <Ionicons name="mail-outline" size={12} color={colors.textLight} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>

        {/* Barra de Ações Rápidas do Card */}
        <View style={styles.cardActionsRow}>
          <View style={styles.quickActionsGroup}>
            {rawWhatsapp ? (
              <TouchableOpacity
                onPress={openWhatsapp}
                style={styles.whatsappButton}
                accessibilityRole="button"
                accessibilityLabel={`Abrir WhatsApp com ${item.name}`}
                hitSlop={4}
              >
                <Ionicons name="logo-whatsapp" size={13} color={isDark ? '#4ADE80' : '#059669'} />
                <Text style={styles.whatsappButtonText}>WhatsApp</Text>
              </TouchableOpacity>
            ) : null}

            {rawPhone ? (
              <TouchableOpacity
                onPress={openCall}
                style={styles.callButton}
                accessibilityRole="button"
                accessibilityLabel={`Ligar para ${item.name}`}
                hitSlop={4}
              >
                <Ionicons name="call-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.callButtonText}>Ligar</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => onNewQuote(item.id)}
              style={styles.quoteButton}
              accessibilityRole="button"
              accessibilityLabel={`Criar orçamento para ${item.name}`}
              hitSlop={4}
            >
              <Ionicons name="document-text-outline" size={13} color={isDark ? '#8B93E6' : colors.primary} />
              <Text style={styles.quoteButtonText}>Orçamento</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => onPress(item.id)}
            style={styles.viewDetailLink}
            hitSlop={4}
          >
            <Text style={styles.viewDetailText}>Ver perfil</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </AppCard>
    </View>
  );
});

export default function ClientesListScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createClientesListStyles(colors, isDark), [colors, isDark]);

  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);
  const params = useLocalSearchParams<{ created?: string; deleted?: string }>();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ClientFilter>('todos');
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const shownFeedbackRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
              ? 'Cliente cadastrado com sucesso'
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

  const rawClients: Client[] = Array.isArray(data) ? data : (data?.data ?? []);

  // Filtros rápidos
  const clients = useMemo(() => {
    return rawClients.filter((c) => {
      switch (activeFilter) {
        case 'pf':
          return c.type === 'FISICA';
        case 'pj':
          return c.type === 'JURIDICA';
        case 'com_whatsapp':
          return Boolean(c.whatsapp && c.whatsapp.trim().length > 0);
        case 'todos':
        default:
          return true;
      }
    });
  }, [rawClients, activeFilter]);

  const countPF = useMemo(() => rawClients.filter((c) => c.type === 'FISICA').length, [rawClients]);
  const countPJ = useMemo(() => rawClients.filter((c) => c.type === 'JURIDICA').length, [rawClients]);
  const countWhatsapp = useMemo(
    () => rawClients.filter((c) => Boolean(c.whatsapp && c.whatsapp.trim().length > 0)).length,
    [rawClients],
  );

  const openCliente = useCallback(
    (clientId: string) => {
      router.push(`/clientes/${clientId}`);
    },
    [router],
  );

  const openNewQuote = useCallback(
    (clientId: string) => {
      router.push({ pathname: '/orcamentos/novo', params: { clientId } });
    },
    [router],
  );

  const renderItem = ({ item }: { item: Client }) => (
    <ClienteCard
      item={item}
      onPress={openCliente}
      onNewQuote={openNewQuote}
      styles={styles}
      colors={colors}
      isDark={isDark}
    />
  );

  return (
    <ScreenContainer padding={false} keyboard={false} maxContentWidth={920}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          {isLoading ? (
            <LoadingState text="Carregando carteira de clientes..." />
          ) : isError ? (
            <ErrorState message={toApiError(error).message} onRetry={() => refetch()} />
          ) : (
            <FlatList
              data={clients}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={styles.list}
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
              ListHeaderComponent={
                <View>
                  {/* Cabeçalho Único com BackButton */}
                  <View style={styles.headerWrapper}>
                    <View style={styles.headerTop}>
                      <View style={styles.headerLeft}>
                        <BackButton fallback="/(app)/(tabs)/mais" />
                        <View style={styles.headerTitles}>
                          <Text style={styles.title}>Clientes</Text>
                          <Text style={styles.subtitle}>
                            {rawClients.length === 1
                              ? '1 cliente cadastrado'
                              : `${rawClients.length} clientes cadastrados`}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => router.push('/clientes/novo')}
                        accessibilityRole="button"
                        accessibilityLabel="Cadastrar novo cliente"
                        style={styles.addButton}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Novo</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Mini Dashboard de Clientes */}
                    <View style={styles.metricsRow}>
                      <TouchableOpacity
                        onPress={() => setActiveFilter('todos')}
                        style={styles.metricCard}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Filtrar todos os clientes"
                      >
                        <View style={styles.metricHeader}>
                          <Ionicons name="people-outline" size={13} color={isDark ? '#8B93E6' : colors.primary} />
                          <Text style={styles.metricLabel}>Total</Text>
                        </View>
                        <Text style={styles.metricValue}>{rawClients.length}</Text>
                        <Text style={styles.metricSub}>Carteira ativa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setActiveFilter(activeFilter === 'pf' ? 'pj' : 'pf')}
                        style={styles.metricCard}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Filtrar por PF ou PJ"
                      >
                        <View style={styles.metricHeader}>
                          <Ionicons name="person-outline" size={13} color={isDark ? '#34D399' : colors.success} />
                          <Text style={styles.metricLabel}>PF / PJ</Text>
                        </View>
                        <Text style={styles.metricValue}>
                          {countPF} <Text style={{ fontSize: 13, color: colors.textSecondary }}>/ {countPJ}</Text>
                        </Text>
                        <Text style={styles.metricSub}>{countPJ > 0 ? `${countPJ} empresa${countPJ === 1 ? '' : 's'}` : `${countPF} PF`}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setActiveFilter('com_whatsapp')}
                        style={styles.metricCard}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Filtrar clientes com WhatsApp"
                      >
                        <View style={styles.metricHeader}>
                          <Ionicons name="logo-whatsapp" size={13} color={isDark ? '#4ADE80' : '#059669'} />
                          <Text style={styles.metricLabel}>WhatsApp</Text>
                        </View>
                        <Text style={styles.metricValue}>{countWhatsapp}</Text>
                        <Text style={styles.metricSub}>Contato direto</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Busca */}
                    <View style={styles.searchContainer}>
                      <AppInput
                        value={searchInput}
                        onChangeText={setSearchInput}
                        placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
                        accessibilityLabel="Buscar clientes"
                        autoCapitalize="none"
                        autoCorrect={false}
                        leftAccessory={
                          <Ionicons
                            name="search"
                            size={sizes.icon.sm}
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
                                size={sizes.icon.sm}
                                color={colors.textLight}
                                accessibilityElementsHidden
                              />
                            </TouchableOpacity>
                          ) : undefined
                        }
                      />
                    </View>
                  </View>

                  {/* Filtros em Chips */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScrollContent}
                  >
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
                          {rawClients.length}
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => setActiveFilter('pf')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'pf' && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={12}
                        color={activeFilter === 'pf' ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'pf' && styles.filterChipTextActive,
                        ]}
                      >
                        Pessoa Física
                      </Text>
                      <View
                        style={[
                          styles.filterBadge,
                          activeFilter === 'pf' && styles.filterBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            activeFilter === 'pf' && styles.filterBadgeTextActive,
                          ]}
                        >
                          {countPF}
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => setActiveFilter('pj')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'pj' && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name="business-outline"
                        size={12}
                        color={activeFilter === 'pj' ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'pj' && styles.filterChipTextActive,
                        ]}
                      >
                        Pessoa Jurídica
                      </Text>
                      <View
                        style={[
                          styles.filterBadge,
                          activeFilter === 'pj' && styles.filterBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            activeFilter === 'pj' && styles.filterBadgeTextActive,
                          ]}
                        >
                          {countPJ}
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => setActiveFilter('com_whatsapp')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'com_whatsapp' && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name="logo-whatsapp"
                        size={12}
                        color={activeFilter === 'com_whatsapp' ? colors.white : '#25D366'}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'com_whatsapp' && styles.filterChipTextActive,
                        ]}
                      >
                        Com WhatsApp
                      </Text>
                      <View
                        style={[
                          styles.filterBadge,
                          activeFilter === 'com_whatsapp' && styles.filterBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            activeFilter === 'com_whatsapp' && styles.filterBadgeTextActive,
                          ]}
                        >
                          {countWhatsapp}
                        </Text>
                      </View>
                    </Pressable>
                  </ScrollView>
                </View>
              }
              ListEmptyComponent={
                search ? (
                  <EmptyState
                    title="Nenhum cliente encontrado"
                    description={`Nenhum resultado para "${search}". Tente outro termo ou limpe os filtros.`}
                    icon="search-outline"
                  />
                ) : (
                  <EmptyState
                    title="Nenhum cliente cadastrado"
                    description="Cadastre seu primeiro cliente para criar orçamentos e gerenciar obras."
                    icon="people-outline"
                    actionLabel="Cadastrar cliente"
                    onAction={() => router.push('/clientes/novo')}
                  />
                )
              }
            />
          )}
        </View>
      </View>

      <AppSnackbar
        visible={snackbar !== null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type ?? 'success'}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}
