import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { COMPANY_USER_ROLE_LABELS } from '../../../src/types/user';

const AVAILABLE_ROLES = Object.values(COMPANY_USER_ROLE_LABELS);

export default function ConvidarUsuarioScreen() {
  const router = useRouter();

  return (
    <ScreenContainer padding keyboard={false}>
      <Stack.Screen options={{ title: 'Convidar usuário' }} />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="mail-unread-outline"
            size={sizes.icon.xl}
            color={colors.primary}
            accessibilityElementsHidden
          />
        </View>

        <Text style={styles.title}>Disponível na próxima versão</Text>
        <Text style={styles.description}>
          O convite de novos usuários ainda não está disponível. Em breve você
          poderá adicionar membros à sua empresa por e-mail e definir a função
          de cada um.
        </Text>

        <AppCard shadow="light" radius={radius.md} style={styles.rolesCard}>
          <Text style={styles.rolesTitle}>Funções disponíveis</Text>
          <View style={styles.rolesList}>
            {AVAILABLE_ROLES.map((role) => (
              <View key={role} style={styles.roleChip}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={sizes.icon.sm}
                  color={colors.success}
                  accessibilityElementsHidden
                />
                <Text style={styles.roleChipText}>{role}</Text>
              </View>
            ))}
          </View>
        </AppCard>
      </View>

      <AppButton
        title="Voltar"
        variant="outline"
        onPress={() => router.back()}
        accessibilityLabel="Voltar"
        style={styles.backButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: sizes.iconCircle,
    height: sizes.iconCircle,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  rolesCard: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  rolesTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  rolesList: {
    gap: spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleChipText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  backButton: {
    marginTop: spacing.lg,
  },
});