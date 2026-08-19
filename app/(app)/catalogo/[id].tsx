import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  AppCard,
  ErrorState,
  LoadingState,
  ScreenContainer,
  StatusBadge,
} from '../../../src/components/ui';
import { catalogService } from '../../../src/services/api/catalog';
import { toApiError } from '../../../src/services/api/client';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import type { MaterialItem } from '../../../src/types/catalog';
import { formatCurrency, formatNumber } from '../../../src/utils/format';

// ─── Histórico local (mock) ──────────────────────────────────────────────
// Integração com a API de movimentações de estoque chega na próxima versão.

type MovementType = 'ENTRADA' | 'SAIDA';

interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  date: string;
  description: string;
}

const MOVEMENT_LABELS: Record<MovementType, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Gera movimentos locais coerentes com o saldo atual (entradas − saídas = estoque). */
function buildMockMovements(material: MaterialItem): StockMovement[] {
  const stock = material.stockQty ?? 0;
  const base = new Date(material.createdAt).getTime();
  return [
    {
      id: 'mock-entrada-inicial',
      type: 'ENTRADA',
      quantity: stock + 12,
      date: new Date(base).toISOString(),
      description: 'Entrada inicial de estoque',
    },
    {
      id: 'mock-saida-obra',
      type: 'SAIDA',
      quantity: 7,
      date: new Date(base + 3 * DAY_MS).toISOString(),
      description: 'Consumo em obra',
    },
    {
      id: 'mock-saida-perda',
      type: 'SAIDA',
      quantity: 5,
      date: new Date(base + 6 * DAY_MS).toISOString(),
      description: 'Perda no transporte',
    },
  ];
}

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
  const movements = buildMockMovements(material);

  return (
    <ScreenContainer scroll keyboard={false}>
      <Stack.Screen options={{ title: material.name }} />

      {/* ── Cabeçalho ── */}
      <View style={styles.header}>
        <Text style={styles.title}>{material.name}</Text>
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

      {/* ── Histórico de movimentações ── */}
      <Text style={styles.sectionTitle}>Histórico de movimentações</Text>

      <View style={styles.noticeBanner}>
        <Ionicons
          name="information-circle"
          size={sizes.icon.md}
          color={colors.info}
          accessibilityElementsHidden
        />
        <Text style={styles.noticeText}>
          Histórico local de demonstração — integração com a API de estoque na próxima
          versão.
        </Text>
      </View>

      <View style={styles.movementsList}>
        {movements.map((movement) => {
          const isEntrada = movement.type === 'ENTRADA';
          const tone = isEntrada ? colors.success : colors.danger;
          return (
            <AppCard key={movement.id} radius={radius.lg} style={styles.card}>
              <View style={styles.movementRow}>
                <View style={styles.movementIcon}>
                  <Ionicons
                    name={isEntrada ? 'arrow-down-circle' : 'arrow-up-circle'}
                    size={sizes.icon.md}
                    color={tone}
                    accessibilityElementsHidden
                  />
                </View>

                <View style={styles.movementInfo}>
                  <View style={styles.movementHeader}>
                    <Text style={styles.movementType}>
                      {MOVEMENT_LABELS[movement.type]}
                    </Text>
                    <Text style={styles.movementDate}>
                      {formatDate(movement.date)}
                    </Text>
                  </View>
                  <Text style={styles.movementDescription}>
                    {movement.description}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.movementQuantity,
                    { color: tone },
                  ]}
                >
                  {isEntrada ? '+' : '−'}
                  {formatNumber(movement.quantity)}
                </Text>
              </View>
            </AppCard>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
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
  movementQuantity: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
