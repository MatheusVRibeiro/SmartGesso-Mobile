import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { toApiError } from '@/src/services/api/client';
import { loadNotifications } from '@/src/services/notifications';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import type { Notificacao, NotificationType } from '@/src/types/notification';
import { createNotificacoesStyles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

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

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function getNotificationTypeConfig(type: NotificationType, colors: ActivePalette) {
  const configs: Record<NotificationType, { icon: IconName; backgroundColor: string; color: string }> = {
    QUOTE_EXPIRING: { icon: 'document-text-outline', backgroundColor: colors.warningSoft, color: colors.warning },
    VISIT_TODAY: { icon: 'eye-outline', backgroundColor: colors.primarySoft, color: colors.primary },
    SERVICE_TOMORROW: { icon: 'hammer-outline', backgroundColor: colors.infoSoft, color: colors.info },
    DELIVERY_SOON: { icon: 'cube-outline', backgroundColor: colors.warningSoft, color: colors.warning },
    PAYMENT_DUE: { icon: 'card-outline', backgroundColor: colors.dangerSoft, color: colors.danger },
    LOW_STOCK: { icon: 'alert-circle-outline', backgroundColor: colors.dangerSoft, color: colors.danger },
    GENERIC: { icon: 'notifications-outline', backgroundColor: colors.primarySoft, color: colors.primary },
  };
  return configs[type] || configs.GENERIC;
}

function NotificationCard({ item, styles, colors }: { item: Notificacao; styles: ReturnType<typeof createNotificacoesStyles>; colors: ActivePalette }) {
  const config = getNotificationTypeConfig(item.type, colors);

  return (
    <AppCard shadow="light" radius={radius.lg} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={[styles.cardIcon, { backgroundColor: config.backgroundColor }]}>
          <Ionicons
            name={config.icon}
            size={sizes.icon.md}
            color={config.color}
            accessibilityElementsHidden
          />
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read ? <View style={styles.unreadDot} /> : null}
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <Text style={styles.cardDate}>{formatDateLabel(item.date)}</Text>
      </View>
    </AppCard>
  );
}

type Row =
  | { kind: 'header'; id: string; label: string }
  | { kind: 'item'; id: string; item: Notificacao };

export default function NotificacoesScreen() {
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNotificacoesStyles(colors, isDark), [colors, isDark]);

  const {
    data: notifications,
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

  const rows = useMemo<Row[]>(() => {
    if (!notifications || notifications.length === 0) return [];

    const today = new Date();
    const todayKey = toLocalDateKey(today);
    const tomorrowKey = toLocalDateKey(addDays(today, 1));
    const weekEndKey = toLocalDateKey(addDays(today, 7));

    const groups = new Map<string, Notificacao[]>();
    for (const item of notifications) {
      const groupKey =
        item.date === todayKey
          ? 'Hoje'
          : item.date === tomorrowKey
            ? 'Amanhã'
            : item.date >= todayKey && item.date <= weekEndKey
              ? 'Próximos 7 dias'
              : 'Outros';
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
  }, [notifications]);

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.subtitle}>Alertas e pendências importantes</Text>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando notificações..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação"
          description="Você está em dia: sem orçamentos vencendo, visitas, entregas, pagamentos ou estoque baixo para os próximos dias."
          icon="notifications-off-outline"
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.id}
          renderItem={({ item: row }) =>
            row.kind === 'header' ? (
              <Text style={styles.sectionHeader}>{row.label}</Text>
            ) : (
              <NotificationCard item={row.item} styles={styles} colors={colors} />
            )
          }
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
