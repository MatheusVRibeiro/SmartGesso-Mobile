import React, { useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useCepLookup } from '@/src/hooks/useCepLookup';
import { useCnpjLookup } from '@/src/hooks/useCnpjLookup';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { PhotoPicker } from '@/src/components/domain/PhotoPicker';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { BackButton } from '@/src/components/navigation/BackButton';
import { clientsService } from '@/src/services/api/clients';
import { toApiError } from '@/src/services/api/client';
import { savePhotoLocally } from '@/src/services/photos/photoStorage';
import { useSessionStore } from '@/src/store/useSessionStore';
import { radius, sizes, spacing, typography } from '@/src/theme';
import type { PhotoAttachment } from '@/src/types/photo';
import type { ClientType, CreateClientInput } from '@/src/types/client';
import { createClientSchema } from '@/src/validation/schemas';
import type { CreateClientFormData } from '@/src/validation/schemas';
import { createNovoClienteStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const CLIENT_TYPES: { value: ClientType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'FISICA', label: 'Pessoa Física', icon: 'person-outline' },
  { value: 'JURIDICA', label: 'Pessoa Jurídica', icon: 'business-outline' },
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
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovoClienteStyles(colors, isDark), [colors, isDark]);

  const [photo, setPhoto] = useState<PhotoAttachment | null>(null);
  const [snackbar, setSnackbar] = useState<{ type: AppSnackbarType; message: string } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClientFormData, any, CreateClientFormData>({
    resolver: zodResolver(createClientSchema) as any,
    defaultValues: {
      type: 'FISICA',
      name: '',
      document: '',
      phone: '',
      whatsapp: '',
      email: '',
      observations: '',
      address: ADDRESS_DEFAULTS,
    },
  });

  const selectedType = watch('type');
  const currentPhone = watch('phone');
  const isPJ = selectedType === 'JURIDICA';

  const handleApplyAddress = (addr: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  }) => {
    setValue('address.street', addr.street);
    setValue('address.neighborhood', addr.neighborhood);
    setValue('address.city', addr.city);
    setValue('address.state', addr.state);
  };

  const handleApplyCompany = (company: any) => {
    setValue('name', company.nomeFantasia || company.razaoSocial);
    if (company.phone) {
      setValue('phone', company.phone);
      setValue('whatsapp', company.phone);
    }
    if (company.email) {
      setValue('email', company.email);
    }
    if (company.address) {
      if (company.address.zipCode) setValue('address.zipCode', company.address.zipCode);
      if (company.address.street) setValue('address.street', company.address.street);
      if (company.address.number) setValue('address.number', company.address.number);
      if (company.address.complement) setValue('address.complement', company.address.complement);
      if (company.address.neighborhood) setValue('address.neighborhood', company.address.neighborhood);
      if (company.address.city) setValue('address.city', company.address.city);
      if (company.address.state) setValue('address.state', company.address.state);
    }
  };

  const { handleCepChange, searchCep, isLoading: isLoadingCep, error: cepError } = useCepLookup();
  const { handleCnpjChange, isLoading: isLoadingCnpj, error: cnpjError } = useCnpjLookup();

  const copyPhoneToWhatsapp = useCallback(() => {
    if (currentPhone) {
      setValue('whatsapp', currentPhone);
    }
  }, [currentPhone, setValue]);

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

  const onSubmit = handleSubmit(async (data: CreateClientFormData) => {
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
    <ScreenContainer padding={false} keyboard={false} maxContentWidth={920}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── Cabeçalho com BackButton ── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <BackButton fallback="/(app)/clientes" />
                <View style={styles.headerTitles}>
                  <Text style={styles.title}>Novo cliente</Text>
                  <Text style={styles.subtitle}>
                    Preencha os dados de identificação e contato
                  </Text>
                </View>
              </View>
            </View>

            {/* ── CARD 1: Identificação & Tipo ── */}
            <View style={styles.cardSection}>
              <AppCard shadow="none" radius={radius.xl} style={styles.formCard}>
                <View style={styles.cardSectionHeader}>
                  <View style={styles.cardSectionTitleGroup}>
                    <Ionicons
                      name={isPJ ? 'business-outline' : 'person-outline'}
                      size={15}
                      color={isDark ? '#8B93E6' : colors.primary}
                    />
                    <Text style={styles.cardSectionTitle}>Identificação</Text>
                  </View>
                  <Text style={styles.cardSectionBadge}>Obrigatório</Text>
                </View>

                {/* Alternância PF / PJ */}
                <Controller
                  control={control}
                  name="type"
                  render={({ field: { onChange, value } }) => (
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
                            style={[
                              styles.typeButton,
                              selected && styles.typeButtonSelected,
                            ]}
                          >
                            <Ionicons
                              name={option.icon}
                              size={15}
                              color={
                                selected
                                  ? isDark
                                    ? '#8B93E6'
                                    : colors.primary
                                  : colors.textSecondary
                              }
                            />
                            <Text
                              style={[
                                styles.typeButtonText,
                                selected && styles.typeButtonTextSelected,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />

                {/* Nome */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label={isPJ ? 'Razão Social / Nome Fantasia' : 'Nome Completo'}
                      required
                      value={value}
                      onChangeText={onChange}
                      placeholder={isPJ ? 'Ex: Gesso Decorações Ltda' : 'Ex: João da Silva'}
                      error={errors.name?.message}
                      accessibilityLabel="Nome do cliente"
                      leftAccessory={
                        <Ionicons
                          name="person-outline"
                          size={sizes.icon.sm}
                          color={colors.textLight}
                        />
                      }
                    />
                  )}
                />

                {/* CPF ou CNPJ */}
                <Controller
                  control={control}
                  name="document"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label={isPJ ? 'CNPJ' : 'CPF'}
                      value={value ?? ''}
                      onChangeText={(text) =>
                        handleCnpjChange(text, handleApplyCompany, onChange)
                      }
                      mask="cpfCnpj"
                      placeholder={isPJ ? '00.000.000/0000-00' : '000.000.000-00'}
                      rightAccessory={
                        isLoadingCnpj ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : null
                      }
                      helper={
                        isLoadingCnpj
                          ? 'Buscando dados na Receita Federal...'
                          : isPJ
                            ? 'Preenchimento automático ao informar CNPJ'
                            : undefined
                      }
                      error={errors.document?.message || cnpjError || undefined}
                      accessibilityLabel={isPJ ? 'CNPJ do cliente' : 'CPF do cliente'}
                      leftAccessory={
                        <Ionicons
                          name="card-outline"
                          size={sizes.icon.sm}
                          color={colors.textLight}
                        />
                      }
                    />
                  )}
                />
              </AppCard>
            </View>

            {/* ── CARD 2: Contatos ── */}
            <View style={styles.cardSection}>
              <AppCard shadow="none" radius={radius.xl} style={styles.formCard}>
                <View style={styles.cardSectionHeader}>
                  <View style={styles.cardSectionTitleGroup}>
                    <Ionicons
                      name="call-outline"
                      size={15}
                      color={isDark ? '#4ADE80' : '#059669'}
                    />
                    <Text style={styles.cardSectionTitle}>Contatos</Text>
                  </View>
                </View>

                {/* Telefone */}
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Telefone Principal"
                      value={value ?? ''}
                      onChangeText={onChange}
                      mask="phone"
                      placeholder="(00) 0000-0000"
                      error={errors.phone?.message}
                      accessibilityLabel="Telefone do cliente"
                      leftAccessory={
                        <Ionicons
                          name="call-outline"
                          size={sizes.icon.sm}
                          color={colors.textLight}
                        />
                      }
                    />
                  )}
                />

                {/* WhatsApp com atalho copiar */}
                <View>
                  {Boolean(currentPhone && currentPhone.length > 5) ? (
                    <View style={styles.whatsappHeaderRow}>
                      <Text style={styles.label}>WhatsApp</Text>
                      <TouchableOpacity
                        onPress={copyPhoneToWhatsapp}
                        style={styles.copyPhoneChip}
                        hitSlop={4}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={11}
                          color={isDark ? '#4ADE80' : '#059669'}
                        />
                        <Text style={styles.copyPhoneChipText}>
                          Copiar do telefone
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <Controller
                    control={control}
                    name="whatsapp"
                    render={({ field: { onChange, value } }) => (
                      <AppInput
                        label={Boolean(currentPhone && currentPhone.length > 5) ? undefined : 'WhatsApp'}
                        value={value ?? ''}
                        onChangeText={onChange}
                        mask="phone"
                        placeholder="(00) 00000-0000"
                        error={errors.whatsapp?.message}
                        accessibilityLabel="WhatsApp do cliente"
                        leftAccessory={
                          <Ionicons
                            name="logo-whatsapp"
                            size={sizes.icon.sm}
                            color={isDark ? '#4ADE80' : '#059669'}
                          />
                        }
                      />
                    )}
                  />
                </View>

                {/* E-mail */}
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
                      leftAccessory={
                        <Ionicons
                          name="mail-outline"
                          size={sizes.icon.sm}
                          color={colors.textLight}
                        />
                      }
                    />
                  )}
                />
              </AppCard>
            </View>

            {/* ── CARD 3: Endereço ── */}
            <View style={styles.cardSection}>
              <AppCard shadow="none" radius={radius.xl} style={styles.formCard}>
                <View style={styles.cardSectionHeader}>
                  <View style={styles.cardSectionTitleGroup}>
                    <Ionicons
                      name="location-outline"
                      size={15}
                      color={isDark ? '#F5C366' : '#D97706'}
                    />
                    <Text style={styles.cardSectionTitle}>Endereço</Text>
                  </View>
                  <Text style={styles.cardSectionBadge}>Opcional</Text>
                </View>

                {/* CEP e Número */}
                <View style={styles.gridRow}>
                  <View style={styles.gridCol}>
                    <Controller
                      control={control}
                      name="address.zipCode"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="CEP"
                          value={value ?? ''}
                          onChangeText={(text) =>
                            handleCepChange(text, handleApplyAddress, onChange)
                          }
                          mask="cep"
                          placeholder="00000-000"
                          rightAccessory={
                            isLoadingCep ? (
                              <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                              <TouchableOpacity
                                onPress={() =>
                                  value && searchCep(value, handleApplyAddress, true)
                                }
                                hitSlop={8}
                              >
                                <Ionicons
                                  name="search-outline"
                                  size={16}
                                  color={colors.primary}
                                />
                              </TouchableOpacity>
                            )
                          }
                          helper={isLoadingCep ? 'Buscando CEP...' : undefined}
                          error={
                            errors.address?.zipCode?.message || cepError || undefined
                          }
                          accessibilityLabel="CEP do cliente"
                        />
                      )}
                    />
                  </View>

                  <View style={styles.gridColNarrow}>
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
                          accessibilityLabel="Número"
                        />
                      )}
                    />
                  </View>
                </View>

                {/* Rua */}
                <Controller
                  control={control}
                  name="address.street"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Rua / Logradouro"
                      value={value ?? ''}
                      onChangeText={onChange}
                      placeholder="Nome da rua ou avenida"
                      accessibilityLabel="Rua do cliente"
                    />
                  )}
                />

                {/* Complemento e Bairro */}
                <View style={styles.gridRow}>
                  <View style={styles.gridCol}>
                    <Controller
                      control={control}
                      name="address.complement"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Complemento"
                          value={value ?? ''}
                          onChangeText={onChange}
                          placeholder="Apto, Bloco, etc."
                          accessibilityLabel="Complemento"
                        />
                      )}
                    />
                  </View>

                  <View style={styles.gridCol}>
                    <Controller
                      control={control}
                      name="address.neighborhood"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Bairro"
                          value={value ?? ''}
                          onChangeText={onChange}
                          placeholder="Bairro"
                          accessibilityLabel="Bairro do cliente"
                        />
                      )}
                    />
                  </View>
                </View>

                {/* Cidade e Estado */}
                <View style={styles.gridRow}>
                  <View style={styles.gridCol}>
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
                  </View>

                  <View style={styles.gridColNarrow}>
                    <Controller
                      control={control}
                      name="address.state"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="UF"
                          value={value ?? ''}
                          onChangeText={onChange}
                          placeholder="UF"
                          maxLength={2}
                          autoCapitalize="characters"
                          accessibilityLabel="Estado"
                        />
                      )}
                    />
                  </View>
                </View>
              </AppCard>
            </View>

            {/* ── CARD 4: Observações e Foto ── */}
            <View style={styles.cardSection}>
              <AppCard shadow="none" radius={radius.xl} style={styles.formCard}>
                <View style={styles.cardSectionHeader}>
                  <View style={styles.cardSectionTitleGroup}>
                    <Ionicons
                      name="document-text-outline"
                      size={15}
                      color={isDark ? '#C084FC' : '#9333EA'}
                    />
                    <Text style={styles.cardSectionTitle}>Observações e Anexos</Text>
                  </View>
                  <Text style={styles.cardSectionBadge}>Opcional</Text>
                </View>

                <Controller
                  control={control}
                  name="observations"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Observações Internas</Text>
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="Anotações sobre o cliente, preferências, restrições de horário, etc."
                        placeholderTextColor={colors.textLight}
                        multiline
                        numberOfLines={3}
                        style={styles.observationsInput}
                        accessibilityLabel="Observações do cliente"
                      />
                    </View>
                  )}
                />

                <PhotoPicker
                  label="Foto ou Documento do Cliente"
                  hint="Câmera ou galeria"
                  value={photo}
                  onChange={setPhoto}
                  accessibilityLabel="Foto do cliente"
                />
              </AppCard>
            </View>

            {/* ── Botões de Ação ── */}
            <View style={styles.actionsWrapper}>
              <AppButton
                title="Cadastrar cliente"
                size="lg"
                loading={createMutation.isPending}
                onPress={onSubmit}
                accessibilityLabel="Salvar cliente"
              />

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.cancelButton}
                accessibilityRole="button"
                accessibilityLabel="Cancelar cadastro"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      <AppSnackbar
        visible={snackbar !== null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type ?? 'error'}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}
