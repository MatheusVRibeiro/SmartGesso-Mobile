import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '../../src/components/ui/StatusBadge';
import { useSessionStore } from '../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../src/theme';
import type { CompanyMemberStatus } from '../../src/types/company';

const MEMBER_STATUS_BADGE: Record<
  CompanyMemberStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  ACTIVE: { variant: 'active', label: 'Acesso ativo' },
  INVITED: { variant: 'warning', label: 'Convite pendente' },
  INACTIVE: { variant: 'cancelled', label: 'Acesso inativo' },
  BLOCKED: { variant: 'suspended', label: 'Acesso bloqueado' },
};

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { activeCompany } = useSessionStore();

  const handleSwitchCompany = () => {
    router.replace('/(company)/select-company');
  };

  const memberBadge = activeCompany
    ? MEMBER_STATUS_BADGE[activeCompany.member.status]
    : null;

  if (!activeCompany) {
    return (
      <ScreenContainer>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Ionicons
              name="business-outline"
              size={sizes.icon.xl}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma empresa selecionada</Text>
          <Text style={styles.emptyDescription}>
            Selecione uma empresa para ver suas informações.
          </Text>
          <AppButton
            title="Selecionar empresa"
            variant="primary"
            onPress={handleSwitchCompany}
            style={styles.emptyButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padding>
      {/* Header with company icon */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="business"
            size={sizes.icon.xl}
            color={colors.primary}
            accessibilityElementsHidden
          />
        </View>
        <Text style={styles.companyName}>
          {activeCompany.company.tradeName}
        </Text>
        <Text style={styles.companyDocument}>
          {activeCompany.company.document}
        </Text>
        {memberBadge && (
          <View style={styles.badgeContainer}>
            <StatusBadge
              status={memberBadge.variant}
              label={memberBadge.label}
              size="md"
            />
          </View>
        )}
      </View>

      {/* Company details */}
      <AppCard shadow="light" style={styles.infoCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="business-outline"
              size={sizes.icon.sm}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Nome fantasia</Text>
            <Text style={styles.detailValue}>
              {activeCompany.company.tradeName}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="document-text-outline"
              size={sizes.icon.sm}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Documento</Text>
            <Text style={styles.detailValue}>
              {activeCompany.company.document}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="person-circle-outline"
              size={sizes.icon.sm}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Tipo de acesso</Text>
            <Text style={styles.detailValue}>
              {activeCompany.member.isOwner ? 'Proprietário' : 'Membro'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={sizes.icon.sm}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>
              {memberBadge?.label ?? activeCompany.member.status}
            </Text>
          </View>
        </View>
      </AppCard>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <AppButton
          title="Trocar empresa"
          variant="outline"
          onPress={handleSwitchCompany}
          style={styles.actionButton}
          accessibilityLabel="Trocar para outra empresa"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  companyName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  companyDocument: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badgeContainer: {
    marginTop: spacing.md,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  actionsSection: {
    marginTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  actionButton: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.xl,
    minWidth: 200,
  },
});