import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { BackButton } from '@/src/components/navigation/BackButton';
import { toApiError } from '@/src/services/api/client';
import { loadNotifications } from '@/src/services/notifications';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes, spacing } from '@/src/theme';
import type { Notificacao, NotificationType } from '@/src/types/notification';
import { createNotificacoesStyles } from './styles';

const READ_STORAGE_KEY = '@smartgesso_read_notifications_v1';

type FilterCategory = 'todas' | 'nao_lidas' | 'estoque' | 'orcamentos' | 'financeiro';

interface NotificationConfig {
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  color: string;
  category: 'estoque' | 'orcamentos' | 'financeiro' | 'outros';
  ctaLabel: string;
  route?: string;
}

function getNotificationConfig(type: NotificationType, colors: ActivePalette, isDark: boolean): NotificationConfig {
  switch (type) {
    case 'LOW_STOCK':
      return {
        icon: 'cube-outline',
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.1)',
        color: isDark ? '#F5C366' : '#D97706',
        category: 'estoque',
        ctaLabel: 'Ver no Catálogo / Repor',
        route: '/catalogo/materiais',
      };
    case 'QUOTE_EXPIRING':
      return {
        icon: 'document-text-outline',
        backgroundColor: isDark ? 'rgba(94, 106, 210, 0.15)' : 'rgba(30, 64, 175, 0.1)',
        color: isDark ? '#8B93E6' : colors.primary,
        category: 'orcamentos',
        ctaLabel: 'Ver Orçamentos',
        route: '/orcamentos',
      };
    case 'VISIT_TODAY':
      return {
        icon: 'calendar-outline',
        backgroundColor: isDark ? 'rgba(95, 165, 140, 0.15)' : 'rgba(5, 150, 105, 0.1)',
        color: isDark ? '#5FA58C' : '#059669',
        category: 'orcamentos',
        ctaLabel: 'Ver Agenda',
        route: '/agenda',
      };
    case 'SERVICE_TOMORROW':
    case 'DELIVERY_SOON':
      return {
        icon: type === 'SERVICE_TOMORROW' ? 'hammer-outline' : 'car-outline',
        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(147, 51, 234, 0.1)',
        color: isDark ? '#C084FC' : '#9333EA',
        category: 'orcamentos',
        ctaLabel: 'Ver Ordens de Serviço',
        route: '/servicos',
      };
    case 'PAYMENT_DUE':
      return {
        icon: 'cash-outline',
        backgroundColor: isDark ? 'rgba(240, 113, 113, 0.15)' : 'rgba(220, 38, 38, 0.1)',
        color: isDark ? '#F07171' : '#DC2626',
        category: 'financeiro',
        ctaLabel: 'Ver Financeiro',
        route: '/relatorios/fluxo-caixa',
      };
    default:
      return {
        icon: 'notifications-outline',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        color: colors.textSecondary,
        category: 'outros',
        ctaLabel: 'Ver Detalhes',
      };
  }
}

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function toLocalDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

type Row =
  | { kind: 'header'; id: string; label: string }
  | { kind: 'item'; id: string; item: Notificacao };

export default function NotificacoesScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNotificacoesStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('todas');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Carrega IDs já lidos persistidos localmente
  useEffect(() => {
    AsyncStorage.getItem(READ_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setReadIds(new Set(parsed));
          }
        } catch {}
      }
    });
  }, []);

  const persistReadIds = useCallback((newSet: Set<string>) => {
    setReadIds(newSet);
    AsyncStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
  }, []);

  const markAsRead = useCallback((id: string) => {
    const updated = new Set(readIds);
    updated.add(id);
    persistReadIds(updated);
  }, [readIds, persistReadIds]);

  const {
    data: rawNotifications,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'notificacoes'],
    queryFn: () => loadNotifications(),
    enabled: Boolean(companyId),
  });

  // Aplica o status de lido/não-lido baseado no storage
  const notifications = useMemo(() => {
    if (!rawNotifications) return [];
    return rawNotifications.map((n) => ({
      ...n,
      read: n.read || readIds.has(n.id),
    }));
  }, [rawNotifications, readIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    const allIds = new Set(readIds);
    for (const n of notifications) {
      allIds.add(n.id);
    }
    persistReadIds(allIds);
  }, [notifications, readIds, persistReadIds]);

  // Filtra por categoria selecionada
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const config = getNotificationConfig(n.type, colors, isDark);
      switch (activeFilter) {
        case 'nao_lidas':
          return !n.read;
        case 'estoque':
          return config.category === 'estoque';
        case 'orcamentos':
          return config.category === 'orcamentos';
        case 'financeiro':
          return config.category === 'financeiro';
        case 'todas':
        default:
          return true;
      }
    });
  }, [notifications, activeFilter, colors, isDark]);

  // Agrupamento cronológico (Hoje, Amanhã, Próximos 7 dias, Anteriores)
  const rows = useMemo<Row[]>(() => {
    if (filteredNotifications.length === 0) return [];

    const today = new Date();
    const todayKey = toLocalDateKey(today);
    const tomorrowKey = toLocalDateKey(addDays(today, 1));
    const weekEndKey = toLocalDateKey(addDays(today, 7));

    const groups = new Map<string, Notificacao[]>();
    for (const item of filteredNotifications) {
      const groupKey =
        item.date === todayKey
          ? 'Hoje'
          : item.date === tomorrowKey
            ? 'Amanhã'
            : item.date >= todayKey && item.date <= weekEndKey
              ? 'Próximos 7 dias'
              : 'Anteriores';
      const group = groups.get(groupKey) ?? [];
      group.push(item);
      groups.set(groupKey, group);
    }

    const result: Row[] = [];
    for (const [label, group] of Array.from(groups.entries())) {
      result.push({ kind: 'header', id: `header-${label}`, label });
      for (const item of group) {
        result.push({ kind: 'item', id: item.id, item });
      }
    }
    return result;
  }, [filteredNotifications]);

  if (!companyId) {
    return <LoadingState text="Carregando..." />;
  }

  return (
    <ScreenContainer padding={false} keyboard={false} maxContentWidth={920}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          {isLoading ? (
            <LoadingState text="Carregando alertas e notificações..." />
          ) : isError ? (
            <ErrorState message={toApiError(error).message} onRetry={refetch} />
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(row) => row.id}
              renderItem={({ item: row }) => {
                if (row.kind === 'header') {
                  return (
                    <View style={styles.sectionHeaderWrapper}>
                      <Text style={styles.sectionHeader}>{row.label}</Text>
                    </View>
                  );
                }
                const n = row.item;
                const config = getNotificationConfig(n.type, colors, isDark);
                return (
                  <View style={styles.cardWrapper}>
                    <AppCard
                      shadow="none"
                      radius={radius.xl}
                      style={{
                        ...styles.card,
                        ...(!n.read ? styles.cardUnread : {}),
                      }}
                    >
                      <View style={styles.cardContent}>
                        <View style={[styles.cardIcon, { backgroundColor: config.backgroundColor }]}>
                          <Ionicons
                            name={config.icon}
                            size={sizes.icon.sm}
                            color={config.color}
                            accessibilityElementsHidden
                          />
                        </View>

                        <View style={styles.cardInfo}>
                          <View style={styles.cardTopRow}>
                            <View style={styles.cardTitleAndBadge}>
                              <Text style={styles.cardTitle} numberOfLines={1}>
                                {n.title}
                              </Text>
                              {!n.read && <View style={styles.unreadDot} />}
                            </View>
                            <Text style={styles.cardDate}>{formatDateLabel(n.date)}</Text>
                          </View>

                          <Text style={styles.cardDescription} numberOfLines={2}>
                            {n.description}
                          </Text>

                          {/* Ações contextuais do Card */}
                          <View style={styles.cardActionsRow}>
                            {config.route ? (
                              <Pressable
                                onPress={() => {
                                  markAsRead(n.id);
                                  router.push(config.route as any);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={config.ctaLabel}
                                hitSlop={6}
                                style={styles.actionCtaButton}
                              >
                                <Text style={styles.actionCtaText}>{config.ctaLabel}</Text>
                                <Ionicons name="arrow-forward" size={11} color={isDark ? colors.textLight : colors.textSecondary} />
                              </Pressable>
                            ) : <View />}

                            {!n.read && (
                              <Pressable
                                onPress={() => markAsRead(n.id)}
                                accessibilityRole="button"
                                accessibilityLabel="Marcar como lida"
                                hitSlop={6}
                                style={styles.markReadButton}
                              >
                                <Ionicons name="checkmark" size={13} color={colors.textLight} />
                                <Text style={styles.markReadText}>Marcar lida</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </View>
                    </AppCard>
                  </View>
                );
              }}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              refreshing={isRefetching}
              onRefresh={refetch}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.headerWrapper}>
                  {/* Cabeçalho com BackButton + Títulos + Ação "Ler todas" à direita */}
                  <View style={styles.header}>
                    <View style={styles.headerTop}>
                      <View style={styles.headerLeft}>
                        <BackButton fallback="/(app)/(tabs)/mais" />
                        <View style={styles.headerTitles}>
                          <Text style={styles.title}>Notificações</Text>
                          <Text style={styles.subtitle}>
                            Alertas e pendências importantes
                          </Text>
                        </View>
                      </View>

                      {unreadCount > 0 && (
                        <Pressable
                          onPress={markAllAsRead}
                          accessibilityRole="button"
                          accessibilityLabel="Marcar todas como lidas"
                          hitSlop={8}
                          style={({ pressed }) => [
                            styles.headerMarkAllBtn,
                            pressed && styles.headerMarkAllBtnPressed,
                          ]}
                        >
                          <Ionicons
                            name="checkmark-done-outline"
                            size={15}
                            color={isDark ? colors.textSecondary : colors.primary}
                          />
                          <Text style={styles.headerMarkAllText}>Ler todas</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Filtros em Chips Deslizáveis */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScrollContent}
                  >
                    <Pressable
                      onPress={() => setActiveFilter('todas')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'todas' && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'todas' && styles.filterChipTextActive,
                        ]}
                      >
                        Todas
                      </Text>
                      <View
                        style={[
                          styles.filterBadge,
                          activeFilter === 'todas' && styles.filterBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            activeFilter === 'todas' && styles.filterBadgeTextActive,
                          ]}
                        >
                          {notifications.length}
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => setActiveFilter('nao_lidas')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'nao_lidas' && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name="notifications-outline"
                        size={12}
                        color={activeFilter === 'nao_lidas' ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'nao_lidas' && styles.filterChipTextActive,
                        ]}
                      >
                        Não lidas
                      </Text>
                      {unreadCount > 0 && (
                        <View
                          style={[
                            styles.filterBadge,
                            activeFilter === 'nao_lidas' && styles.filterBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterBadgeText,
                              activeFilter === 'nao_lidas' && styles.filterBadgeTextActive,
                            ]}
                          >
                            {unreadCount}
                          </Text>
                        </View>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => setActiveFilter('estoque')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'estoque' && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={12}
                        color={activeFilter === 'estoque' ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'estoque' && styles.filterChipTextActive,
                        ]}
                      >
                        Estoque
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setActiveFilter('orcamentos')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'orcamentos' && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={12}
                        color={activeFilter === 'orcamentos' ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'orcamentos' && styles.filterChipTextActive,
                        ]}
                      >
                        Orçamentos & Obras
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setActiveFilter('financeiro')}
                      style={[
                        styles.filterChip,
                        activeFilter === 'financeiro' && styles.filterChipActive,
                      ]}
                    >
                      <Ionicons
                        name="cash-outline"
                        size={12}
                        color={activeFilter === 'financeiro' ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.filterChipText,
                          activeFilter === 'financeiro' && styles.filterChipTextActive,
                        ]}
                      >
                        Financeiro
                      </Text>
                    </Pressable>
                  </ScrollView>
                </View>
              }
              ListEmptyComponent={
                <EmptyState
                  icon="notifications-off-outline"
                  title="Nenhuma notificação"
                  description={
                    activeFilter !== 'todas'
                      ? 'Nenhum alerta encontrado com o filtro selecionado.'
                      : 'Você está em dia! Não há alertas pendentes no momento.'
                  }
                />
              }
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
