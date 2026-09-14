import React, { useState, useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  PasswordInput,
  AppButton,
  AppSnackbar,
  AppCard,
} from '@/src/components/ui';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import { acceptInvitationSchema, type AcceptInvitationFormData } from '@/src/validation/schemas';
import { authService } from '@/src/services/api/auth';
import { SecureTokenStorage } from '@/src/services/auth/SecureTokenStorage';
import { useSessionStore } from '@/src/store/useSessionStore';
import type { AuthUser } from '@/src/types/auth';
import { createAcceptInvitationStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function AcceptInvitationScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createAcceptInvitationStyles(colors, isDark), [colors, isDark]);
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

        // Se temCompanyId, buscar empresas e setar a empresa ativa
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
          <View style={styles.errorCircle}>
            <Ionicons
              name="alert-circle"
              size={sizes.icon.xl}
              color={colors.danger}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.errorTitle}>Convite inválido</Text>
          <Text style={styles.errorSubtitle}>
            O link de convite é inválido ou expirou.
          </Text>
          <AppButton
            title="Voltar para o login"
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
          <Text style={styles.subtitle}>Aceite seu convite</Text>
        </View>

        <AppCard
          padding={spacing['2xl']}
          radius={radius.xl}
          shadow="medium"
          style={styles.card}
        >
          <Text style={styles.cardDescription}>
            Defina sua senha para acessar o sistema
          </Text>

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
            size="lg"
            loading={loading}
            disabled={loading}
            accessibilityLabel="Criar senha e acessar o sistema"
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
