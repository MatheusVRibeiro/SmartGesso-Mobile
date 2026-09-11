import { useAppTheme } from '../../../../theme/ThemeProvider';
/**
 * SmartGesso Mobile — Etapa 4: Serviço/Materiais do wizard de orçamento.
 *
 * Extraído de app/(app)/orcamentos/novo.tsx (ETAPA 4).
 * O estado (draft) permanece no screen; este componente é apresentacional.
 */
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../ui/AppButton';
import { AppCard } from '../../../ui/AppCard';
import { AppInput } from '../../../ui/AppInput';
import { EmptyState } from '../../../ui/EmptyState';
import { ErrorState } from '../../../ui/ErrorState';
import { LoadingState } from '../../../ui/LoadingState';
import { StatusBadge } from '../../../ui/StatusBadge';
import { colors, sizes } from '../../../../theme';
import { createWizardStyles } from '../wizard/styles';
import {
  environmentHasMeasurements,
  parseNumber,
  type MaterialDraft,
  type MaterialsCalcState,
  type QuoteEnvironmentDraft,
  type ServiceDraft,
  type ServiceErrors,
} from '../wizard/types';
import type { CalculateMaterialsResponse } from '../../../../types/composition';
import { formatCurrency, formatNumber } from '../../../../utils/format';
import { PermissionGate } from '../../PermissionGate';
import { COST_VIEW_ROLES } from '../../../../types/permissions';

export interface ItensStepProps {
  environments: QuoteEnvironmentDraft[];
  materials: MaterialDraft[];
  materialsCalc: MaterialsCalcState | null;
  materialsCalcPending: boolean;
  materialsCalcError: string | null;
  serviceErrors: ServiceErrors;
  services: ServiceDraft[];
  updateMaterialQuantity: (key: string, quantity: string) => void;
  handleRecalculate: () => void;
  addService: () => void;
  updateService: (
    id: string,
    field: 'name' | 'unitPrice',
    value: string,
  ) => void;
  removeService: (id: string) => void;
}

export function ItensStep({
  environments,
  materials,
  materialsCalc,
  materialsCalcPending,
  materialsCalcError,
  serviceErrors,
  services,
  updateMaterialQuantity,
  handleRecalculate,
  addService,
  updateService,
  removeService,
}: ItensStepProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  const result: CalculateMaterialsResponse | null =
    materialsCalc?.result ?? null;

  return (
    <View>
      <Text style={styles.sectionLabel}>Materiais</Text>
      {environments.filter(environmentHasMeasurements).length === 0 ? (
        <EmptyState
          title="Nenhum ambiente com medições"
          description="Adicione ambientes com medições na Etapa 3 para calcular os materiais da composição."
          icon="cube-outline"
        />
      ) : materialsCalcPending ? (
        <LoadingState text="Calculando materiais..." />
      ) : materialsCalcError ? (
        <ErrorState
          message={materialsCalcError}
          onRetry={handleRecalculate}
        />
      ) : !result ? (
        <LoadingState text="Preparando materiais..." />
      ) : (
        <View>
          <AppCard shadow="light" style={styles.compositionCard}>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionCode}>
                {result.composition.code}
              </Text>
              <StatusBadge
                status="active"
                label={`v${result.composition.version}`}
                size="sm"
              />
            </View>
            <Text style={styles.compositionName} numberOfLines={2}>
              {result.composition.name}
            </Text>
          </AppCard>

          <Text style={styles.sectionLabel}>Materiais calculados</Text>
          {materials.length === 0 ? (
            <EmptyState
              title="Nenhum material calculado"
              description="A composição não retornou materiais para os ambientes selecionados."
              icon="cube-outline"
            />
          ) : (
            materials.map((material) => (
              <AppCard
                key={material.key}
                shadow="light"
                style={styles.materialCard}
              >
                <View style={styles.materialRow}>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialName} numberOfLines={2}>
                      {material.name}
                    </Text>
                    <Text style={styles.materialMeta} numberOfLines={1}>
                      {material.unitPrice != null
                        ? `${formatCurrency(material.unitPrice)}/${material.unit}`
                        : 'Preço não cadastrado'}
                    </Text>
                  </View>
                  <View style={styles.materialQtyField}>
                    <AppInput
                      label="Qtd"
                      value={material.quantity}
                      onChangeText={(text) =>
                        updateMaterialQuantity(material.key, text)
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      accessibilityLabel={`Quantidade de ${material.name}`}
                      style={styles.materialQtyInput}
                    />
                  </View>
                </View>
                <View style={styles.itemSubtotalRow}>
                  <Text style={styles.itemSubtotalLabel}>
                    Total ({material.unit})
                  </Text>
                  <Text style={styles.itemSubtotalValue}>
                    {formatCurrency(
                      parseNumber(material.quantity) *
                        (material.unitPrice ?? 0),
                    )}
                  </Text>
                </View>
              </AppCard>
            ))
          )}

          <AppCard shadow="light" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Área total</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(result.totalArea)} m²
              </Text>
            </View>
            <PermissionGate allow={COST_VIEW_ROLES}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Custo estimado</Text>
                <Text style={styles.summaryCost}>
                  {formatCurrency(result.estimatedCost)}
                </Text>
              </View>
            </PermissionGate>
          </AppCard>

          <AppButton
            title="Calcular novamente"
            variant="outline"
            size="lg"
            loading={materialsCalcPending}
            onPress={handleRecalculate}
            accessibilityLabel="Calcular novamente"
            style={styles.recalculateButton}
          />
        </View>
      )}

      <Text style={styles.sectionLabel}>Serviços</Text>
      {services.length === 0 ? (
        <EmptyState
          title="Nenhum serviço adicionado"
          description="Adicione os serviços que serão executados (ex.: instalação de forro de drywall)."
          icon="construct-outline"
        />
      ) : (
        services.map((service) => {
          const errors = serviceErrors[service.id] ?? {};
          return (
            <AppCard
              key={service.id}
              shadow="light"
              style={styles.serviceCard}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemLabel}>Serviço</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover serviço"
                  onPress={() => removeService(service.id)}
                  hitSlop={8}
                  style={styles.removeItemButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={sizes.icon.sm}
                    color={colors.error}
                  />
                </Pressable>
              </View>
              <AppInput
                label="Descrição"
                required
                value={service.name}
                onChangeText={(text) =>
                  updateService(service.id, 'name', text)
                }
                placeholder="Ex.: Instalação de forro de drywall"
                error={errors.name}
                accessibilityLabel="Descrição do serviço"
              />
              <AppInput
                label="Valor (R$)"
                required
                value={service.unitPrice}
                onChangeText={(text) =>
                  updateService(service.id, 'unitPrice', text)
                }
                mask="currency"
                placeholder="0,00"
                error={errors.unitPrice}
                accessibilityLabel="Valor do serviço"
              />
            </AppCard>
          );
        })
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar serviço"
        onPress={addService}
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
        <Text style={styles.addItemText}>Adicionar serviço</Text>
      </Pressable>
    </View>
  );
}

export default ItensStep;
