import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, PasswordInput, AppButton, AppSnackbar } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { acceptInvitationSchema, type AcceptInvitationFormData } from '../../src/validation/schemas';
import { authService } from '../../src/services/api/auth';
import { SecureTokenStorage } from '../../src/services/auth/SecureTokenStorage';
import { useSessionStore } from '../../src/store/useSessionStore';
import type { AuthUser } from '../../src/types/auth';

export default function AcceptInvitationScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { setSession } = useSessionStore();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' | 'info' });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token: token ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async (data: AcceptInvitationFormData) => {
      try {
        setLoading(true);
        setSnackbar((prev) => ({ ...prev, visible: false }));

        const response = await authService.acceptInvitation({
          token: data.token,
          password: data.password,
        });

        // Salvar tokens
        await SecureTokenStorage.setAccessToken(response.accessToken);
        await SecureTokenStorage.setRefreshToken(response.refreshToken);

        // Montar user a partir da resposta
        const user: AuthUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          activeCompanyId: response.companyId,
        };

        // Atualizar store de sessão
        setSession(user, null);

        // Redirecionar para a tela principal
        router.replace('/(app)/(tabs)');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Erro ao aceitar convite. Tente novamente.';
        setSnackbar({ visible: true, message, type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [router, setSession],
  );

  if (!token) {
    return (
      <ScreenContainer scroll padding>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Convite inválido</Text>
          <Text style={styles.errorSubtitle}>
            O link de convite é inválido ou expirou.
          </Text>
          <AppButton
            title="Voltar para o login"
            onPress={() => router.replace('/(auth)/login')}
            accessibilityLabel="Voltar para o login"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padding>
      <View style={styles.header}>
        <Text style={styles.title}>Aceitar convite</Text>
        <Text style={styles.subtitle}>
          Defina sua senha para acessar o sistema
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              accessibilityLabel="Campo de senha"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordInput
              label="Confirmar senha"
              placeholder="Repita a senha"
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              accessibilityLabel="Campo de confirmação de senha"
              returnKeyType="done"
            />
          )}
        />

        <AppButton
          title="Criar senha e acessar"
          loading={loading}
          disabled={loading}
          accessibilityLabel="Criar senha e acessar o sistema"
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        />
      </View>

      <AppSnackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={() => setSnackbar((prev) => ({ ...prev, visible: false }))}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing['4xl'],
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
  },
});
