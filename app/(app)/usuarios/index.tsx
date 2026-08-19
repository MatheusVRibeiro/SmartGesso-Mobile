import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { PermissionGate } from '../../../src/components/domain/PermissionGate';
import { toApiError } from '../../../src/services/api/client';
import { companyMembersService } from '../../../src/services/api/companyMembers';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { USER_MANAGE_ROLES } from '../../../src/types/permissions';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import {
  COMPANY_MEMBER_ROLE_LABELS,
  COMPANY_MEMBER_STATUS_LABELS,
} from '../../../src/types/companyMember';
import type { CompanyMember, CompanyMemberStatus } from '../../../src/types/companyMember';

/**
 * A API real retorna array puro em GET /company/members (Prisma findMany),
 * enquanto alguns endpoints retornam { data, total }. Normaliza ambos.
 */
function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const MEMBER_STATUS_BADGE: Record<
  CompanyMemberStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  ATIVO: { variant: 'active', label: 'Ativo' },
  INATIVO: { variant: 'suspended', label: 'Inativo' },
  CONVIDADO: { variant: 'info', label: 'Convidado' },
};

export default function UsuariosListScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);
  const companyName = useSessionStore((s) => s.activeCompany?.company.tradeName ?? null);

  const membersQuery = useQuery({
    queryKey: ['company', companyId, 'users'],
    queryFn: () => companyMembersService.list(),
    enabled: Boolean(companyId),
  });

  const members = toArray<CompanyMember>(membersQuery.data);

  const renderItem = ({ item }: { item: CompanyMember }) => {
    const name = item.user?.name ?? 'Usuário';
    const email = item.user?.email ?? '';
    const initial = name.trim().charAt(0).toUpperCase();
    const badge = MEMBER_STATUS_BADGE[item.status];

    return (
      <AppCard shadow="light" radius={radius.md} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>
                {name}
              </Text>
              <StatusBadge status={badge.variant} label={badge.label} size="sm" />
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="briefcase-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardRowText} numberOfLines={1}>
                {COMPANY_MEMBER_ROLE_LABELS[item.role]}
              </Text>
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="mail-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardRowText} numberOfLines={1}>
                {email || 'E-mail não informado'}
              </Text>
            </View>
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <ScreenContainer padding keyboard={false}>
      <Stack.Screen options={{ title: 'Usuários' }} />

      <PermissionGate
        allow={USER_MANAGE_ROLES}
        fallback={
          <EmptyState
            title="Sem permissão"
            description="Apenas o proprietário e gerentes podem gerenciar usuários."
            icon="lock-closed-outline"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Usuários</Text>
            {companyName ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {companyName}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/usuarios/novo')}
            accessibilityRole="button"
            accessibilityLabel="Convidar usuário"
            style={styles.addButton}
          >
            <Ionicons name="add" size={sizes.icon.lg} color={colors.white} accessibilityElementsHidden />
          </TouchableOpacity>
        </View>

        <AppButton
          title="Convidar usuário"
          onPress={() => router.push('/usuarios/novo')}
          accessibilityLabel="Convidar usuário"
          style={styles.inviteButton}
        />

        {membersQuery.isLoading ? (
          <LoadingState text="Carregando usuários..." />
        ) : membersQuery.isError ? (
          <ErrorState
            message={toApiError(membersQuery.error).message}
            onRetry={membersQuery.refetch}
          />
        ) : members.length === 0 ? (
          <EmptyState
            title="Nenhum usuário"
            description="Convide o primeiro membro da sua empresa para começar."
            icon="people-outline"
          />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </PermissionGate>
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
  headerTitles: {
    flex: 1,
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  addButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButton: {
    marginBottom: spacing.lg,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
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