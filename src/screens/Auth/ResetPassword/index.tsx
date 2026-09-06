import React, { useState, useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ScreenContainer,
  AppCard,
  PasswordInput,
  AppButton,
  AppSnackbar,
} from '@/src/components/ui';
import { BackButton } from '@/src/components/navigation/BackButton';
import { colors, spacing, typography, radius, sizes } from '@/src/theme';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/src/validation/schemas';
import { authService } from '@/src/services/api/auth';
import { createResetPasswordStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function ResetPasswordScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createResetPasswordStyles(colors, isDark), [colors, isDark]);
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
          <View style={styles.errorCircle}>
            <Text style={styles.errorCircleText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Token inválido</Text>
          <Text style={styles.errorSubtitle}>
            O link de redefinição de senha é inválido ou expirou.
          </Text>
          <AppButton
            title="Voltar para o login"
            size="lg"
            onPress={() => router.replace('/(auth)/login')}
            accessibilityLabel="Voltar para o login"
            style={styles.errorButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer scroll padding keyboard>
        <View style={styles.topBar}>
          <BackButton />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Nova senha</Text>
          <Text style={styles.subtitle}>Defina uma nova senha para sua conta</Text>
        </View>

        <AppCard
          padding={spacing['2xl']}
          radius={radius.xl}
          shadow="medium"
          style={styles.card}
        >
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
            title="Salvar nova senha"
            size="lg"
            loading={loading}
            disabled={loading}
            accessibilityLabel="Salvar nova senha"
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
          />
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
