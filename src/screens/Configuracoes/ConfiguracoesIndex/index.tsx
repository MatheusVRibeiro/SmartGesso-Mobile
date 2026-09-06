import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { PermissionGate } from '@/src/components/domain/PermissionGate';
import { ThemeSelector } from '@/src/components/ui/ThemeSelector';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes, spacing, typography } from '@/src/theme';
import { styles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface SettingsItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  action: () => void;
}

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const handleModuleNotImplemented = (moduleName: string) => {
    Alert.alert(
      'Módulo em desenvolvimento',
      `A funcionalidade "${moduleName}" ainda está em desenvolvimento. Em breve disponível!`,
      [{ text: 'Entendi' }]
    );
  };

  const items: SettingsItem[] = [
    {
      id: 'empresa',
      title: 'Empresa',
      description: 'Nome, CNPJ, contato e endereço',
      icon: 'business-outline',
      action: () => router.push('/configuracoes/empresa'),
    },
    {
      id: 'orcamento',
      title: 'Orçamento',
      description: 'Numeração, perda padrão, garantia e formas de pagamento',
      icon: 'document-text-outline',
      action: () => router.push('/configuracoes/orcamento'),
    },
    {
      id: 'usuarios',
      title: 'Usuários',
      description: 'Convites e permissões de acesso',
      icon: 'people-circle-outline',
      action: () => handleModuleNotImplemented('Usuários'),
    },
    {
      id: 'notificacoes',
      title: 'Notificações',
      description: 'Alertas de orçamentos e pagamentos',
      icon: 'notifications-outline',
      action: () => handleModuleNotImplemented('Notificações'),
    },
  ];

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <PermissionGate
        allow={['COMPANY_OWNER']}
        fallback={
          <EmptyState
            title="Sem permissão"
            description="Apenas o proprietário da empresa pode acessar as configurações."
            icon="lock-closed-outline"
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ajuste os dados da sua empresa, preferências e aparência.
          </Text>
        </View>

        {/* Seletor de Tema (Claro / Escuro / Sistema) */}
        <ThemeSelector />

        <AppCard shadow="light" radius={radius.lg} style={styles.card}>
          {items.map((item, index, array) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.action}
              style={[
                styles.item,
                index < array.length - 1 && [styles.itemBorder, { borderBottomColor: colors.divider }],
              ]}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              <View style={styles.itemContent}>
                <View style={[styles.itemIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons
                    name={item.icon}
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
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
      </PermissionGate>
    </ScreenContainer>
  );
}
