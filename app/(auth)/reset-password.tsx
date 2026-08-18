import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, PasswordInput, AppButton, AppSnackbar } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../src/validation/schemas';
import { authService } from '../../src/services/api/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' | 'info' });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        setLoading(true);
        setSnackbar((prev) => ({ ...prev, visible: false }));

        await authService.resetPassword({
          token: data.token,
          password: data.password,
        });

        setSnackbar({
          visible: true,
          message: 'Senha redefinida com sucesso!',
          type: 'success',
        });

        // Redirecionar para login após 1.5s
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Erro ao redefinir senha. Tente novamente.';
        setSnackbar({ visible: true, message, type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  if (!token) {
    return (
      <ScreenContainer scroll padding>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Token inválido</Text>
          <Text style={styles.errorSubtitle}>
            O link de redefinição de senha é inválido ou expirou.
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
    <View style={{ flex: 1 }}>
      <ScreenContainer scroll padding>
        <View style={styles.header}>
          <Text style={styles.title}>Nova senha</Text>
          <Text style={styles.subtitle}>Defina uma nova senha para sua conta</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                label="Nova senha"
                placeholder="Mínimo 6 caracteres"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                accessibilityLabel="Campo de nova senha"
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
            title="Redefinir"
            loading={loading}
            disabled={loading}
            accessibilityLabel="Redefinir senha"
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
          />
        </View>
      </ScreenContainer>

      <AppSnackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={() => setSnackbar((prev) => ({ ...prev, visible: false }))}
      />
    </View>
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
