import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { FeatureGate } from '../../../src/components/ui/FeatureGate';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { SecureTokenStorage } from '../../../src/services/auth/SecureTokenStorage';
import { countNotifications } from '../../../src/services/notifications';
import { queryClient } from '../../../src/lib/queryClient';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  id: string;
  title: string;
  icon: IconName;
  section: string;
  action?: () => void;
  /** Contagem exibida em badge (oculta quando ausente ou 0). */
  badge?: number;
  /** Feature que controla a visibilidade deste item. */
  feature?: string;
}

export default function MaisScreen() {
  const router = useRouter();
  const clearSession = useSessionStore((s) => s.clearSession);
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const { data: notificationCount } = useQuery({
    queryKey: ['company', companyId, 'notificacoes', 'count'],
    queryFn: () => countNotifications(),
    enabled: Boolean(companyId),
  });

  const handleLogout = async () => {
    try {
      await SecureTokenStorage.clearTokens();
      queryClient.clear();
      clearSession();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
    }
  };

  const menuItems: MenuItem[] = [
    // Operação
    {
      id: 'clientes',
      title: 'Clientes',
      icon: 'people-outline',
      section: 'Operação',
      action: () => router.push('/clientes'),
    },
    {
      id: 'agenda',
      title: 'Agenda',
      icon: 'calendar-outline',
      section: 'Operação',
      action: () => router.push('/agenda'),
    },
    {
      id: 'notificacoes',
      title: 'Notificações',
      icon: 'notifications-outline',
      section: 'Operação',
      action: () => router.push('/notificacoes'),
      badge: notificationCount,
    },
    {
      id: 'producao',
      title: 'Produção',
      icon: 'layers-outline',
      section: 'Operação',
      action: () => router.push('/producao'),
      feature: 'production',
    },
    {
      id: 'estoque',
      title: 'Estoque',
      icon: 'cube-outline',
      section: 'Operação',
      action: () => router.push('/catalogo/materiais'),
      feature: 'inventory',
    },
    {
      id: 'compras',
      title: 'Compras',
      icon: 'cart-outline',
      section: 'Operação',
      action: () => router.push('/compras'),
      feature: 'purchases',
    },

    // Financeiro
    {
      id: 'financeiro',
      title: 'Financeiro',
      icon: 'cash-outline',
      section: 'Financeiro',
      action: () => router.push('/pagamentos'),
    },
    {
      id: 'despesas',
      title: 'Despesas',
      icon: 'wallet-outline',
      section: 'Financeiro',
      action: () => router.push('/despesas'),
    },

    // Gestão
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: 'bar-chart-outline',
      section: 'Gestão',
      action: () => router.push('/relatorios'),
    },
    {
      id: 'metas',
      title: 'Metas & Performance',
      icon: 'flag-outline',
      section: 'Gestão',
      action: () => router.push('/metas'),
      feature: 'team',
    },
    {
      id: 'configuracoes',
      title: 'Configurações',
      icon: 'settings-outline',
      section: 'Gestão',
      action: () => router.push('/configuracoes'),
    },
    {
      id: 'usuarios',
      title: 'Usuários',
      icon: 'people-circle-outline',
      section: 'Gestão',
      action: () => router.push('/usuarios'),
    },

    // Conta
    {
      id: 'empresa',
      title: 'Empresa',
      icon: 'business-outline',
      section: 'Conta',
      action: () => router.push('/configuracoes/empresa'),
    },
    {
      id: 'perfil',
      title: 'Perfil',
      icon: 'person-circle-outline',
      section: 'Conta',
      action: () => router.push('/(app)/profile'),
    },

    // Suporte
    {
      id: 'ajuda',
      title: 'Ajuda e suporte',
      icon: 'help-circle-outline',
      section: 'Suporte',
      action: () => router.push('/ajuda'),
    },
    {
      id: 'trocar-empresa',
      title: 'Trocar empresa',
      icon: 'swap-horizontal-outline',
      section: 'Suporte',
      action: () => router.replace('/(company)/select-company'),
    },
  ];

  const sections = Array.from(new Set(menuItems.map((item) => item.section)));

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Mais</Text>
      </View>

      {sections.map((section) => (
        <View key={section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section}</Text>
          <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
            {menuItems
              .filter((item) => item.section === section)
              .map((item, index, array) => (
                <FeatureGate key={item.id} feature={item.feature} fallback={null}>
                  <TouchableOpacity
                    onPress={item.action}
                    style={[
                      styles.menuItem,
                      index < array.length - 1 && styles.menuItemBorder,
                    ]}
                    accessibilityLabel={item.title}
                    accessibilityRole="button"
                  >
                    <View style={styles.menuItemContent}>
                      <View style={styles.menuItemIcon}>
                        <Ionicons
                          name={item.icon}
                          size={sizes.icon.md}
                          color={colors.textSecondary}
                          accessibilityElementsHidden
                        />
                      </View>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      {item.badge != null && item.badge > 0 ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={sizes.icon.md}
                      color={colors.textLight}
                      accessibilityElementsHidden
                    />
                  </TouchableOpacity>
                </FeatureGate>
              ))}
          </AppCard>
        </View>
      ))}

      {/* Sair */}
      <View style={styles.section}>
        <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
          <TouchableOpacity
            onPress={() => setLogoutDialogVisible(true)}
            style={styles.menuItem}
            accessibilityLabel="Sair"
            accessibilityRole="button"
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.menuItemIcon, styles.logoutIcon]}>
                <Ionicons
                  name="log-out-outline"
                  size={sizes.icon.md}
                  color={colors.danger}
                  accessibilityElementsHidden
                />
              </View>
              <Text style={[styles.menuItemTitle, styles.logoutTitle]}>Sair</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={sizes.icon.md}
              color={colors.textLight}
              accessibilityElementsHidden
            />
          </TouchableOpacity>
        </AppCard>
      </View>

      <ConfirmDialog
        visible={logoutDialogVisible}
        title="Sair da conta"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        danger
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialogVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textOnPrimary,
  },
  logoutIcon: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
  },
  logoutTitle: {
    color: colors.danger,
    fontWeight: typography.weights.semibold,
  },
});
