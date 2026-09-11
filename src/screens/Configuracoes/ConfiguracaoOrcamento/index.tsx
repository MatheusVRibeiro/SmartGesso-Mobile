import React, { useEffect, useState, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { borders, colors, radius, sizes, spacing, typography } from '@/src/theme';
import { quoteSettingsSchema } from '@/src/validation/schemas';
import type { QuoteSettingsFormData } from '@/src/validation/schemas';
import type { QuotePaymentMethod } from '@/src/types/quote';
import { createConfiguracaoOrcamentoStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type QuoteSettingsFormValues = z.input<typeof quoteSettingsSchema>;

const PAYMENT_METHOD_OPTIONS: { value: QuotePaymentMethod; label: string }[] = [
  { value: 'AVISTA', label: 'À vista' },
  { value: 'AVISTA_DESCONTO', label: 'À vista c/ desconto' },
  { value: 'ENTRADA_SALDO', label: 'Entrada + saldo' },
  { value: 'QUINZENAL_2X', label: 'Quinzenal 2x' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'PARCELADO', label: 'Parcelado' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
];

export default function ConfiguracoesOrcamentoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createConfiguracaoOrcamentoStyles(colors, isDark), [colors, isDark]);
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
  } = useForm<QuoteSettingsFormValues>({
    resolver: zodResolver(quoteSettingsSchema),
    defaultValues: {
      numberingPrefix: 'ORC',
      defaultLossPct: 10,
      warrantyDays: 90,
      paymentMethods: ['AVISTA'],
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
        numberingPrefix: base.quote.numberingPrefix,
        defaultLossPct: base.quote.defaultLossPct,
        warrantyDays: base.quote.warrantyDays,
        paymentMethods: base.quote.paymentMethods,
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
        quote: {
          numberingPrefix: data.numberingPrefix,
          defaultLossPct: Number(data.defaultLossPct) || 0,
          warrantyDays: Number(data.warrantyDays) || 0,
          paymentMethods: data.paymentMethods,
        },
      });
      setSnackbar({ type: 'success', message: 'Configurações de orçamento salvas neste dispositivo.' });
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
              name="document-text-outline"
              size={sizes.icon.xl}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma empresa selecionada</Text>
          <Text style={styles.emptyDescription}>
            Selecione uma empresa para configurar os orçamentos.
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
        <LoadingState text="Carregando configurações..." />
      ) : (
        <>
          {/* ── Numeração ── */}
          <Text style={styles.sectionTitle}>Numeração</Text>

          <Controller
            control={control}
            name="numberingPrefix"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Prefixo da numeração"
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                placeholder="Ex.: ORC"
                helper="Ex.: ORC-0001, ORC-0002..."
                error={errors.numberingPrefix?.message}
                maxLength={10}
                autoCapitalize="characters"
                required
              />
            )}
          />

          {/* ── Padrões de orçamento ── */}
          <Text style={styles.sectionTitle}>Padrões de orçamento</Text>

          <Controller
            control={control}
            name="defaultLossPct"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Perda padrão (%)"
                value={value == null ? '' : String(value)}
                onChangeText={onChange}
                placeholder="Ex.: 10"
                helper="Percentual de perda de material aplicado por padrão."
                error={errors.defaultLossPct?.message}
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="warrantyDays"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Garantia (dias)"
                value={value == null ? '' : String(value)}
                onChangeText={onChange}
                placeholder="Ex.: 90"
                helper="Prazo de garantia padrão dos serviços."
                error={errors.warrantyDays?.message}
                keyboardType="numeric"
              />
            )}
          />

          {/* ── Formas de pagamento ── */}
          <Text style={styles.sectionTitle}>Formas de pagamento</Text>

          <Controller
            control={control}
            name="paymentMethods"
            render={({ field: { onChange, value } }) => {
              const selected = Array.isArray(value) ? value : [];
              const toggle = (method: QuotePaymentMethod) => {
                const next = selected.includes(method)
                  ? selected.filter((m) => m !== method)
                  : [...selected, method];
                onChange(next);
              };
              return (
                <View style={styles.fieldGroup}>
                  <View style={styles.chipWrap}>
                    {PAYMENT_METHOD_OPTIONS.map((option) => {
                      const isSelected = selected.includes(option.value);
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => toggle(option.value)}
                          accessibilityRole="checkbox"
                          accessibilityLabel={option.label}
                          accessibilityState={{ checked: isSelected }}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                        >
                          <Text
                            style={[styles.chipText, isSelected && styles.chipTextSelected]}
                          >
                            {option.label}
                          </Text>
                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={sizes.icon.sm}
                              color={colors.primary}
                              accessibilityElementsHidden
                            />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                  {errors.paymentMethods?.message ? (
                    <Text style={styles.chipError}>{errors.paymentMethods.message}</Text>
                  ) : null}
                </View>
              );
            }}
          />

          <View style={styles.actionsSection}>
            <AppButton
              title="Salvar alterações"
              variant="primary"
              size="lg"
              loading={isSaving}
              onPress={onSubmit}
              accessibilityLabel="Salvar configurações de orçamento"
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
