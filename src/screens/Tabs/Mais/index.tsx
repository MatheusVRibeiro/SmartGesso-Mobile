import React, { useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppCard } from '@/src/components/ui/AppCard';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { FeatureGate } from '@/src/components/ui/FeatureGate';
import { useSessionStore } from '@/src/store/useSessionStore';
import { SecureTokenStorage } from '@/src/services/auth/SecureTokenStorage';
import { countNotifications } from '@/src/services/notifications';
import { queryClient } from '@/src/lib/queryClient';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes, spacing, typography } from '@/src/theme';
import { createMaisStyles } from './styles';

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
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createMaisStyles(colors, isDark), [colors, isDark]);

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
      icon: 'construct-outline',
      section: 'Operação',
      action: () => router.push('/producao'),
      feature: 'production',
    },
    {
      id: 'compras',
      title: 'Compras',
      icon: 'cart-outline',
      section: 'Operação',
      action: () => router.push('/compras'),
      feature: 'purchases',
    },

    // Catálogo
    {
      id: 'catalogo',
      title: 'Catálogo de Serviços',
      icon: 'grid-outline',
      section: 'Catálogo',
      action: () => router.push('/catalogo'),
    },
    {
      id: 'materiais',
      title: 'Estoque de Materiais',
      icon: 'cube-outline',
      section: 'Catálogo',
      action: () => router.push('/catalogo/materiais'),
      feature: 'inventory',
    },

    // Financeiro
    {
      id: 'pagamentos',
      title: 'Pagamentos / Recebíveis',
      icon: 'cash-outline',
      section: 'Financeiro',
      action: () => router.push('/pagamentos'),
    },
    {
      id: 'despesas',
      title: 'Despesas',
      icon: 'card-outline',
      section: 'Financeiro',
      action: () => router.push('/despesas'),
    },
    {
      id: 'relatorios',
      title: 'Relatórios Gerenciais',
      icon: 'bar-chart-outline',
      section: 'Financeiro',
      action: () => router.push('/relatorios'),
      feature: 'advancedFinance',
    },
    {
      id: 'metas',
      title: 'Metas da Equipe',
      icon: 'trophy-outline',
      section: 'Financeiro',
      action: () => router.push('/metas'),
      feature: 'team',
    },

    // Ferramentas
    {
      id: 'calculadora',
      title: 'Calculadora de Insumos',
      icon: 'calculator-outline',
      section: 'Ferramentas',
      action: () => router.push('/ferramentas/calculadora'),
    },

    // Conta
    {
      id: 'configuracoes',
      title: 'Configurações',
      icon: 'settings-outline',
      section: 'Conta',
      action: () => router.push('/configuracoes'),
    },
    {
      id: 'perfil',
      title: 'Meu Perfil',
      icon: 'person-outline',
      section: 'Conta',
      action: () => router.push('/profile'),
    },
    {
      id: 'ajuda',
      title: 'Ajuda & Suporte',
      icon: 'help-circle-outline',
      section: 'Conta',
      action: () => router.push('/ajuda'),
    },
  ];

  const sections = Array.from(new Set(menuItems.map((item) => item.section)));

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Operacional</Text>
        <Text style={styles.subtitle}>Gestão completa da empresa</Text>
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
                          color={colors.primary}
                          accessibilityElementsHidden
                        />
                      </View>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      {item.badge != null && item.badge > 0 ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </Text>
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
              <Text style={[styles.menuItemTitle, styles.logoutTitle]}>Sair da Conta</Text>
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
