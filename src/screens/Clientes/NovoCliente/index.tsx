import React, { useState, useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { PhotoPicker } from '@/src/components/domain/PhotoPicker';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { clientsService } from '@/src/services/api/clients';
import { toApiError } from '@/src/services/api/client';
import { savePhotoLocally } from '@/src/services/photos/photoStorage';
import { useSessionStore } from '@/src/store/useSessionStore';
import { borders, colors, radius, sizes, spacing, typography } from '@/src/theme';
import type { PhotoAttachment } from '@/src/types/photo';
import type { ClientType, CreateClientInput } from '@/src/types/client';
import { createClientSchema } from '@/src/validation/schemas';
import type { CreateClientFormData } from '@/src/validation/schemas';
import { createNovoClienteStyles } from './styles';
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

export default function NovoClienteScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovoClienteStyles(colors, isDark), [colors, isDark]);
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);

  const [snackbar, setSnackbar] = useState<{ type: AppSnackbarType; message: string } | null>(
    null
  );
  const [photo, setPhoto] = useState<PhotoAttachment | null>(null);

  const {
    control,
    handleSubmit,
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

  const createMutation = useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.create(data),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ['company', companyId, 'clients'] });
      }
      router.navigate({ pathname: '/clientes', params: { created: '1' } });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (photo) {
      try {
        await savePhotoLocally(photo, 'clientes');
      } catch {
        setSnackbar({
          type: 'error',
          message: 'Não foi possível salvar a foto no dispositivo',
        });
        return;
      }
    }
    createMutation.mutate(cleanPayload(data));
  });

  return (
    <ScreenContainer scroll keyboard>
      <Stack.Screen options={{ title: 'Novo cliente' }} />

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

      {/* ── Foto (opcional) ── */}
      <Text style={styles.sectionTitle}>Foto</Text>
      <Text style={styles.sectionSubtitle}>Foto do cliente (opcional).</Text>
      <PhotoPicker
        label="Foto do cliente"
        hint="Câmera ou galeria"
        value={photo}
        onChange={setPhoto}
        accessibilityLabel="Foto do cliente"
      />

      <AppButton
        title="Salvar"
        size="lg"
        loading={createMutation.isPending}
        onPress={onSubmit}
        accessibilityLabel="Salvar cliente"
        style={styles.submitButton}
      />

      <AppSnackbar
        visible={snackbar !== null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type ?? 'error'}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}
