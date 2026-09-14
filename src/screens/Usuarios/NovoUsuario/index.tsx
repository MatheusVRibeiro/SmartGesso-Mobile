import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { toApiError } from '@/src/services/api/client';
import { companyMembersService } from '@/src/services/api/companyMembers';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import { COMPANY_MEMBER_ROLE_LABELS } from '@/src/types/companyMember';
import type { CompanyUserRole } from '@/src/types/companyMember';
import { inviteMemberSchema } from '@/src/validation/schemas';
import type { InviteMemberFormData } from '@/src/validation/schemas';
import { createNovoUsuarioStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const ROLE_OPTIONS = Object.entries(COMPANY_MEMBER_ROLE_LABELS) as Array<
  [CompanyUserRole, string]
>;

export default function ConvidarUsuarioScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovoUsuarioStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);

  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MANAGER',
    },
  });

  const selectedRole = watch('role');

  const inviteMutation = useMutation({
    mutationFn: (data: InviteMemberFormData) =>
      companyMembersService.invite({
        email: data.email.trim(),
        role: data.role,
      }),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ['company', companyId, 'users'] });
      }
      setSnackbar({
        type: 'success',
        message: 'Convite enviado com sucesso',
      });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const onSubmit = handleSubmit((data) => {
    inviteMutation.mutate(data);
  });

  return (
    <ScreenContainer padding keyboard>
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

        <Text style={styles.title}>Convidar novo usuário</Text>
        <Text style={styles.description}>
          Envie um convite por e-mail e defina a função do novo membro na
          empresa.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="E-mail"
              required
              value={value}
              onChangeText={onChange}
              placeholder="nome@empresa.com.br"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email?.message}
              accessibilityLabel="E-mail do novo usuário"
              style={styles.field}
            />
          )}
        />

        <View style={styles.rolesSection}>
          <Text style={styles.rolesLabel}>Função *</Text>
          <View style={styles.rolesGrid}>
            {ROLE_OPTIONS.map(([role, label]) => {
              const selected = selectedRole === role;
              return (
                <Pressable
                  key={role}
                  accessibilityRole="button"
                  accessibilityLabel={`Função ${label}`}
                  accessibilityState={{ selected }}
                  onPress={() => setValue('role', role, { shouldValidate: true })}
                  style={({ pressed }) => [
                    styles.roleChip,
                    selected && styles.roleChipSelected,
                    pressed && styles.roleChipPressed,
                  ]}
                >
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={sizes.icon.sm}
                    color={selected ? colors.primary : colors.textLight}
                    accessibilityElementsHidden
                  />
                  <Text
                    style={[
                      styles.roleChipText,
                      selected && styles.roleChipTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <AppButton
          title="Enviar convite"
          size="lg"
          accessibilityLabel="Enviar convite"
          onPress={onSubmit}
          loading={inviteMutation.isPending}
          disabled={inviteMutation.isPending}
          style={styles.submitButton}
        />
      </View>

      {snackbar && (
        <AppSnackbar
          visible={true}
          type={snackbar.type}
          message={snackbar.message}
          onHide={() => setSnackbar(null)}
        />
      )}
    </ScreenContainer>
  );
}
