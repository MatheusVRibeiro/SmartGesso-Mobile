import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { AppButton } from '../../../src/components/ui/AppButton';
import { colors, spacing, typography } from '../../../src/theme';

export default function OrcamentosScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Orçamentos</Text>
      </View>

      <AppCard shadow="light" style={styles.card}>
        <EmptyState
          title="Nenhum orçamento ainda"
          description="Comece criando seu primeiro orçamento para um cliente"
          icon="document-text-outline"
          iconColor={colors.textLight}
          actionLabel="Novo orçamento"
          onAction={() => router.push('/(app)/(tabs)/novo')}
        />
      </AppCard>
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
  card: {
    padding: spacing.lg,
  },
});