import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import {
  createCatalogItemSchema,
  createMaterialSchema,
} from '../../validation/schemas';
import type { CreateCatalogItemFormData } from '../../validation/schemas';
import { AppButton, AppInput } from '../ui';
import { colors, radius, shadows, sizes, spacing, typography } from '../../theme';

/**
 * Valores do formulário de item de catálogo.
 * Para materiais, inclui os campos de estoque (schema estendido).
 */
export type CatalogItemFormValues = CreateCatalogItemFormData & {
  stockQty?: number;
  minStockQty?: number;
};

export interface CatalogItemFormModalProps {
  visible: boolean;
  title: string;
  submitLabel?: string;
  /** Quando true, exibe os campos de estoque (schema de material). */
  includeStockFields?: boolean;
  submitting?: boolean;
  onSubmit: (values: CatalogItemFormValues) => void;
  onClose: () => void;
  testID?: string;
}

const DEFAULT_VALUES: CatalogItemFormValues = {
  name: '',
  description: '',
  unit: 'un',
  price: undefined,
  cost: undefined,
  status: 'ACTIVE',
  stockQty: undefined,
  minStockQty: undefined,
};

function CatalogItemFormModal({
  visible,
  title,
  submitLabel = 'Salvar',
  includeStockFields = false,
  submitting = false,
  onSubmit,
  onClose,
  testID,
}: CatalogItemFormModalProps) {
  // Os schemas usam `.default()`/`z.coerce()`, então o tipo de INPUT do Zod
  // difere do OUTPUT (ex.: status/unit opcionais no input). O resolver entrega
  // os valores já parseados (output) ao handleSubmit — o cast alinha os tipos
  // sem mudar o comportamento em runtime.
  const resolver = (
    includeStockFields
      ? zodResolver(createMaterialSchema)
      : zodResolver(createCatalogItemSchema)
  ) as unknown as Resolver<CatalogItemFormValues>;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CatalogItemFormValues>({
    resolver,
    defaultValues: DEFAULT_VALUES,
  });

  // Reinicia o formulário sempre que o modal é aberto.
  useEffect(() => {
    if (visible) {
      reset(DEFAULT_VALUES);
    }
  }, [visible, reset]);

  function handleBackdropPress() {
    if (!submitting) {
      onClose();
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          accessibilityLabel="Fechar formulário"
          accessibilityRole="button"
        />
        <View style={styles.card} testID={testID} accessibilityViewIsModal>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Pressable
              onPress={handleBackdropPress}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={8}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Nome"
                  required
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ex.: Placa de gesso 60x60"
                  error={errors.name?.message}
                  accessibilityLabel="Nome do item"
                  autoCapitalize="sentences"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Descrição"
                  value={value ?? ''}
                  onChangeText={onChange}
                  placeholder="Descrição opcional"
                  error={errors.description?.message}
                  accessibilityLabel="Descrição do item"
                  maxLength={200}
                />
              )}
            />

            <Controller
              control={control}
              name="unit"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Unidade"
                  required
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ex.: un, m², kg"
                  error={errors.unit?.message}
                  accessibilityLabel="Unidade de medida"
                  autoCapitalize="none"
                />
              )}
            />

            <View style={styles.row}>
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Preço (R$)"
                    value={value == null ? '' : String(value)}
                    onChangeText={onChange}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    error={errors.price?.message}
                    accessibilityLabel="Preço em reais"
                    style={styles.rowField}
                  />
                )}
              />
              <Controller
                control={control}
                name="cost"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Custo (R$)"
                    value={value == null ? '' : String(value)}
                    onChangeText={onChange}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    error={errors.cost?.message}
                    accessibilityLabel="Custo em reais"
                    style={styles.rowField}
                  />
                )}
              />
            </View>

            {includeStockFields ? (
              <View style={styles.row}>
                <Controller
                  control={control}
                  name="stockQty"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Estoque"
                      value={value == null ? '' : String(value)}
                      onChangeText={onChange}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      error={errors.stockQty?.message}
                      accessibilityLabel="Quantidade em estoque"
                      style={styles.rowField}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="minStockQty"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Estoque mínimo"
                      value={value == null ? '' : String(value)}
                      onChangeText={onChange}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      error={errors.minStockQty?.message}
                      accessibilityLabel="Quantidade mínima em estoque"
                      style={styles.rowField}
                    />
                  )}
                />
              </View>
            ) : null}

            <View style={styles.actions}>
              <AppButton
                title="Cancelar"
                variant="ghost"
                size="md"
                onPress={handleBackdropPress}
                disabled={submitting}
                style={styles.actionButton}
              />
              <AppButton
                title={submitLabel}
                variant="primary"
                size="md"
                loading={submitting}
                onPress={handleSubmit(onSubmit)}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default CatalogItemFormModal;
export { CatalogItemFormModal };

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    ...shadows.strong,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});