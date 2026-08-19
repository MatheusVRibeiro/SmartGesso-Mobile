import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface QuickAction {
  id: string;
  title: string;
  icon: IconName;
  route?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'orcamento',
    title: 'Novo orçamento',
    icon: 'document-text',
    route: '/orcamentos/novo',
  },
  {
    id: 'cliente',
    title: 'Novo cliente',
    icon: 'person-add',
    route: '/clientes/novo',
  },
  {
    id: 'visita',
    title: 'Agendar visita',
    icon: 'calendar',
  },
  {
    id: 'pagamento',
    title: 'Registrar pagamento',
    icon: 'cash',
    route: '/pagamentos/novo',
  },
  {
    id: 'despesa',
    title: 'Nova despesa',
    icon: 'receipt',
    route: '/despesas/novo',
  },
];

export default function NovoScreen() {
  const router = useRouter();

  const handleAction = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route);
      return;
    }
    Alert.alert(
      'Módulo em desenvolvimento',
      `A funcionalidade "${action.title}" ainda está em desenvolvimento. Em breve disponível!`,
      [{ text: 'Entendi' }]
    );
  };

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Novo</Text>
        <Text style={styles.subtitle}>Selecione o que deseja cadastrar</Text>
      </View>

      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => handleAction(action)}
            activeOpacity={0.7}
            style={styles.actionButton}
            accessibilityLabel={action.title}
            accessibilityRole="button"
          >
            <AppCard shadow="light" radius={radius.lg} style={styles.actionCard}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name={action.icon}
                  size={sizes.icon.lg}
                  color={colors.primary}
                  accessibilityElementsHidden
                />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </AppCard>
          </TouchableOpacity>
        ))}
      </View>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  actionButton: {
    width: '48%',
  },
  actionCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});