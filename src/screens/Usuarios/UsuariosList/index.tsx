import { BackButton } from '@/src/components/navigation/BackButton';
import React, { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { PermissionGate } from '@/src/components/domain/PermissionGate';
import { toApiError } from '@/src/services/api/client';
import { companyMembersService } from '@/src/services/api/companyMembers';
import { useSessionStore } from '@/src/store/useSessionStore';
import { USER_MANAGE_ROLES } from '@/src/types/permissions';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import {
  COMPANY_MEMBER_ROLE_LABELS,
  COMPANY_MEMBER_STATUS_LABELS,
} from '@/src/types/companyMember';
import type { CompanyMember, CompanyMemberStatus } from '@/src/types/companyMember';
import { createUsuariosStyles } from './styles';

function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

const STATUS_BADGE: Record<CompanyMemberStatus, StatusBadgeVariant> = {
  ATIVO: 'active',
  CONVIDADO: 'warning',
  INATIVO: 'cancelled',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MemberCard({
  member,
  styles,
  colors,
  onPress,
}: {
  member: CompanyMember;
  styles: ReturnType<typeof createUsuariosStyles>;
  colors: ActivePalette;
  onPress: () => void;
}) {
  const name = member.user?.name ?? 'Sem nome';
  const email = member.user?.email ?? 'Sem e-mail';
  const roleLabel = COMPANY_MEMBER_ROLE_LABELS[member.role] ?? member.role;
  const statusVariant = STATUS_BADGE[member.status] ?? 'neutral';
  const statusLabel =
    COMPANY_MEMBER_STATUS_LABELS[member.status] ?? member.status;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Membro ${name}, perfil ${roleLabel}, status ${statusLabel}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AppCard shadow="light" radius={radius.lg} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
            <View style={styles.badges}>
              <StatusBadge status="expired" label={roleLabel} size="sm" />
              <StatusBadge
                status={statusVariant}
                label={statusLabel}
                size="sm"
              />
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={sizes.icon.md}
            color={colors.textSecondary}
            accessibilityElementsHidden
          />
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

export default function UsuariosListScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createUsuariosStyles(colors, isDark), [colors, isDark]);

  const {
    data: members,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['company', companyId, 'members'],
    queryFn: () => companyMembersService.list(),
    select: (result) => toArray<CompanyMember>(result),
    enabled: Boolean(companyId),
  });

  return (
    <ScreenContainer padding={false} keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton fallback="/(app)/(tabs)/mais" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Membros</Text>
            <Text style={styles.subtitle}>Equipe e acessos da empresa</Text>
          </View>
        </View>
        <PermissionGate allow={USER_MANAGE_ROLES}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Convidar usuário"
            onPress={() => router.push('/usuarios/convidar')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={sizes.icon.md} color={colors.textOnPrimary} accessibilityElementsHidden />
          </TouchableOpacity>
        </PermissionGate>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando membros..." />
      ) : isError ? (
        <ErrorState message={toApiError(error).message} onRetry={refetch} />
      ) : members && members.length === 0 ? (
        <EmptyState
          title="Nenhum membro encontrado"
          description="Convide novos colaboradores para sua empresa"
          icon="people-outline"
          actionLabel="Convidar membro"
          onAction={() => router.push('/usuarios/convidar')}
        />
      ) : (
        <FlatList
          data={members ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemberCard
              member={item}
              styles={styles}
              colors={colors}
              onPress={() => router.push(`/usuarios/${item.id}`)}
            />
          )}
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
