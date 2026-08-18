import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { colors, spacing, typography } from '../../../src/theme';

export default function ServicosScreen() {
  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Serviços</Text>
      </View>

      <AppCard shadow="light" style={styles.card}>
        <EmptyState
          title="Nenhum serviço registrado"
          description="Os serviços aparecerão aqui quando forem cadastrados"
          icon="hammer-outline"
          iconColor={colors.textLight}
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