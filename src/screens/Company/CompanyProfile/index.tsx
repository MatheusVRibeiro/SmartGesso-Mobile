import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { CompanyMemberStatus } from '@/src/types/company';
import { createCompanyProfileStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

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
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCompanyProfileStyles(colors, isDark), [colors, isDark]);

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
