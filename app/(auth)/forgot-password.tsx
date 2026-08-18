import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer, AppInput, AppButton, AppSnackbar } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../src/validation/schemas';
import { authService } from '../../src/services/api/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' | 'info' });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = useCallback(async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      setSnackbar((prev) => ({ ...prev, visible: false }));

      await authService.forgotPassword(data);

      setSuccess(true);
      setSnackbar({
        visible: true,
        message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.',
        type: 'success',
      });
    } catch (error: any) {
      // Mesmo em caso de erro, mostramos mensagem genérica por segurança
      setSnackbar({
        visible: true,
        message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.',
        type: 'success',
      });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBackToLogin = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ScreenContainer scroll padding>
      <View style={styles.header}>
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Informe seu e-mail para receber o link de recuperação
        </Text>
      </View>

      <View style={styles.form}>
        {!success ? (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Campo de e-mail"
                  returnKeyType="done"
                />
              )}
            />

            <AppButton
              title="Enviar link"
              loading={loading}
              disabled={loading}
              accessibilityLabel="Enviar link de recuperação"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />
          </>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successText}>
              Se o e-mail estiver cadastrado, você receberá um link de recuperação.
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleBackToLogin}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o login"
          style={styles.backButton}
        >
          <Text style={styles.backText}>Voltar para o login</Text>
        </Pressable>
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
  backButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
