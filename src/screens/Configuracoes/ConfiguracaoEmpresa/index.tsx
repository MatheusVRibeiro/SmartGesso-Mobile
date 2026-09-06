import React, { useEffect, useState, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import {
  createDefaultSettings,
  settingsService,
} from '@/src/services/settings/localSettings';
import type { AppSettings } from '@/src/services/settings/localSettings';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import { companySettingsSchema } from '@/src/validation/schemas';
import type { CompanySettingsFormData } from '@/src/validation/schemas';
import { createConfiguracaoEmpresaStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function ConfiguracoesEmpresaScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createConfiguracaoEmpresaStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id ?? null);
  const activeCompany = useSessionStore((s) => s.activeCompany);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<AppSettings | null>(null);
  const [snackbar, setSnackbar] = useState<{ type: AppSnackbarType; message: string } | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      tradeName: '',
      document: '',
      phone: '',
      email: '',
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!companyId) {
        setIsLoading(false);
        return;
      }
      const local = await settingsService.get(companyId);
      const base = local ?? createDefaultSettings(activeCompany?.company);
      if (!mounted) return;

      setCurrentSettings(base);
      reset({
        tradeName: base.company.tradeName,
        document: base.company.document,
        phone: base.company.phone,
        email: base.company.email,
        address: { ...base.company.address },
      });
      setIsLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const onSubmit = handleSubmit(async (data) => {
    if (!companyId || !currentSettings) {
      setSnackbar({ type: 'error', message: 'Nenhuma empresa selecionada.' });
      return;
    }
    setIsSaving(true);
    try {
      await settingsService.save(companyId, {
        ...currentSettings,
        company: {
          tradeName: data.tradeName,
          document: data.document ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          address: {
            zipCode: data.address?.zipCode ?? '',
            street: data.address?.street ?? '',
            number: data.address?.number ?? '',
            complement: data.address?.complement ?? '',
            neighborhood: data.address?.neighborhood ?? '',
            city: data.address?.city ?? '',
            state: data.address?.state ?? '',
          },
        },
      });
      setSnackbar({ type: 'success', message: 'Dados da empresa salvos neste dispositivo.' });
    } catch {
      setSnackbar({ type: 'error', message: 'Não foi possível salvar. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  });

  if (!companyId) {
    return (
      <ScreenContainer>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Ionicons
              name="business-outline"
              size={sizes.icon.xl}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma empresa selecionada</Text>
          <Text style={styles.emptyDescription}>
            Selecione uma empresa para editar os dados.
          </Text>
          <AppButton
            title="Selecionar empresa"
            variant="primary"
            onPress={() => router.replace('/(company)/select-company')}
            style={styles.emptyButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll padding keyboard>
      {/* Aviso: persistência local (API ainda não expõe endpoint de settings) */}
      <View style={styles.warningBanner} accessibilityRole="alert">
        <Ionicons
          name="cloud-offline-outline"
          size={sizes.icon.md}
          color={colors.warning}
          accessibilityElementsHidden
        />
        <Text style={styles.warningText}>
          As alterações são salvas apenas neste dispositivo. A sincronização com a nuvem estará
          disponível em breve.
        </Text>
      </View>

      {isLoading ? (
        <LoadingState text="Carregando dados da empresa..." />
      ) : (
        <>
          {/* ── Dados da empresa ── */}
          <Text style={styles.sectionTitle}>Dados da empresa</Text>

          <Controller
            control={control}
            name="tradeName"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Nome fantasia"
                value={value}
                onChangeText={onChange}
                placeholder="Ex.: Gesso & Drywall Silva"
                error={errors.tradeName?.message}
                autoCapitalize="words"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="document"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="CNPJ"
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="00.000.000/0000-00"
                error={errors.document?.message}
                keyboardType="numbers-and-punctuation"
                maxLength={18}
              />
            )}
          />

          {/* ── Contato ── */}
          <Text style={styles.sectionTitle}>Contato</Text>

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Telefone"
                value={value ?? ''}
                onChangeText={onChange}
                mask="phone"
                placeholder="(00) 00000-0000"
                error={errors.phone?.message}
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
                placeholder="contato@empresa.com.br"
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          {/* ── Endereço ── */}
          <Text style={styles.sectionTitle}>Endereço</Text>

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
                error={errors.address?.zipCode?.message}
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
                placeholder="Rua, avenida..."
                error={errors.address?.street?.message}
                autoCapitalize="words"
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Controller
                control={control}
                name="address.number"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Número"
                    value={value ?? ''}
                    onChangeText={onChange}
                    placeholder="123"
                    error={errors.address?.number?.message}
                  />
                )}
              />
            </View>
            <View style={styles.rowItem}>
              <Controller
                control={control}
                name="address.complement"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Complemento"
                    value={value ?? ''}
                    onChangeText={onChange}
                    placeholder="Sala, bloco..."
                    error={errors.address?.complement?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="address.neighborhood"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Bairro"
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="Centro"
                error={errors.address?.neighborhood?.message}
                autoCapitalize="words"
              />
            )}
          />

          <View style={styles.row}>
            <View style={[styles.rowItem, styles.rowItemWide]}>
              <Controller
                control={control}
                name="address.city"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Cidade"
                    value={value ?? ''}
                    onChangeText={onChange}
                    placeholder="São Paulo"
                    error={errors.address?.city?.message}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            <View style={styles.rowItemState}>
              <Controller
                control={control}
                name="address.state"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="UF"
                    value={value ?? ''}
                    onChangeText={(text) => onChange(text.toUpperCase())}
                    placeholder="SP"
                    error={errors.address?.state?.message}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.actionsSection}>
            <AppButton
              title="Salvar alterações"
              variant="primary"
              size="lg"
              loading={isSaving}
              onPress={onSubmit}
              accessibilityLabel="Salvar dados da empresa"
            />
          </View>
        </>
      )}

      <AppSnackbar
        visible={snackbar !== null}
        message={snackbar?.message ?? ''}
        type={snackbar?.type ?? 'info'}
        onHide={() => setSnackbar(null)}
      />
    </ScreenContainer>
  );
}
