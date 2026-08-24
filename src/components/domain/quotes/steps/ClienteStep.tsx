/**
 * SmartGesso Mobile — Etapa 1: Cliente do wizard de orçamento.
 *
 * Extraído de app/(app)/orcamentos/novo.tsx (ETAPA 4).
 * O estado (draft) permanece no screen; este componente é apresentacional.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../ui/AppCard';
import { colors, radius, sizes, spacing } from '../../../../theme';
import { styles } from '../wizard/styles';
import type { Client } from '../../../../types/client';

export interface ClienteStepProps {
  /** ID do cliente selecionado no draft. */
  clientId: string;
  /** Cliente resolvido a partir da lista (para exibir nome/documento). */
  selectedClient: Client | undefined;
  /** Abre o seletor de cliente. */
  onOpenClientModal: () => void;
}

export function ClienteStep({
  clientId,
  selectedClient,
  onOpenClientModal,
}: ClienteStepProps) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Cliente</Text>
      <AppCard shadow="light" radius={radius.lg} style={styles.clientCard}>
        <View style={styles.clientCardContent}>
          <View style={styles.clientIcon}>
            <Ionicons
              name="person-outline"
              size={sizes.icon.md}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>Cliente</Text>
            <Text
              style={[
                styles.clientName,
                clientId === '' && styles.selectorPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedClient?.name ?? 'Selecione um cliente'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Trocar cliente"
            onPress={onOpenClientModal}
            hitSlop={8}
            style={({ pressed }) => [
              styles.clientChangeButton,
              pressed && styles.clientChangeButtonPressed,
            ]}
          >
            <Text style={styles.clientChangeText}>Trocar</Text>
          </Pressable>
        </View>
      </AppCard>
    </View>
  );
}

export default ClienteStep;
