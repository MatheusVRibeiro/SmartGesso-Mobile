import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AppSnackbar } from '../../../src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '../../../src/components/ui/AppSnackbar';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { clientsService } from '../../../src/services/api/clients';
import { toApiError } from '../../../src/services/api/client';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { borders, colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { ClientType, CreateClientInput } from '../../../src/types/client';
import { createClientSchema } from '../../../src/validation/schemas';
import type { CreateClientFormData } from '../../../src/validation/schemas';

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: 'FISICA', label: 'Pessoa Física' },
  { value: 'JURIDICA', label: 'Pessoa Jurídica' },
];

/** Remove strings vazias antes de enviar (DTO usa @IsOptional — string vazia falharia). */
function cleanPayload(data: CreateClientFormData): CreateClientInput {
  return {
    type: data.type,
    name: data.name,
    document: data.document?.trim() || undefined,
    email: data.email?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    whatsapp: data.whatsapp?.trim() || undefined,
    observations: data.observations?.trim() || undefined,
  };
}

export default function ClienteDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string }>();
  const clientId = params.id ?? '';
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);

  const [snackbar, setSnackbar] = useState<{ type: AppSnackbarType; message: string } | null>(
    null
  );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const {
    data: client,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['company', companyId, 'clients', clientId],
    queryFn: () => clientsService.getById(clientId),
    enabled: Boolean(companyId && clientId),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof createClientSchema>, any, CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      type: 'FISICA',
      name: '',
      document: '',
      email: '',
      phone: '',
      whatsapp: '',
      observations: '',
    },
  });

  // Preenche o formulário quando o cliente carrega
  useEffect(() => {
    if (client) {
      reset({
        type: client.type,
        name: client.name,
        document: client.document ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        whatsapp: client.whatsapp ?? '',
        observations: client.observations ?? '',
      });
    }
  }, [client, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.update(clientId, data),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ['company', companyId, 'clients'] });
      }
      setSnackbar({ type: 'success', message: 'Cliente atualizado com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientsService.remove(clientId),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ['company', companyId, 'clients'] });
      }
      router.navigate({ pathname: '/clientes', params: { deleted: '1' } });
    },
    onError: (error: unknown) => {
      setDeleteDialogVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const onSubmit = handleSubmit((data) => {
    updateMutation.mutate(cleanPayload(data));
  });

  if (isLoading) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Cliente' }} />
        <LoadingState text="Carregando cliente..." />
      </ScreenContainer>
    );
  }

  if (isError || !client) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Cliente' }} />
        <ErrorState
          message={
            error ? toApiError(error).message : 'Não foi possível carregar o cliente.'
          }
          onRetry={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll keyboard>
      <Stack.Screen options={{ title: 'Cliente' }} />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Editar cliente</Text>
          <Text style={styles.subtitle}>Atualize os dados do cliente.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Excluir cliente"
          onPress={() => setDeleteDialogVisible(true)}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="trash-outline" size={sizes.icon.lg} color={colors.danger} />
        </Pressable>
      </View>

      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeRow}>
              {CLIENT_TYPES.map((option) => {
                const selected = value === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected }}
                    style={[styles.typeButton, selected && styles.typeButtonSelected]}
                  >
                    <Text
                      style={[styles.typeButtonText, selected && styles.typeButtonTextSelected]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Nome"
            required
            value={value}
            onChangeText={onChange}
            placeholder="Nome do cliente"
            error={errors.name?.message}
            accessibilityLabel="Nome do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="document"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="CPF / CNPJ"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            error={errors.document?.message}
            accessibilityLabel="CPF ou CNPJ do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Telefone"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="(00) 0000-0000"
            keyboardType="phone-pad"
            error={errors.phone?.message}
            accessibilityLabel="Telefone do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="whatsapp"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="WhatsApp"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            error={errors.whatsapp?.message}
            accessibilityLabel="WhatsApp do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="E-mail"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="cliente@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email?.message}
            accessibilityLabel="E-mail do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="observations"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Anotações sobre o cliente (opcional)"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              style={styles.observationsInput}
              accessibilityLabel="Observações do cliente"
            />
          </View>
        )}
      />

      <AppButton
        title="Salvar alterações"
        size="lg"
        loading={updateMutation.isPending}
        onPress={onSubmit}
        accessibilityLabel="Salvar alterações do cliente"
        style={styles.submitButton}
      />

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir "${client.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteDialogVisible(false)}
      />

      <AppSnackbar
        visible={snackbar !== null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type ?? 'success'}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headerText: {
    flex: 1,
  },
  headerAction: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    height: sizes.inputHeight,
    borderRadius: radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  typeButtonTextSelected: {
    color: colors.textOnPrimary,
  },
  observationsInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: borders.width.thin,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 96,
    fontSize: typography.sizes.md,
    color: colors.text,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});