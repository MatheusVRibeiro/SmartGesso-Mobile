import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { SecureTokenStorage } from '../../../src/services/auth/SecureTokenStorage';
import { queryClient } from '../../../src/lib/queryClient';
import { colors, spacing, typography } from '../../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  id: string;
  title: string;
  icon: IconName;
  section: string;
  action?: () => void;
  isDanger?: boolean;
}

export default function MaisScreen() {
  const router = useRouter();
  const clearSession = useSessionStore((s) => s.clearSession);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleModuleNotImplemented = (moduleName: string) => {
    Alert.alert(
      'Módulo em desenvolvimento',
      `A funcionalidade "${moduleName}" ainda está em desenvolvimento. Em breve disponível!`,
      [{ text: 'Entendi' }]
    );
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
      id: 'orcamentos',
      title: 'Orçamentos',
      icon: 'document-text-outline',
      section: 'Operação',
      action: () => router.push('/orcamentos'),
    },
    {
      id: 'servicos',
      title: 'Serviços',
      icon: 'hammer-outline',
      section: 'Operação',
      action: () => router.push('/servicos'),
    },
    {
      id: 'producao',
      title: 'Produção',
      icon: 'layers-outline',
      section: 'Operação',
      action: () => router.push('/producao'),
    },
    {
      id: 'estoque',
      title: 'Estoque',
      icon: 'cube-outline',
      section: 'Operação',
      action: () => router.push('/catalogo/materiais'),
    },
    {
      id: 'pagamentos',
      title: 'Pagamentos',
      icon: 'card-outline',
      section: 'Operação',
      action: () => router.push('/pagamentos'),
    },
    {
      id: 'cobrancas',
      title: 'Cobranças',
      icon: 'receipt-outline',
      section: 'Operação',
      action: () => router.push('/pagamentos'),
    },
    {
      id: 'despesas',
      title: 'Despesas',
      icon: 'wallet-outline',
      section: 'Operação',
      action: () => router.push('/despesas'),
    },

    // Relatórios
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: 'bar-chart-outline',
      section: 'Relatórios',
      action: () => handleModuleNotImplemented('Relatórios'),
    },

    // Configuração
    {
      id: 'usuarios',
      title: 'Usuários',
      icon: 'people-circle-outline',
      section: 'Configuração',
      action: () => handleModuleNotImplemented('Usuários'),
    },
    {
      id: 'empresa',
      title: 'Empresa',
      icon: 'business-outline',
      section: 'Configuração',
      action: () => handleModuleNotImplemented('Empresa'),
    },
    {
      id: 'perfil',
      title: 'Perfil',
      icon: 'person-circle-outline',
      section: 'Configuração',
      action: () => router.push('/(app)/profile'),
    },

    // Suporte
    {
      id: 'suporte',
      title: 'Suporte',
      icon: 'help-circle-outline',
      section: 'Suporte',
      action: () => handleModuleNotImplemented('Suporte'),
    },
    {
      id: 'trocar-empresa',
      title: 'Trocar empresa',
      icon: 'swap-horizontal-outline',
      section: 'Suporte',
      action: () => router.replace('/(company)/select-company'),
    },

    // Conta
    {
      id: 'sair',
      title: 'Sair',
      icon: 'log-out-outline',
      section: 'Conta',
      action: () => setLogoutDialogVisible(true),
      isDanger: true,
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
          <AppCard shadow="light" style={styles.sectionCard}>
            {menuItems
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
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={item.isDanger ? colors.danger : colors.text}
                    />
                    <Text
                      style={[
                        styles.menuItemTitle,
                        item.isDanger && styles.menuItemTitleDanger,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                </TouchableOpacity>
              ))}
          </AppCard>
        </View>
      ))}

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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemTitle: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  menuItemTitleDanger: {
    color: colors.danger,
  },
});