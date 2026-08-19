import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import {
  AppCard,
  ErrorState,
  LoadingState,
  ScreenContainer,
  StatusBadge,
} from '../../../src/components/ui';
import { catalogService } from '../../../src/services/api/catalog';
import { toApiError } from '../../../src/services/api/client';
import { inventoryService } from '../../../src/services/api/inventory';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { MaterialItem } from '../../../src/types/catalog';
import type { InventoryMovementType } from '../../../src/types/inventory';
import { formatCurrency, formatNumber } from '../../../src/utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Metadados visuais por tipo de movimento ────────────────────────────────
// ENTRADA/RETORNO incrementam saldo · SAIDA/CONSUMO/PERDA decrementam ·
// RESERVA não altera · AJUSTE define o saldo (quantity = valor final).

interface MovementMeta {
  label: string;
  icon: IconName;
  tone: string;
  sign: string;
  defaultDescription: string;
}

const MOVEMENT_META: Record<InventoryMovementType, MovementMeta> = {
  ENTRADA: {
    label: 'Entrada',
    icon: 'arrow-down-circle',
    tone: colors.success,
    sign: '+',
    defaultDescription: 'Entrada de estoque',
  },
  RETORNO: {
    label: 'Retorno',
    icon: 'arrow-down-circle',
    tone: colors.success,
    sign: '+',
    defaultDescription: 'Retorno de material',
  },
  SAIDA: {
    label: 'Saída',
    icon: 'arrow-up-circle',
    tone: colors.danger,
    sign: '−',
    defaultDescription: 'Saída de estoque',
  },
  CONSUMO: {
    label: 'Consumo',
    icon: 'arrow-up-circle',
    tone: colors.danger,
    sign: '−',
    defaultDescription: 'Consumo em serviço',
  },
  PERDA: {
    label: 'Perda',
    icon: 'arrow-up-circle',
    tone: colors.danger,
    sign: '−',
    defaultDescription: 'Perda de material',
  },
  RESERVA: {
    label: 'Reserva',
    icon: 'bookmark-outline',
    tone: colors.warning,
    sign: '',
    defaultDescription: 'Reserva de material',
  },
  AJUSTE: {
    label: 'Ajuste',
    icon: 'swap-horizontal',
    tone: colors.primary,
    sign: '=',
    defaultDescription: 'Ajuste manual de estoque',
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function MaterialDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const materialId = params.id ?? '';
  const companyId = useSessionStore((s) => s.activeCompany?.company.id);

  const {
    data: material,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['company', companyId, 'catalog', 'materials', materialId],
    queryFn: () => catalogService.getMaterial(materialId),
    enabled: Boolean(companyId && materialId),
  });

  // Histórico real de movimentações (V3 — API /inventory/materials/:id/movements).
  const movementsQuery = useQuery({
    queryKey: ['company', companyId, 'inventory', 'movements', materialId],
    queryFn: () => inventoryService.getMaterialMovements(materialId),
    enabled: Boolean(companyId && materialId),
  });

  if (isLoading || !materialId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Material' }} />
        <LoadingState text="Carregando material..." />
      </ScreenContainer>
    );
  }

  if (isError || !material) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Material' }} />
        <ErrorState
          message={
            error ? toApiError(error).message : 'Não foi possível carregar o material.'
          }
          onRetry={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  const isActive = material.status === 'ACTIVE';
  const stockQty = material.stockQty ?? 0;
  const minStockQty = material.minStockQty ?? 0;
  const lowStock = stockQty <= minStockQty;
  const movements = movementsQuery.data ?? [];

  return (
    <ScreenContainer scroll keyboard={false}>
      <Stack.Screen options={{ title: material.name }} />

      {/* ── Cabeçalho ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {material.name}
          </Text>
          <Pressable
            onPress={() => router.push(`/catalogo/movimento?materialId=${materialId}`)}
            accessibilityRole="button"
            accessibilityLabel="Registrar movimento"
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Ionicons
              name="add"
              size={sizes.icon.xl}
              color={colors.textOnPrimary}
              accessibilityElementsHidden
            />
          </Pressable>
        </View>
        {material.description ? (
          <Text style={styles.description}>{material.description}</Text>
        ) : null}

        <View style={styles.badgesRow}>
          <StatusBadge
            status={isActive ? 'active' : 'cancelled'}
            label={isActive ? 'Ativo' : 'Inativo'}
            size="sm"
          />
          {lowStock ? (
            <StatusBadge status="warning" label="Estoque baixo" size="sm" />
          ) : null}
        </View>
      </View>

      {/* ── Alerta de estoque baixo ── */}
      {lowStock ? (
        <View style={styles.alertBanner}>
          <Ionicons
            name="alert-circle"
            size={sizes.icon.md}
            color={colors.warning}
            accessibilityElementsHidden
          />
          <Text style={styles.alertText}>
            Estoque no mínimo ou abaixo dele. Reponha para evitar falta de material.
          </Text>
        </View>
      ) : null}

      {/* ── Informações ── */}
      <Text style={styles.sectionTitle}>Informações</Text>
      <AppCard radius={radius.lg} style={styles.card}>
        <InfoRow label="Unidade" value={material.unit || '—'} />
        <View style={styles.divider} />
        <InfoRow label="Quantidade em estoque" value={formatNumber(stockQty)} />
        <View style={styles.divider} />
        <InfoRow label="Custo médio" value={formatCurrency(material.cost)} />
        <View style={styles.divider} />
        <InfoRow label="Estoque mínimo" value={formatNumber(minStockQty)} />
      </AppCard>

      {/* ── Histórico de movimentações (API real) ── */}
      <Text style={styles.sectionTitle}>Histórico de movimentações</Text>

      {movementsQuery.isLoading ? (
        <LoadingState text="Carregando movimentos..." />
      ) : movementsQuery.isError ? (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle"
            size={sizes.icon.md}
            color={colors.danger}
            accessibilityElementsHidden
          />
          <Text style={styles.errorBannerText}>
            Não foi possível carregar o histórico de movimentações.
          </Text>
          <Pressable
            onPress={() => movementsQuery.refetch()}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
            hitSlop={8}
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : movements.length === 0 ? (
        <View style={styles.noticeBanner}>
          <Ionicons
            name="information-circle"
            size={sizes.icon.md}
            color={colors.info}
            accessibilityElementsHidden
          />
          <Text style={styles.noticeText}>
            Nenhum movimento registrado para este material ainda. Toque em + para
            registrar uma entrada ou saída.
          </Text>
        </View>
      ) : (
        <View style={styles.movementsList}>
          {movements.map((movement) => {
            const meta = MOVEMENT_META[movement.type];
            const description =
              movement.notes?.trim() || meta.defaultDescription;
            return (
              <AppCard key={movement.id} radius={radius.lg} style={styles.card}>
                <View style={styles.movementRow}>
                  <View style={styles.movementIcon}>
                    <Ionicons
                      name={meta.icon}
                      size={sizes.icon.md}
                      color={meta.tone}
                      accessibilityElementsHidden
                    />
                  </View>

                  <View style={styles.movementInfo}>
                    <View style={styles.movementHeader}>
                      <Text style={styles.movementType}>{meta.label}</Text>
                      <Text style={styles.movementDate}>
                        {formatDate(movement.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.movementDescription}>{description}</Text>
                    {movement.serviceOrder ? (
                      <Text style={styles.movementOs}>
                        OS #{movement.serviceOrder.code}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={[styles.movementQuantity, { color: meta.tone }]}>
                    {meta.sign}
                    {formatNumber(movement.quantity)}
                  </Text>
                </View>
              </AppCard>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  addButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  alertText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.warning,
    fontWeight: typography.weights.medium,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.info,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.danger,
  },
  retryText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.danger,
  },
  movementsList: {
    gap: spacing.md,
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movementInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  movementType: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  movementDate: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  movementDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  movementOs: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  movementQuantity: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});