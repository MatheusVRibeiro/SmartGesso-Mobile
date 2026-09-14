import React, { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../ui/AppCard';
import { AppInput } from '../../../ui/AppInput';
import { useCepLookup } from '../../../../hooks/useCepLookup';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { radius, spacing } from '../../../../theme';
import { createWizardStyles } from '../wizard/styles';
import type { QuoteLocalDraft } from '../wizard/types';
import type { Client } from '../../../../types/client';

export interface LocalStepProps {
  local: QuoteLocalDraft;
  onChangeField: (field: keyof QuoteLocalDraft, value: string) => void;
  onBulkChange?: (fields: Partial<QuoteLocalDraft>) => void;
  selectedClient?: Client;
  onUseClientAddress?: () => void;
}

export function LocalStep({
  local,
  onChangeField,
  onBulkChange,
  selectedClient,
  onUseClientAddress,
}: LocalStepProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  const { isLoading, error, handleCepChange, searchCep } = useCepLookup();

  const handleApplyAddress = (address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  }) => {
    if (onBulkChange) {
      onBulkChange({
        street: address.street || local.street,
        neighborhood: address.neighborhood || local.neighborhood,
        city: address.city || local.city,
        state: address.state || local.state,
        ...(address.complement && !local.complement ? { complement: address.complement } : {}),
      });
    } else {
      if (address.street) onChangeField('street', address.street);
      if (address.neighborhood) onChangeField('neighborhood', address.neighborhood);
      if (address.city) onChangeField('city', address.city);
      if (address.state) onChangeField('state', address.state);
      if (address.complement && !local.complement) {
        onChangeField('complement', address.complement);
      }
    }
  };

  const handleManualSearch = () => {
    if (local.zipCode) {
      searchCep(local.zipCode, handleApplyAddress, true);
    }
  };

  const clientHasAddr = Boolean(
    selectedClient &&
      (selectedClient.postalCode ||
        selectedClient.street ||
        selectedClient.city)
  );

  const isClientAddressApplied = Boolean(
    clientHasAddr &&
      selectedClient &&
      local.street &&
      local.street.toLowerCase().trim() ===
        (selectedClient.street || '').toLowerCase().trim()
  );

  return (
    <View>
      <Text style={styles.sectionLabel}>Onde o serviço será realizado?</Text>

      {/* Atalho inteligente do endereço do cliente */}
      {clientHasAddr && selectedClient ? (
        isClientAddressApplied ? (
          <View style={[styles.clientAddressBadge, { marginBottom: spacing.md }]}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={isDark ? '#4ADE80' : '#059669'}
            />
            <Text style={styles.clientAddressBadgeText} numberOfLines={1}>
              Endereço preenchido com o cadastro de {selectedClient.name}
            </Text>
          </View>
        ) : onUseClientAddress ? (
          <TouchableOpacity
            onPress={onUseClientAddress}
            style={styles.useClientAddressBtn}
            accessibilityRole="button"
            accessibilityLabel={`Usar endereço cadastrado de ${selectedClient.name}`}
          >
            <Ionicons
              name="location-outline"
              size={16}
              color={isDark ? '#8B93E6' : colors.primary}
            />
            <Text style={styles.useClientAddressText}>
              Usar endereço cadastrado de {selectedClient.name}
            </Text>
          </TouchableOpacity>
        ) : null
      ) : null}

      <AppCard shadow="none" radius={radius.xl} style={{ padding: spacing.lg }}>
        <View style={styles.localRow}>
          <View style={styles.localFieldHalf}>
            <AppInput
              label="CEP"
              value={local.zipCode}
              onChangeText={(text) =>
                handleCepChange(text, handleApplyAddress, (t) =>
                  onChangeField('zipCode', t)
                )
              }
              mask="cep"
              placeholder="00000-000"
              keyboardType="numeric"
              returnKeyType="search"
              onSubmitEditing={handleManualSearch}
              rightAccessory={
                isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <TouchableOpacity
                    onPress={handleManualSearch}
                    accessibilityRole="button"
                    accessibilityLabel="Buscar CEP"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="search-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )
              }
              error={error ?? undefined}
              helper={isLoading ? 'Buscando endereço...' : undefined}
              accessibilityLabel="CEP"
            />
          </View>
          <View style={styles.localFieldHalf}>
            <AppInput
              label="Número"
              value={local.number}
              onChangeText={(text) => onChangeField('number', text)}
              placeholder="Ex.: 123"
              accessibilityLabel="Número"
            />
          </View>
        </View>

        <AppInput
          label="Rua / Logradouro"
          value={local.street}
          onChangeText={(text) => onChangeField('street', text)}
          placeholder="Ex.: Rua das Flores"
          accessibilityLabel="Rua"
        />

        <AppInput
          label="Complemento"
          value={local.complement}
          onChangeText={(text) => onChangeField('complement', text)}
          placeholder="Ex.: Apto 42, bloco B (opcional)"
          accessibilityLabel="Complemento"
        />

        <AppInput
          label="Bairro"
          value={local.neighborhood}
          onChangeText={(text) => onChangeField('neighborhood', text)}
          placeholder="Ex.: Centro"
          accessibilityLabel="Bairro"
        />

        <View style={styles.localRow}>
          <View style={styles.localFieldHalf}>
            <AppInput
              label="Cidade"
              value={local.city}
              onChangeText={(text) => onChangeField('city', text)}
              placeholder="Ex.: São Paulo"
              accessibilityLabel="Cidade"
            />
          </View>
          <View style={styles.localFieldHalf}>
            <AppInput
              label="Estado"
              value={local.state}
              onChangeText={(text) => onChangeField('state', text)}
              placeholder="UF"
              maxLength={2}
              autoCapitalize="characters"
              accessibilityLabel="Estado"
            />
          </View>
        </View>

        <AppInput
          label="Ponto de Referência"
          value={local.reference}
          onChangeText={(text) => onChangeField('reference', text)}
          placeholder="Ex.: Próximo ao mercado central (opcional)"
          accessibilityLabel="Referência"
        />
      </AppCard>
    </View>
  );
}

export default LocalStep;
