import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';

const QUICK_ACTIONS = [
  {
    id: 'cliente',
    title: 'Cliente',
    icon: 'person-outline' as const,
    route: '/clientes/novo',
  },
  {
    id: 'obra',
    title: 'Obra',
    icon: 'business-outline' as const,
    route: '/obras/novo',
  },
  {
    id: 'orcamento',
    title: 'Orçamento',
    icon: 'document-text-outline' as const,
    route: '/orcamentos/novo',
  },
  {
    id: 'servico',
    title: 'Serviço',
    icon: 'hammer-outline' as const,
    route: '/servicos/novo',
  },
  {
    id: 'pagamento',
    title: 'Pagamento',
    icon: 'cash-outline' as const,
    route: '/pagamentos/novo',
  },
  {
    id: 'despesa',
    title: 'Despesa',
    icon: 'wallet-outline' as const,
    route: '/despesas/novo',
  },
  {
    id: 'medicao',
    title: 'Medição',
    icon: 'resize-outline' as const,
    route: '/obras',
  },
  {
    id: 'producao',
    title: 'Produção',
    icon: 'layers-outline' as const,
    route: '/producao/novo',
  },
];

export default function NovoScreen() {
  const router = useRouter();

  const handleAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    router.push(action.route);
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
            accessibilityLabel={`Criar novo ${action.title}`}
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
