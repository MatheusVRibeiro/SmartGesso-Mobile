import React from 'react';
import { View, Text, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { ThemeSelector } from '@/src/components/ui/ThemeSelector';
import { useSessionStore } from '@/src/store/useSessionStore';
import { SecureTokenStorage } from '@/src/services/auth/SecureTokenStorage';
import { queryClient } from '@/src/lib/queryClient';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes, spacing, typography } from '@/src/theme';
import { config } from '@/src/constants/config';
import type { CompanyMemberStatus } from '@/src/types/company';
import { styles } from './styles';

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
  const { colors } = useAppTheme();
  const { currentUser, activeCompany, clearSession } = useSessionStore();

  const handleLogout = async () => {
    await SecureTokenStorage.clearTokens();
    queryClient.clear();
    clearSession();
    router.replace('/(auth)/login');
  };

  const handleSupport = () => {
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
        <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {currentUser?.name ? getInitial(currentUser.name) : '?'}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {currentUser?.name || 'Usuário'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {currentUser?.email || 'email@exemplo.com'}
        </Text>
      </View>

      {/* Empresa / Papel */}
      {activeCompany && (
        <AppCard shadow="light" style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons
                name="business-outline"
                size={sizes.icon.md}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {activeCompany.company.tradeName}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
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

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoRowIcon}>
              <Ionicons
                name="person-circle-outline"
                size={sizes.icon.sm}
                color={colors.primary}
                accessibilityElementsHidden
              />
            </View>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Papel</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
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
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Acesso</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {memberBadge?.label ?? activeCompany.member.status}
            </Text>
          </View>
        </AppCard>
      )}

      {/* Seletor de Aparência e Temas */}
      <ThemeSelector />

      {/* App Info */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sobre o app</Text>
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
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nome</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{config.appName}</Text>
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
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Versão</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{config.appVersion}</Text>
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
