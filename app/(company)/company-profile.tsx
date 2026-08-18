import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AppButton } from '../../src/components/ui/AppButton';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { useSessionStore } from '../../src/store/useSessionStore';
import { colors, spacing, typography, radius } from '../../src/theme';
import type { CompanyMemberStatus } from '../../src/types/company';

export default function CompanyProfileScreen() {
  const router = useRouter();
  const { activeCompany } = useSessionStore();

  const handleSwitchCompany = () => {
    router.replace('/(company)/select-company');
  };

  const getStatusVariant = (status: CompanyMemberStatus): 'active' | 'warning' | 'suspended' | 'cancelled' | 'expired' => {
    switch (status) {
      case 'ACTIVE':
        return 'active';
      case 'INVITED':
        return 'warning';
      case 'INACTIVE':
        return 'cancelled';
      case 'BLOCKED':
        return 'suspended';
      default:
        return 'expired';
    }
  };

  const getStatusLabel = (status: CompanyMemberStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Acesso ativo';
      case 'INVITED':
        return 'Convite pendente';
      case 'INACTIVE':
        return 'Acesso inativo';
      case 'BLOCKED':
        return 'Acesso bloqueado';
      default:
        return 'Status desconhecido';
    }
  };

  if (!activeCompany) {
    return (
      <ScreenContainer>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="business-outline"
            size={60}
            color={colors.textLight}
            accessibilityElementsHidden
          />
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
    <ScreenContainer scroll>
      <View style={styles.container}>
        {/* Header with company icon */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="business"
              size={40}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.companyName}>
            {activeCompany.company.tradeName}
          </Text>
          <StatusBadge
            status={getStatusVariant(activeCompany.member.status)}
            label={getStatusLabel(activeCompany.member.status)}
            size="md"
          />
        </View>

        {/* Company details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da empresa</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nome fantasia</Text>
            <Text style={styles.detailValue}>
              {activeCompany.company.tradeName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Documento</Text>
            <Text style={styles.detailValue}>
              {activeCompany.company.document}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo de acesso</Text>
            <Text style={styles.detailValue}>
              {activeCompany.member.isOwner ? 'Proprietário' : 'Membro'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>
              {getStatusLabel(activeCompany.member.status)}
            </Text>
          </View>
        </View>

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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  companyName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  actionsSection: {
    marginTop: spacing.lg,
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
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.lg,
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