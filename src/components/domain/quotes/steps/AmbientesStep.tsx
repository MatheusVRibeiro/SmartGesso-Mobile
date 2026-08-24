/**
 * SmartGesso Mobile — Etapa 3: Ambientes e medições do wizard de orçamento.
 *
 * Extraído de app/(app)/orcamentos/novo.tsx (ETAPA 4).
 * O estado (draft) permanece no screen; este componente é apresentacional.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../ui/AppCard';
import { AppInput } from '../../../ui/AppInput';
import { EmptyState } from '../../../ui/EmptyState';
import { colors, sizes, spacing } from '../../../../theme';
import { styles } from '../wizard/styles';
import type {
  QuoteEnvironmentDraft,
  QuoteEnvironmentMeasurementDraft,
} from '../wizard/types';
import type { MeasurementApplicationType } from '../../../../types/measurement';
import { APPLICATION_TYPE_BADGE } from '../wizard/types';

export interface AmbientesStepProps {
  environments: QuoteEnvironmentDraft[];
  addEnvironment: () => void;
  updateEnvironment: (
    id: string,
    field: keyof QuoteEnvironmentDraft,
    value: string | MeasurementApplicationType,
  ) => void;
  removeEnvironment: (id: string) => void;
  updateMeasurement: (
    envId: string,
    field: keyof QuoteEnvironmentMeasurementDraft,
    value: string,
  ) => void;
}

export function AmbientesStep({
  environments,
  addEnvironment,
  updateEnvironment,
  removeEnvironment,
  updateMeasurement,
}: AmbientesStepProps) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Ambientes e medições</Text>
      {environments.length === 0 ? (
        <EmptyState
          title="Nenhum ambiente adicionado"
          description="Adicione ambientes com as medições do local para calcular os materiais da composição."
          icon="home-outline"
        />
      ) : (
        <View>
          {environments.map((env) => (
            <AppCard
              key={env.id}
              shadow="light"
              style={styles.environmentCard}
            >
              <View style={styles.environmentHeader}>
                <View style={styles.environmentNameField}>
                  <AppInput
                    label="Nome do ambiente"
                    required
                    value={env.name}
                    onChangeText={(text) =>
                      updateEnvironment(env.id, 'name', text)
                    }
                    placeholder="Ex.: Sala de estar"
                    accessibilityLabel={`Nome do ambiente ${env.order + 1}`}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ambiente ${env.name}`}
                  onPress={() => removeEnvironment(env.id)}
                  hitSlop={8}
                  style={styles.removeEnvironmentButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={sizes.icon.sm}
                    color={colors.error}
                  />
                </Pressable>
              </View>

              <Text style={styles.environmentSectionLabel}>
                Tipo de aplicação
              </Text>
              <View style={styles.applicationTypeRow}>
                {(
                  [
                    'DRYWALL',
                    'FORRO',
                    'PAREDE',
                    'SANCA',
                    'REBAIXAMENTO',
                    'OUTRO',
                  ] as const
                ).map((type) => {
                  const selected = env.applicationType === type;
                  const badge = APPLICATION_TYPE_BADGE[type];
                  return (
                    <Pressable
                      key={type}
                      accessibilityRole="button"
                      accessibilityLabel={`Tipo de aplicação ${badge.label}`}
                      accessibilityState={{ selected }}
                      onPress={() =>
                        updateEnvironment(env.id, 'applicationType', type)
                      }
                      style={[
                        styles.applicationTypeChip,
                        selected && styles.applicationTypeChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.applicationTypeChipText,
                          selected &&
                            styles.applicationTypeChipTextSelected,
                        ]}
                      >
                        {badge.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.environmentSectionLabel}>
                Medidas (em metros)
              </Text>
              <View style={styles.environmentMeasurementRow}>
                <View style={styles.environmentMeasurementField}>
                  <AppInput
                    label="Comprimento"
                    value={env.measurement.length}
                    onChangeText={(text) =>
                      updateMeasurement(env.id, 'length', text)
                    }
                    placeholder="0"
                    keyboardType="decimal-pad"
                    accessibilityLabel={`Comprimento do ambiente ${env.name}`}
                  />
                </View>
                <View style={styles.environmentMeasurementField}>
                  <AppInput
                    label="Largura"
                    value={env.measurement.width}
                    onChangeText={(text) =>
                      updateMeasurement(env.id, 'width', text)
                    }
                    placeholder="0"
                    keyboardType="decimal-pad"
                    accessibilityLabel={`Largura do ambiente ${env.name}`}
                  />
                </View>
              </View>
              <View style={styles.environmentMeasurementRow}>
                <View style={styles.environmentMeasurementField}>
                  <AppInput
                    label="Altura"
                    value={env.measurement.height}
                    onChangeText={(text) =>
                      updateMeasurement(env.id, 'height', text)
                    }
                    placeholder="0"
                    keyboardType="decimal-pad"
                    accessibilityLabel={`Altura do ambiente ${env.name}`}
                  />
                </View>
                <View style={styles.environmentMeasurementField}>
                  <AppInput
                    label="Área (m²)"
                    value={env.measurement.area}
                    onChangeText={(text) =>
                      updateMeasurement(env.id, 'area', text)
                    }
                    placeholder="0"
                    keyboardType="decimal-pad"
                    accessibilityLabel={`Área do ambiente ${env.name}`}
                    helper={
                      env.measurement.length && env.measurement.width
                        ? 'Auto-calculada'
                        : undefined
                    }
                  />
                </View>
              </View>
              <View style={styles.environmentMeasurementRow}>
                <View style={styles.environmentMeasurementField}>
                  <AppInput
                    label="Perímetro (m)"
                    value={env.measurement.perimeter}
                    onChangeText={(text) =>
                      updateMeasurement(env.id, 'perimeter', text)
                    }
                    placeholder="0"
                    keyboardType="decimal-pad"
                    accessibilityLabel={`Perímetro do ambiente ${env.name}`}
                  />
                </View>
                <View style={styles.environmentMeasurementField}>
                  <AppInput
                    label="Observações"
                    value={env.measurement.observations}
                    onChangeText={(text) =>
                      updateMeasurement(env.id, 'observations', text)
                    }
                    placeholder="Opcional"
                    accessibilityLabel={`Observações do ambiente ${env.name}`}
                  />
                </View>
              </View>
            </AppCard>
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar ambiente"
        onPress={addEnvironment}
        style={({ pressed }) => [
          styles.addItemButton,
          pressed && styles.addItemButtonPressed,
        ]}
      >
        <Ionicons
          name="add"
          size={sizes.icon.md}
          color={colors.primary}
          accessibilityElementsHidden
        />
        <Text style={styles.addItemText}>Adicionar ambiente</Text>
      </Pressable>
    </View>
  );
}

export default AmbientesStep;
