import React, { useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppCard } from '@/src/components/ui/AppCard';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { useSessionStore } from '@/src/store/useSessionStore';
import { SecureTokenStorage } from '@/src/services/auth/SecureTokenStorage';
import { countNotifications } from '@/src/services/notifications';
import { useCompanyFeatures } from '@/src/services/api/companyFeatures';
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

  // Features da empresa (V5 ETAPA 7): 'production' e 'inventory' são módulos
  // OPCIONAIS. Itens com `feature` definida só aparecem com a feature ativa.
  // Enquanto carrega (isLoading) OU em erro da query, mantemos os itens
  // visíveis (fail-open no menu, sem flicker) — o backend continua sendo a
  // autoridade; as rotas seguem protegidas por permissão.
  const {
    data: companyFeatures,
    isLoading: featuresLoading,
    isError: featuresError,
  } = useCompanyFeatures();

  const featureEnabled = (feature: string): boolean => {
    if (featuresLoading || featuresError) return true; // fail-open enquanto carrega/erro
    return Array.isArray(companyFeatures)
      ? companyFeatures.includes(feature)
      : true; // payload inesperado → fail-open
  };

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
      id: 'estoque',
      title: 'Estoque',
      icon: 'cube-outline',
      section: 'Operação',
      action: () => router.push('/catalogo/materiais'),
      feature: 'inventory',
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
    {
      id: 'notificacoes',
      title: 'Notificações',
      icon: 'notifications-outline',
      section: 'Operação',
      action: () => router.push('/notificacoes'),
      badge: notificationCount,
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
      icon: 'card-outline',
      section: 'Financeiro',
      action: () => router.push('/despesas'),
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: 'bar-chart-outline',
      section: 'Gestão',
      action: () => router.push('/relatorios'),
      feature: 'advancedFinance',
    },
    {
      id: 'equipe',
      title: 'Equipe',
      icon: 'people-circle-outline',
      section: 'Gestão',
      action: () => router.push('/usuarios'),
    },
    {
      id: 'metas',
      title: 'Metas da Equipe',
      icon: 'trophy-outline',
      section: 'Financeiro',
      action: () => router.push('/metas'),
      feature: 'team',
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

    // Suporte
    {
      id: 'calculadora',
      title: 'Calculadora de Insumos',
      icon: 'calculator-outline',
      section: 'Suporte',
      action: () => router.push('/ferramentas/calculadora'),
    },
    {
      id: 'ajuda',
      title: 'Ajuda & Suporte',
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

  // Menu itens filtrados (V5 ETAPA 7): módulos opcionais só aparecem quando a
  // feature está ativa. Calculado a partir de menuItems ANTES do render.
  const visibleItems = menuItems.filter((item) => !item.feature || featureEnabled(item.feature));
  const visibleSections = Array.from(new Set(visibleItems.map((item) => item.section)));


  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Operacional</Text>
        <Text style={styles.subtitle}>Gestão completa da empresa</Text>
      </View>

      {visibleSections.map((section) => (
        <View key={section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section}</Text>
          <AppCard shadow="light" radius={radius.lg} style={styles.sectionCard}>
            {visibleItems
              .filter((item) => item.section === section)
              .map((item, index, array) => (
                <TouchableOpacity
                  key={item.id}
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
