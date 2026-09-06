import React, { useEffect, useState, useMemo } from 'react';
import { Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { clientsService } from '@/src/services/api/clients';
import { toApiError } from '@/src/services/api/client';
import { useSessionStore } from '@/src/store/useSessionStore';
import { borders, colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { ClientType, CreateClientInput } from '@/src/types/client';
import { createClientSchema } from '@/src/validation/schemas';
import type { CreateClientFormData } from '@/src/validation/schemas';
import { createClienteDetalheStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: 'FISICA', label: 'Pessoa Física' },
  { value: 'JURIDICA', label: 'Pessoa Jurídica' },
];

const ADDRESS_DEFAULTS = {
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

/** Remove strings vazias antes de enviar (DTO usa @IsOptional — string vazia falharia). */
function cleanPayload(data: CreateClientFormData): CreateClientInput {
  const addr = data.address;
  const hasAddress = addr && Object.values(addr).some((v) => v && v.trim());
  return {
    type: data.type,
    name: data.name,
    document: data.document?.trim() || undefined,
    email: data.email?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    whatsapp: data.whatsapp?.trim() || undefined,
    observations: data.observations?.trim() || undefined,
    ...(hasAddress
      ? {
          address: {
            zipCode: addr?.zipCode?.trim() || undefined,
            street: addr?.street?.trim() || undefined,
            number: addr?.number?.trim() || undefined,
            complement: addr?.complement?.trim() || undefined,
            neighborhood: addr?.neighborhood?.trim() || undefined,
            city: addr?.city?.trim() || undefined,
            state: addr?.state?.trim() || undefined,
          },
        }
      : {}),
  };
}

export default function ClienteDetailScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createClienteDetalheStyles(colors, isDark), [colors, isDark]);
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string }>();
  const clientId = params.id ?? '';
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);

  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
      address: { ...ADDRESS_DEFAULTS },
      observations: '',
    },
  });

  // Preenche o formulário quando o cliente carrega (incluindo endereço)
  useEffect(() => {
    if (client) {
      reset({
        type: client.type,
        name: client.name,
        document: client.document ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        whatsapp: client.whatsapp ?? '',
        address: {
          zipCode: client.postalCode ?? '',
          street: client.street ?? '',
          number: client.number ?? '',
          complement: client.complement ?? '',
          neighborhood: client.district ?? '',
          city: client.city ?? '',
          state: client.state ?? '',
        },
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
      
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />

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

      {/* ── Dados básicos ── */}
      <Text style={styles.sectionTitle}>Dados básicos</Text>

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
            mask="cpfCnpj"
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
            mask="phone"
            placeholder="(00) 0000-0000"
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
            mask="phone"
            placeholder="(00) 00000-0000"
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

      {/* ── Endereço ── */}
      <Text style={styles.sectionTitle}>Endereço</Text>
      <Text style={styles.sectionSubtitle}>Campos opcionais — preencha se disponível.</Text>

      <Controller
        control={control}
        name="address.zipCode"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="CEP"
            value={value ?? ''}
            onChangeText={onChange}
            mask="cep"
            placeholder="00000-000"
            accessibilityLabel="CEP do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="address.street"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Rua"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="Nome da rua"
            accessibilityLabel="Rua do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="address.number"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Número"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="Nº"
            keyboardType="number-pad"
            accessibilityLabel="Número do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="address.complement"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Complemento"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="Apto, bloco, etc. (opcional)"
            accessibilityLabel="Complemento do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="address.neighborhood"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Bairro"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="Nome do bairro"
            accessibilityLabel="Bairro do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="address.city"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Cidade"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="Nome da cidade"
            accessibilityLabel="Cidade do cliente"
          />
        )}
      />

      <Controller
        control={control}
        name="address.state"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Estado"
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="UF"
            maxLength={2}
            autoCapitalize="characters"
            accessibilityLabel="Estado do cliente"
          />
        )}
      />

      {/* ── Observações ── */}
      <Text style={styles.sectionTitle}>Observações</Text>

      <Controller
        control={control}
        name="observations"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldGroup}>
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
