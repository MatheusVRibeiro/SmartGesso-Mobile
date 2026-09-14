import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useCepLookup } from '@/src/hooks/useCepLookup';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { BackButton } from '@/src/components/navigation/BackButton';
import { clientsService } from '@/src/services/api/clients';
import { quotesService } from '@/src/services/api/quotes';
import { toApiError } from '@/src/services/api/client';
import { useSessionStore } from '@/src/store/useSessionStore';
import { radius, sizes, spacing, typography } from '@/src/theme';
import type { ClientType, CreateClientInput } from '@/src/types/client';
import { createClientSchema } from '@/src/validation/schemas';
import type { CreateClientFormData } from '@/src/validation/schemas';
import { createClienteDetalheStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { formatCurrency } from '@/src/utils/format';

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

type ActiveTab = 'resumo' | 'editar';

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

export default function ClienteDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createClienteDetalheStyles(colors, isDark), [colors, isDark]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('resumo');
  const [snackbar, setSnackbar] = useState<{ type: AppSnackbarType; message: string } | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Consulta dados do cliente
  const {
    data: client,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['company', companyId, 'clients', id],
    queryFn: () => clientsService.getById(id),
    enabled: Boolean(companyId && id),
  });

  // Consulta orçamentos da empresa para filtrar os deste cliente
  const { data: quotesData } = useQuery({
    queryKey: ['company', companyId, 'quotes'],
    queryFn: () => quotesService.list(),
    enabled: Boolean(companyId && id),
  });

  const clientQuotes = useMemo(() => {
    if (!quotesData || !id) return [];
    const list = Array.isArray(quotesData) ? quotesData : [];
    return list.filter((q) => q.client?.id === id || (q as any).clientId === id);
  }, [quotesData, id]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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

  const { handleCepChange } = useCepLookup();

  useEffect(() => {
    if (client) {
      reset({
        type: client.type,
        name: client.name,
        document: client.document ?? '',
        phone: client.phone ?? '',
        whatsapp: client.whatsapp ?? '',
        email: client.email ?? '',
        observations: client.observations ?? '',
        address: {
          zipCode: client.postalCode ?? '',
          street: client.street ?? '',
          number: client.number ?? '',
          complement: client.complement ?? '',
          neighborhood: client.district ?? '',
          city: client.city ?? '',
          state: client.state ?? '',
        },
      });
    }
  }, [client, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['company', companyId, 'clients', id], updated);
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ['company', companyId, 'clients'] });
      }
      setSnackbar({ type: 'success', message: 'Dados atualizados com sucesso' });
      setActiveTab('resumo');
    },
    onError: (err: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientsService.remove(id),
    onSuccess: () => {
      setDeleteDialogVisible(false);
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: ['company', companyId, 'clients'] });
      }
      router.navigate({ pathname: '/clientes', params: { deleted: '1' } });
    },
    onError: (err: unknown) => {
      setDeleteDialogVisible(false);
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const onSubmit = handleSubmit((data: CreateClientFormData) => {
    updateMutation.mutate(cleanPayload(data));
  });

  const rawWhatsapp = client?.whatsapp?.replace(/\D/g, '');
  const rawPhone = client?.phone?.replace(/\D/g, '');

  const openWhatsapp = useCallback(() => {
    if (!rawWhatsapp) return;
    Linking.openURL(`https://wa.me/55${rawWhatsapp}`).catch(() => {});
  }, [rawWhatsapp]);

  const openCall = useCallback(() => {
    if (!rawPhone) return;
    Linking.openURL(`tel:${rawPhone}`).catch(() => {});
  }, [rawPhone]);

  const openEmail = useCallback(() => {
    if (!client?.email) return;
    Linking.openURL(`mailto:${client.email}`).catch(() => {});
  }, [client?.email]);

  const fullAddress = useMemo(() => {
    if (!client) return '';
    const { street, number, complement, district, city, state, postalCode } = client;
    const parts = [
      street ? `${street}${number ? `, ${number}` : ''}` : '',
      complement,
      district,
      city ? `${city}${state ? ` - ${state}` : ''}` : '',
      postalCode ? `CEP: ${postalCode}` : '',
    ].filter(Boolean);
    return parts.join(', ');
  }, [client]);

  const openMaps = useCallback(() => {
    if (!fullAddress) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    Linking.openURL(url).catch(() => {});
  }, [fullAddress]);

  if (isLoading) {
    return (
      <ScreenContainer padding={false} keyboard={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={40} width="60%" />
          <Skeleton height={140} style={{ borderRadius: radius.xl }} />
          <Skeleton height={200} style={{ borderRadius: radius.xl }} />
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !client) {
    return (
      <ScreenContainer padding={false} keyboard={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState
          message={toApiError(error).message ?? 'Cliente não encontrado.'}
          onRetry={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  const isPJ = client.type === 'JURIDICA';

  return (
    <ScreenContainer padding={false} keyboard={false} maxContentWidth={920}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.outerContainer}>
        <View style={styles.innerContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={refetch}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {/* ── Cabeçalho com BackButton ── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <BackButton fallback="/(app)/clientes" />
                <View style={styles.headerTitles}>
                  <Text style={styles.title} numberOfLines={1}>
                    {client.name}
                  </Text>
                  <Text style={styles.subtitle}>Perfil e histórico do cliente</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setDeleteDialogVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Excluir cliente"
                style={styles.headerDeleteBtn}
                hitSlop={6}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={isDark ? '#F87171' : '#DC2626'}
                />
              </TouchableOpacity>
            </View>

            {/* ── Profile Hero Card ── */}
            <View style={styles.heroCardWrapper}>
              <AppCard shadow="none" radius={radius.xl} style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View
                    style={[
                      styles.heroAvatar,
                      {
                        backgroundColor: isPJ
                          ? isDark
                            ? 'rgba(168, 85, 247, 0.18)'
                            : 'rgba(147, 51, 234, 0.12)'
                          : isDark
                            ? 'rgba(94, 106, 210, 0.18)'
                            : 'rgba(30, 64, 175, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.heroAvatarText,
                        { color: isPJ ? (isDark ? '#C084FC' : '#9333EA') : (isDark ? '#8B93E6' : colors.primary) },
                      ]}
                    >
                      {getInitials(client.name)}
                    </Text>
                  </View>

                  <View style={styles.heroInfo}>
                    <View style={styles.heroNameRow}>
                      <Text style={styles.heroName} numberOfLines={1}>
                        {client.name}
                      </Text>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: isPJ
                              ? isDark
                                ? 'rgba(168, 85, 247, 0.15)'
                                : 'rgba(147, 51, 234, 0.1)'
                              : isDark
                                ? 'rgba(94, 106, 210, 0.15)'
                                : 'rgba(30, 64, 175, 0.1)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            { color: isPJ ? (isDark ? '#C084FC' : '#9333EA') : (isDark ? '#8B93E6' : colors.primary) },
                          ]}
                        >
                          {isPJ ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        </Text>
                      </View>
                    </View>

                    {client.document ? (
                      <Text style={styles.heroDoc}>
                        {isPJ ? 'CNPJ: ' : 'CPF: '}{client.document}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Ações Rápidas Hero */}
                <View style={styles.quickActionsStrip}>
                  {rawWhatsapp ? (
                    <TouchableOpacity
                      onPress={openWhatsapp}
                      style={[styles.heroActionBtn, styles.heroActionBtnWhatsapp]}
                      accessibilityRole="button"
                      accessibilityLabel="Conversar no WhatsApp"
                    >
                      <Ionicons name="logo-whatsapp" size={14} color={isDark ? '#4ADE80' : '#059669'} />
                      <Text style={styles.heroActionTextWhatsapp}>WhatsApp</Text>
                    </TouchableOpacity>
                  ) : null}

                  {rawPhone ? (
                    <TouchableOpacity
                      onPress={openCall}
                      style={styles.heroActionBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Ligar para o cliente"
                    >
                      <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.heroActionText}>Ligar</Text>
                    </TouchableOpacity>
                  ) : null}

                  {client.email ? (
                    <TouchableOpacity
                      onPress={openEmail}
                      style={styles.heroActionBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Enviar e-mail"
                    >
                      <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.heroActionText}>E-mail</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    onPress={() =>
                      router.push({ pathname: '/orcamentos/novo', params: { clientId: client.id } })
                    }
                    style={[styles.heroActionBtn, styles.heroActionBtnPrimary]}
                    accessibilityRole="button"
                    accessibilityLabel="Novo orçamento para este cliente"
                  >
                    <Ionicons name="add" size={14} color={isDark ? '#8B93E6' : colors.primary} />
                    <Text style={styles.heroActionTextPrimary}>Novo Orçamento</Text>
                  </TouchableOpacity>
                </View>
              </AppCard>
            </View>

            {/* ── Segment Tabs: Visão Geral vs Editar ── */}
            <View style={styles.tabsWrapper}>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  onPress={() => setActiveTab('resumo')}
                  style={[
                    styles.segmentTab,
                    activeTab === 'resumo' && styles.segmentTabActive,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === 'resumo' }}
                >
                  <Ionicons
                    name="grid-outline"
                    size={14}
                    color={activeTab === 'resumo' ? colors.text : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.segmentTabText,
                      activeTab === 'resumo' && styles.segmentTabTextActive,
                    ]}
                  >
                    Visão Geral
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveTab('editar')}
                  style={[
                    styles.segmentTab,
                    activeTab === 'editar' && styles.segmentTabActive,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === 'editar' }}
                >
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color={activeTab === 'editar' ? colors.text : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.segmentTabText,
                      activeTab === 'editar' && styles.segmentTabTextActive,
                    ]}
                  >
                    Editar Cadastro
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── TAB 1: VISÃO GERAL ── */}
            {activeTab === 'resumo' ? (
              <View style={styles.sectionWrapper}>
                {/* Contatos */}
                <AppCard shadow="none" radius={radius.xl} style={styles.detailCard}>
                  <View style={styles.cardSectionTitleRow}>
                    <Ionicons name="call-outline" size={14} color={colors.primary} />
                    <Text style={styles.cardSectionTitle}>Contato</Text>
                  </View>

                  <View style={styles.contactRow}>
                    <View style={styles.contactRowLeft}>
                      <Ionicons name="call-outline" size={15} color={colors.textLight} />
                      <View>
                        <Text style={styles.contactLabel}>Telefone</Text>
                        <Text style={styles.contactValue}>{client.phone || 'Não informado'}</Text>
                      </View>
                    </View>
                    {rawPhone ? (
                      <TouchableOpacity onPress={openCall} style={styles.contactRowAction}>
                        <Text style={styles.contactRowActionText}>Ligar</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.contactRow}>
                    <View style={styles.contactRowLeft}>
                      <Ionicons name="logo-whatsapp" size={15} color={isDark ? '#4ADE80' : '#059669'} />
                      <View>
                        <Text style={styles.contactLabel}>WhatsApp</Text>
                        <Text style={styles.contactValue}>{client.whatsapp || 'Não informado'}</Text>
                      </View>
                    </View>
                    {rawWhatsapp ? (
                      <TouchableOpacity onPress={openWhatsapp} style={styles.contactRowAction}>
                        <Text style={styles.contactRowActionText}>Conversar</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
                    <View style={styles.contactRowLeft}>
                      <Ionicons name="mail-outline" size={15} color={colors.textLight} />
                      <View>
                        <Text style={styles.contactLabel}>E-mail</Text>
                        <Text style={styles.contactValue}>{client.email || 'Não informado'}</Text>
                      </View>
                    </View>
                    {client.email ? (
                      <TouchableOpacity onPress={openEmail} style={styles.contactRowAction}>
                        <Text style={styles.contactRowActionText}>Enviar</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </AppCard>

                {/* Endereço */}
                <AppCard shadow="none" radius={radius.xl} style={styles.detailCard}>
                  <View style={styles.cardSectionTitleRow}>
                    <Ionicons name="location-outline" size={14} color={colors.primary} />
                    <Text style={styles.cardSectionTitle}>Endereço</Text>
                  </View>

                  {fullAddress ? (
                    <View style={{ gap: spacing.sm }}>
                      <Text style={styles.addressText}>{fullAddress}</Text>
                      <TouchableOpacity
                        onPress={openMaps}
                        style={styles.mapsButton}
                        accessibilityRole="button"
                        accessibilityLabel="Abrir endereço no Google Maps"
                      >
                        <Ionicons name="navigate-outline" size={14} color={isDark ? colors.text : colors.primary} />
                        <Text style={styles.mapsButtonText}>Abrir no Google Maps</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.observationsText}>Nenhum endereço cadastrado.</Text>
                  )}
                </AppCard>

                {/* Orçamentos do Cliente */}
                <AppCard shadow="none" radius={radius.xl} style={styles.detailCard}>
                  <View style={styles.cardSectionTitleRow}>
                    <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                    <Text style={styles.cardSectionTitle}>
                      Orçamentos ({clientQuotes.length})
                    </Text>
                  </View>

                  {clientQuotes.length > 0 ? (
                    <View style={{ marginTop: 4 }}>
                      {clientQuotes.map((q) => (
                        <TouchableOpacity
                          key={q.id}
                          onPress={() => router.push(`/orcamentos/${q.id}`)}
                          style={styles.quoteItemCard}
                          activeOpacity={0.7}
                        >
                          <View style={styles.quoteItemLeft}>
                            <Text style={styles.quoteItemTitle}>
                              Orçamento #{q.quoteNumber}
                            </Text>
                            <Text style={styles.quoteItemMeta}>
                              {new Date(q.createdAt).toLocaleDateString('pt-BR')} • {q.status}
                            </Text>
                          </View>
                          <View style={styles.quoteItemRight}>
                            <Text style={styles.quoteItemTotal}>
                              {formatCurrency(q.total)}
                            </Text>
                            <Ionicons name="chevron-forward" size={13} color={colors.textLight} />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={{ gap: spacing.xs, marginVertical: spacing.xs }}>
                      <Text style={styles.observationsText}>
                        Nenhum orçamento emitido para este cliente ainda.
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: '/orcamentos/novo',
                            params: { clientId: client.id },
                          })
                        }
                        style={styles.mapsButton}
                      >
                        <Ionicons name="add" size={14} color={isDark ? colors.text : colors.primary} />
                        <Text style={styles.mapsButtonText}>Criar Primeiro Orçamento</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </AppCard>

                {/* Observações */}
                {client.observations ? (
                  <AppCard shadow="none" radius={radius.xl} style={styles.detailCard}>
                    <View style={styles.cardSectionTitleRow}>
                      <Ionicons name="chatbox-outline" size={14} color={colors.primary} />
                      <Text style={styles.cardSectionTitle}>Observações</Text>
                    </View>
                    <Text style={styles.observationsText}>{client.observations}</Text>
                  </AppCard>
                ) : null}

                {/* Botão rápido para ir à aba de edição */}
                <AppButton
                  title="Editar dados completos"
                  variant="outline"
                  size="md"
                  onPress={() => setActiveTab('editar')}
                  style={styles.editAllButton}
                />
              </View>
            ) : (
              /* ── TAB 2: EDITAR CADASTRO ── */
              <View style={styles.formWrapper}>
                <Text style={styles.sectionTitle}>Tipo de Cliente</Text>
                <Controller
                  control={control}
                  name="type"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.fieldGroup}>
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
                    </View>
                  )}
                />

                <Text style={styles.sectionTitle}>Dados Básicos</Text>

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

                <View style={styles.addressRow}>
                  <View style={styles.addressFieldHalf}>
                    <Controller
                      control={control}
                      name="address.zipCode"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="CEP"
                          value={value ?? ''}
                          onChangeText={(text) => handleCepChange(text, handleApplyAddress, onChange)}
                          mask="cep"
                          placeholder="00000-000"
                          accessibilityLabel="CEP do cliente"
                        />
                      )}
                    />
                  </View>
                  <View style={styles.addressFieldHalf}>
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
                  </View>
                </View>

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

                <View style={styles.addressRow}>
                  <View style={styles.addressFieldHalf}>
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
                  </View>
                  <View style={styles.addressFieldHalf}>
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
                </View>

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

                <TouchableOpacity
                  onPress={() => setDeleteDialogVisible(true)}
                  style={styles.deleteAccountBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Excluir este cliente"
                >
                  <Ionicons name="trash-outline" size={16} color={isDark ? '#F87171' : '#DC2626'} />
                  <Text style={styles.deleteAccountText}>Excluir cliente</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Excluir cliente"
        message={'Tem certeza que deseja excluir "' + client.name + '"? Esta ação não pode ser desfeita.'}
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
