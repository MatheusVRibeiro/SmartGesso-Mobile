import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, shadows, spacing, typography } from '../../../src/theme';

const METRICS = [
  {
    id: 'receber',
    title: 'A receber',
    icon: 'cash-outline' as const,
    description: 'Módulo financeiro em desenvolvimento',
  },
  {
    id: 'servicos-dia',
    title: 'Serviços do dia',
    icon: 'hammer-outline' as const,
    description: 'Módulo de agendamento em desenvolvimento',
  },
  {
    id: 'orcamentos-recentes',
    title: 'Orçamentos recentes',
    icon: 'document-text-outline' as const,
    description: 'Módulo de orçamentos em desenvolvimento',
  },
  {
    id: 'alertas-estoque',
    title: 'Alertas de estoque',
    icon: 'alert-circle-outline' as const,
    description: 'Módulo de estoque em desenvolvimento',
  },
];

export default function HomeScreen() {
  const activeCompany = useSessionStore((s) => s.activeCompany);
  const currentUser = useSessionStore((s) => s.currentUser);

  const userName = currentUser?.name?.split(' ')[0] ?? 'usuário';
  const companyName = activeCompany?.company?.tradeName ?? 'SmartGesso';

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {userName}</Text>
        <Text style={styles.companyName}>{companyName}</Text>
      </View>

      <View style={styles.metricsContainer}>
        {METRICS.map((metric) => (
          <AppCard
            key={metric.id}
            shadow="light"
            radius={radius.md}
            style={styles.metricCard}
          >
            <View style={styles.metricHeader}>
              <View style={styles.metricIconContainer}>
                <Ionicons name={metric.icon} size={20} color={colors.primary} />
              </View>
              <StatusBadge status="warning" label="Em breve" size="sm" />
            </View>
            <Text style={styles.metricTitle}>{metric.title}</Text>
            <Text style={styles.metricDescription}>{metric.description}</Text>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing['2xl'],
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  companyName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  metricsContainer: {
    gap: spacing.lg,
  },
  metricCard: {
    padding: spacing.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
