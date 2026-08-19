import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  AppCard,
  AppInput,
  AppButton,
  AppSnackbar,
} from '../../src/components/ui';
import { BackButton } from '../../src/components/navigation/BackButton';
import { colors, spacing, typography, radius, sizes } from '../../src/theme';
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
    <View style={{ flex: 1 }}>
      <ScreenContainer scroll padding keyboard>
        <View style={styles.topBar}>
          <BackButton />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>
            Enviaremos um link para seu e-mail
          </Text>
        </View>

        <AppCard
          padding={spacing['2xl']}
          radius={radius.xl}
          shadow="medium"
          style={styles.card}
        >
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
                size="lg"
                loading={loading}
                disabled={loading}
                accessibilityLabel="Enviar link de recuperação"
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
              />
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successCircle}>
                <Ionicons
                  name="mail-outline"
                  size={sizes.icon.xl}
                  color={colors.success}
                  accessibilityElementsHidden
                />
              </View>
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
            hitSlop={8}
          >
            <Text style={styles.backText}>Voltar para o login</Text>
          </Pressable>
        </AppCard>
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
  topBar: {
    paddingTop: spacing.md,
  },
  header: {
    marginTop: spacing['3xl'],
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: sizes.maxContentWidth,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
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
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});