/**
 * SmartGesso Mobile — Etapa 4: Local / Endereço da Obra do wizard de orçamento.
 *
 * Integra busca automática de CEP com preenchimento instantâneo de dados.
 */
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AppInput } from '../../../ui/AppInput';
import { useCepLookup } from '../../../../hooks/useCepLookup';
import { colors } from '../../../../theme';
import { styles } from '../wizard/styles';
import type { QuoteLocalDraft } from '../wizard/types';

export interface LocalStepProps {
  local: QuoteLocalDraft;
  onChangeField: (field: keyof QuoteLocalDraft, value: string) => void;
  onBulkChange?: (fields: Partial<QuoteLocalDraft>) => void;
}

export function LocalStep({ local, onChangeField, onBulkChange }: LocalStepProps) {
  const { isLoading, error, handleCepChange } = useCepLookup();

  const handleApplyAddress = (address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  }) => {
    if (onBulkChange) {
      onBulkChange({
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        ...(address.complement && !local.complement ? { complement: address.complement } : {}),
      });
    } else {
      onChangeField('street', address.street);
      onChangeField('neighborhood', address.neighborhood);
      onChangeField('city', address.city);
      onChangeField('state', address.state);
      if (address.complement && !local.complement) {
        onChangeField('complement', address.complement);
      }
    }
  };

  return (
    <View>
      <Text style={styles.sectionLabel}>Onde o serviço será realizado?</Text>

      <View style={styles.localRow}>
        <View style={styles.localFieldHalf}>
          <AppInput
            label="CEP"
            value={local.zipCode}
            onChangeText={(text) =>
              handleCepChange(text, handleApplyAddress, (t) => onChangeField('zipCode', t))
            }
            mask="cep"
            placeholder="00000-000"
            rightAccessory={
              isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null
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
        label="Rua"
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
        label="Referência"
        value={local.reference}
        onChangeText={(text) => onChangeField('reference', text)}
        placeholder="Ex.: Próximo ao mercado central (opcional)"
        accessibilityLabel="Referência"
      />
    </View>
  );
}

export default LocalStep;
