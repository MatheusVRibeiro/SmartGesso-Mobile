import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../ui/AppCard';
import { radius, sizes, spacing, typography } from '../../../../theme';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { createWizardStyles } from '../wizard/styles';
import type { Client } from '../../../../types/client';

export interface ClienteStepProps {
  clientId: string;
  selectedClient: Client | undefined;
  onOpenClientModal: () => void;
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClienteStep({
  clientId,
  selectedClient,
  onOpenClientModal,
}: ClienteStepProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);

  const isPJ = selectedClient?.type === 'JURIDICA';
  const hasAddress = Boolean(
    selectedClient &&
      (selectedClient.postalCode ||
        selectedClient.street ||
        selectedClient.city)
  );

  const addressSummary = useMemo(() => {
    if (!selectedClient) return null;
    const parts = [
      selectedClient.street
        ? `${selectedClient.street}${selectedClient.number ? `, ${selectedClient.number}` : ''}`
        : null,
      selectedClient.city
        ? `${selectedClient.city}${selectedClient.state ? ` - ${selectedClient.state}` : ''}`
        : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }, [selectedClient]);

  return (
    <View>
      <Text style={styles.sectionLabel}>Cliente do Orçamento</Text>

      <AppCard shadow="none" radius={radius.xl} style={styles.clientCard}>
        {selectedClient ? (
          <View style={{ gap: spacing.xs }}>
            <View style={styles.clientSelectedHeader}>
              {/* Avatar com Iniciais */}
              <View
                style={[
                  styles.clientAvatar,
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
                    styles.clientAvatarText,
                    {
                      color: isPJ
                        ? isDark
                          ? '#C084FC'
                          : '#9333EA'
                        : isDark
                          ? '#8B93E6'
                          : colors.primary,
                    },
                  ]}
                >
                  {getInitials(selectedClient.name)}
                </Text>
              </View>

              {/* Informações do Cliente */}
              <View style={styles.clientInfoCol}>
                <View style={styles.clientNameRow}>
                  <Text style={styles.clientName} numberOfLines={1}>
                    {selectedClient.name}
                  </Text>
                  <View
                    style={[
                      styles.clientBadgePill,
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
                        styles.clientBadgePillText,
                        {
                          color: isPJ
                            ? isDark
                              ? '#C084FC'
                              : '#9333EA'
                            : isDark
                              ? '#8B93E6'
                              : colors.primary,
                        },
                      ]}
                    >
                      {isPJ ? 'PJ' : 'PF'}
                    </Text>
                  </View>
                </View>

                {/* Metadados: Documento / Contato */}
                <View style={styles.clientMetaRow}>
                  {selectedClient.document ? (
                    <View style={styles.clientMetaItem}>
                      <Ionicons name="card-outline" size={12} color={colors.textLight} />
                      <Text style={styles.clientMetaText}>
                        {selectedClient.document}
                      </Text>
                    </View>
                  ) : null}

                  {selectedClient.whatsapp || selectedClient.phone ? (
                    <View style={styles.clientMetaItem}>
                      <Ionicons
                        name={selectedClient.whatsapp ? 'logo-whatsapp' : 'call-outline'}
                        size={12}
                        color={selectedClient.whatsapp ? '#25D366' : colors.textLight}
                      />
                      <Text style={styles.clientMetaText}>
                        {selectedClient.whatsapp || selectedClient.phone}
                      </Text>
                    </View>
                  ) : null}
                </View>
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

            {/* Aviso de Endereço Importado */}
            {hasAddress ? (
              <View style={styles.clientAddressBadge}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={isDark ? '#4ADE80' : '#059669'}
                />
                <Text style={styles.clientAddressBadgeText} numberOfLines={1}>
                  {addressSummary
                    ? `Endereço cadastrado: ${addressSummary} (pré-preenchido para a obra)`
                    : 'Endereço pré-preenchido com base no cadastro do cliente'}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Pressable
            onPress={onOpenClientModal}
            accessibilityRole="button"
            accessibilityLabel="Selecionar cliente"
            style={styles.clientCardContent}
          >
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
              <Text style={[styles.clientName, styles.selectorPlaceholder]}>
                Selecione um cliente
              </Text>
            </View>
            <View style={styles.clientChangeButton}>
              <Text style={styles.clientChangeText}>Selecionar</Text>
            </View>
          </Pressable>
        )}
      </AppCard>
    </View>
  );
}

export default ClienteStep;
