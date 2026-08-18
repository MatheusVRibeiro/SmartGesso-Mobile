import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AppButton } from '../../src/components/ui/AppButton';
import { useSessionStore } from '../../src/store/useSessionStore';
import { SecureTokenStorage } from '../../src/services/auth/SecureTokenStorage';
import { colors, spacing, typography, radius } from '../../src/theme';
import { config } from '../../src/constants/config';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, activeCompany, clearSession } = useSessionStore();

  const handleLogout = async () => {
    await SecureTokenStorage.clearTokens();
    clearSession();
    router.replace('/(auth)/login');
  };

  const handleSupport = () => {
    // TODO: Open support link (WhatsApp/email)
    Linking.openURL('mailto:suporte@smartgesso.com.br');
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name ? getInitials(currentUser.name) : '?'}
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

        {/* Active Company */}
        {activeCompany && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Empresa ativa</Text>
            <View style={styles.companyCard}>
              <Ionicons
                name="business"
                size={24}
                color={colors.primary}
                accessibilityElementsHidden
              />
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {activeCompany.company.tradeName}
                </Text>
                <Text style={styles.companyDocument}>
                  {activeCompany.company.document}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do app</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{config.appName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versão</Text>
            <Text style={styles.infoValue}>{config.appVersion}</Text>
          </View>
        </View>

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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textOnPrimary,
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
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  companyInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  companyName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  companyDocument: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  actionsSection: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});