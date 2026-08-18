import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { colors, spacing, typography } from '../../../src/theme';

const QUICK_ACTIONS = [
  {
    id: 'cliente',
    title: 'Cliente',
    icon: 'person-outline' as const,
    route: 'cliente',
  },
  {
    id: 'medicao',
    title: 'Medição',
    icon: 'resize-outline' as const,
    route: 'medicao',
  },
  {
    id: 'orcamento',
    title: 'Orçamento',
    icon: 'document-text-outline' as const,
    route: 'orcamento',
  },
  {
    id: 'servico',
    title: 'Serviço',
    icon: 'hammer-outline' as const,
    route: 'servico',
  },
  {
    id: 'pagamento',
    title: 'Pagamento',
    icon: 'cash-outline' as const,
    route: 'pagamento',
  },
  {
    id: 'despesa',
    title: 'Despesa',
    icon: 'wallet-outline' as const,
    route: 'despesa',
  },
];

export default function NovoScreen() {
  const router = useRouter();

  const handleAction = (action: typeof QUICK_ACTIONS[number]) => {
    switch (action.id) {
      case 'cliente':
        router.push('/clientes/novo');
        break;
      case 'medicao':
        // Medições são sub-recurso de obras — navega para lista de obras
        router.push('/obras');
        break;
      case 'orcamento':
        router.push('/orcamentos/novo');
        break;
      case 'servico':
        router.push('/servicos/novo');
        break;
      case 'pagamento':
        router.push('/pagamentos/novo');
        break;
      case 'despesa':
        router.push('/despesas/novo');
        break;
      default:
        Alert.alert(
          'Módulo em desenvolvimento',
          `A funcionalidade "${action.title}" ainda está em desenvolvimento. Em breve disponível!`,
          [{ text: 'Entendi' }],
        );
    }
  };

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Novo</Text>
        <Text style={styles.subtitle}>Selecione o que deseja cadastrar</Text>
      </View>

      <View style={styles.actionsContainer}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => handleAction(action)}
            activeOpacity={0.7}
            style={styles.actionButton}
            accessibilityLabel={`Criar novo ${action.title}`}
            accessibilityRole="button"
          >
            <AppCard shadow="light" style={styles.actionCard}>
              <View style={styles.actionContent}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name={action.icon} size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </View>
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  actionCard: {
    padding: spacing.lg,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});