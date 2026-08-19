import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../../src/components/ui/StatusBadge';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { SecureTokenStorage } from '../../../src/services/auth/SecureTokenStorage';
import { queryClient } from '../../../src/lib/queryClient';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { config } from '../../../src/constants/config';
import type { CompanyMemberStatus } from '../../../src/types/company';

const MEMBER_STATUS_BADGE: Record<
  CompanyMemberStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  ACTIVE: { variant: 'active', label: 'Acesso ativo' },
  INVITED: { variant: 'warning', label: 'Convite pendente' },
  INACTIVE: { variant: 'cancelled', label: 'Acesso inativo' },
  BLOCKED: { variant: 'suspended', label: 'Acesso bloqueado' },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, activeCompany, clearSession } = useSessionStore();

  const handleLogout = async () => {
    await SecureTokenStorage.clearTokens();
    queryClient.clear();
    clearSession();
    router.replace('/(auth)/login');
  };

  const handleSupport = () => {
    // TODO: Open support link (WhatsApp/email)
    Linking.openURL('mailto:suporte@smartgesso.com.br');
  };

  const getInitial = (name: string): string => {
    const first = name.trim().charAt(0);
    return first ? first.toUpperCase() : '?';
  };

  const memberBadge = activeCompany
    ? MEMBER_STATUS_BADGE[activeCompany.member.status]
    : null;

  return (
    <ScreenContainer scroll padding>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {currentUser?.name ? getInitial(currentUser.name) : '?'}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {currentUser?.name || 'Usuário'}
        </Text>
        <Text style={styles.userEmail}>
          {currentUser?.email || 'email@exemplo.com'}
        </Text>
      </View>

      {/* Empresa / Papel */}
      {activeCompany && (
        <AppCard shadow="light" style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="business-outline"
                size={sizes.icon.md}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {activeCompany.company.tradeName}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {activeCompany.company.document}
              </Text>
            </View>
            {memberBadge && (
              <StatusBadge
                status={memberBadge.variant}
                label={memberBadge.label}
                size="sm"
              />
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="person-circle-outline"
                size={sizes.icon.sm}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <Text style={styles.infoLabel}>Papel</Text>
            <Text style={styles.infoValue}>
              {activeCompany.member.isOwner ? 'Proprietário' : 'Membro'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={sizes.icon.sm}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <Text style={styles.infoLabel}>Acesso</Text>
            <Text style={styles.infoValue}>
              {memberBadge?.label ?? activeCompany.member.status}
            </Text>
          </View>
        </AppCard>
      )}

      {/* App Info */}
      <Text style={styles.sectionLabel}>Sobre o app</Text>
      <AppCard shadow="light" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoRowIcon}>
            <Ionicons
              name="apps-outline"
              size={sizes.icon.sm}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.infoLabel}>Nome</Text>
          <Text style={styles.infoValue}>{config.appName}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoRowIcon}>
            <Ionicons
              name="information-circle-outline"
              size={sizes.icon.sm}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.infoLabel}>Versão</Text>
          <Text style={styles.infoValue}>{config.appVersion}</Text>
        </View>
      </AppCard>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <AppButton
          title="Suporte"
          variant="outline"
          onPress={handleSupport}
          style={styles.actionButton}
          accessibilityLabel="Entrar em contato com o suporte"
        />

        <AppButton
          title="Sair"
          variant="danger"
          onPress={handleLogout}
          style={styles.actionButton}
          accessibilityLabel="Sair da conta"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
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
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoRowIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  actionsSection: {
    marginTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  actionButton: {
    width: '100%',
  },
});
