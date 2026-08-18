import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AppButton } from '../../src/components/ui/AppButton';
import { useSessionStore } from '../../src/store/useSessionStore';
import { SecureTokenStorage } from '../../src/services/auth/SecureTokenStorage';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function AccessSuspendedScreen() {
  const router = useRouter();
  const { clearSession, activeCompany } = useSessionStore();

  const handleSwitchCompany = () => {
    router.replace('/(company)/select-company');
  };

  const handleSupport = () => {
    // TODO: Open support link (WhatsApp/email)
    // For now, open email
    Linking.openURL('mailto:suporte@smartgesso.com.br');
  };

  const handleLogout = async () => {
    await SecureTokenStorage.clearTokens();
    clearSession();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="alert-circle"
            size={80}
            color={colors.danger}
            accessibilityElementsHidden
          />
        </View>

        <Text style={styles.title}>Acesso suspenso</Text>
        
        <Text style={styles.description}>
          Seu acesso à empresa{' '}
          <Text style={styles.companyName}>
            {activeCompany?.company?.tradeName || 'selecionada'}
          </Text>{' '}
          está suspenso. Entre em contato com o suporte para mais informações.
        </Text>

        <View style={styles.buttonsContainer}>
          <AppButton
            title="Trocar empresa"
            variant="outline"
            onPress={handleSwitchCompany}
            style={styles.button}
            accessibilityLabel="Trocar para outra empresa"
          />
          
          <AppButton
            title="Suporte"
            variant="secondary"
            onPress={handleSupport}
            style={styles.button}
            accessibilityLabel="Entrar em contato com o suporte"
          />
          
          <AppButton
            title="Sair"
            variant="ghost"
            onPress={handleLogout}
            style={styles.button}
            accessibilityLabel="Sair da conta"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.md * 1.5,
    marginBottom: spacing['3xl'],
  },
  companyName: {
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});