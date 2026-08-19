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
  PasswordInput,
  AppButton,
  AppSnackbar,
} from '../../src/components/ui';
import { colors, spacing, typography, radius, sizes } from '../../src/theme';
import { loginSchema, type LoginFormData } from '../../src/validation/schemas';
import { authService } from '../../src/services/api/auth';
import { SecureTokenStorage } from '../../src/services/auth/SecureTokenStorage';
import { useSessionStore } from '../../src/store/useSessionStore';
import type { AuthUser } from '../../src/types/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { setSession } = useSessionStore();

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' | 'info' });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        setLoading(true);
        setSnackbar((prev) => ({ ...prev, visible: false }));

        const response = await authService.login(data);

        // Salvar tokens no SecureStore
        await SecureTokenStorage.setAccessToken(response.accessToken);
        await SecureTokenStorage.setRefreshToken(response.refreshToken);

        // Montar user a partir da resposta
        const user: AuthUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          activeCompanyId: response.activeCompanyId ?? null,
        };

        // Se temCompanyId ativo, buscar empresas e setar a empresa ativa
        // (senão, vai para select-company para o usuário escolher)
        if (user.activeCompanyId) {
          try {
            const companies = await authService.companies();
            const matched = companies.find(
              (c) => c.company.id === user.activeCompanyId,
            );
            setSession(user, matched ?? null);
          } catch {
            setSession(user);
          }
          router.replace('/(app)/(tabs)');
        } else {
          setSession(user);
          router.replace('/(company)/select-company');
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Credenciais inválidas';
        setSnackbar({ visible: true, message, type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [router, setSession],
  );

  const handleForgotPassword = useCallback(() => {
    router.push('/(auth)/forgot-password');
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer scroll padding keyboard>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="business-outline"
              size={sizes.icon.xl}
              color={colors.textOnPrimary}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.logo}>SmartGesso</Text>
          <Text style={styles.subtitle}>Acesse sua conta</Text>
        </View>

        <AppCard
          padding={spacing['2xl']}
          radius={radius.xl}
          shadow="medium"
          style={styles.card}
        >
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
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                label="Senha"
                placeholder="Sua senha"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                accessibilityLabel="Campo de senha"
                returnKeyType="done"
              />
            )}
          />

          <AppButton
            title="Entrar na conta"
            size="lg"
            loading={loading}
            disabled={loading}
            accessibilityLabel="Entrar na conta"
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
          />

          <Pressable
            onPress={handleForgotPassword}
            accessibilityRole="button"
            accessibilityLabel="Esqueci a senha"
            style={styles.forgotButton}
            hitSlop={8}
          >
            <Text style={styles.forgotText}>Esqueci a senha</Text>
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
  header: {
    alignItems: 'center',
    marginTop: spacing['4xl'],
    marginBottom: spacing['3xl'],
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: sizes.maxContentWidth,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  forgotButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: sizes.touchTarget,
  },
  forgotText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
});
