import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';

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
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>
          Ajuste os dados da sua empresa e as preferências de orçamento.
        </Text>
      </View>

      <AppCard shadow="light" radius={radius.lg} style={styles.card}>
        {items.map((item, index, array) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.action}
            style={[styles.item, index < array.length - 1 && styles.itemBorder]}
            accessibilityLabel={item.title}
            accessibilityRole="button"
          >
            <View style={styles.itemContent}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name={item.icon}
                  size={sizes.icon.md}
                  color={colors.primary}
                  accessibilityElementsHidden
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
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
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  itemDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});