import React, { useMemo, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { productionOrdersService } from '@/src/services/api/productionOrders';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '@/src/theme';
import { formatNumber } from '@/src/utils/format';
import type {
  ProductionOrderItem,
  ProductionOrderStatus,
} from '@/src/types/serviceOrder';
import { createProducaoDetalheStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

// ─── Helpers ────────────────────────────────────────────────────────────────

const PRODUCTION_STATUS_BADGE: Record<
  ProductionOrderStatus,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_PRODUCAO: { variant: 'warning', label: 'Em produção' },
  CONCLUIDA: { variant: 'active', label: 'Concluída' },
  CANCELADA: { variant: 'cancelled', label: 'Cancelada' },
};

const ITEM_STATUS_BADGE: Record<
  string,
  { variant: StatusBadgeVariant; label: string }
> = {
  PENDENTE: { variant: 'expired', label: 'Pendente' },
  EM_PRODUCAO: { variant: 'warning', label: 'Em produção' },
  CONCLUIDO: { variant: 'active', label: 'Concluído' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

const orderIsOpen = (status?: ProductionOrderStatus) =>
  status === 'PENDENTE' || status === 'EM_PRODUCAO';

// ─── Modal de registro de produção ──────────────────────────────────────────

interface RegisterProductionModalProps {
  item: ProductionOrderItem | null;
  loading: boolean;
  onConfirm: (producedQty: number, wastedQty: number) => void;
  onClose: () => void;
}

function RegisterProductionModal({
  item,
  loading,
  onConfirm,
  onClose,
}: RegisterProductionModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createProducaoDetalheStyles(colors, isDark), [colors, isDark]);
  const [producedQty, setProducedQty] = useState('');
  const [wastedQty, setWastedQty] = useState('');

  // Pré-preenche com os valores atuais ao abrir
  useEffect(() => {
    if (item) {
      setProducedQty(item.producedQty ? String(item.producedQty) : '');
      setWastedQty(item.wastedQty ? String(item.wastedQty) : '');
    }
  }, [item]);

  const produced = parseFloat(producedQty.replace(',', '.')) || 0;
  const wasted = parseFloat(wastedQty.replace(',', '.')) || 0;
  const invalid = produced < 0 || wasted < 0;

  return (
    <Modal visible={item != null} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Registrar produção</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar registro de produção"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.modalBody}>
          <AppCard shadow="light" style={styles.modalItemCard}>
            <View style={styles.modalItemHeader}>
              <View style={styles.modalItemIcon}>
                <Ionicons
                  name="cube-outline"
                  size={sizes.icon.md}
                  color={colors.primary}
                  accessibilityElementsHidden
                />
              </View>
              <View style={styles.modalItemInfo}>
                <Text style={styles.modalItemName}>{item?.productName}</Text>
                <Text style={styles.modalItemMeta}>
                  Meta: {formatNumber(item?.quantity)} {item?.unit}
                </Text>
              </View>
            </View>
          </AppCard>

          <AppInput
            label="Quantidade produzida"
            required
            value={producedQty}
            onChangeText={setProducedQty}
            placeholder="0"
            keyboardType="decimal-pad"
            error={invalid ? 'Valores não podem ser negativos' : undefined}
            accessibilityLabel="Quantidade produzida"
          />

          <AppInput
            label="Quantidade desperdiçada"
            value={wastedQty}
            onChangeText={setWastedQty}
            placeholder="0"
            keyboardType="decimal-pad"
            helper="Opcional"
            accessibilityLabel="Quantidade desperdiçada"
          />

          <AppButton
            title="Registrar"
            size="lg"
            accessibilityLabel="Confirmar registro de produção"
            onPress={() => onConfirm(produced, wasted)}
            loading={loading}
            disabled={loading || invalid}
            style={styles.modalConfirmButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DetalheOrdemProducaoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createProducaoDetalheStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [registerItem, setRegisterItem] = useState<ProductionOrderItem | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const orderQuery = useQuery({
    queryKey: ['company', companyId, 'production-orders', orderId],
    queryFn: () => productionOrdersService.getById(orderId as string),
    enabled: Boolean(companyId && orderId),
  });

  const registerProductionMutation = useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: { producedQty: number; wastedQty?: number };
    }) => productionOrdersService.registerProduction(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'production-orders'],
      });
      setRegisterItem(null);
      setSnackbar({ type: 'success', message: 'Produção registrada com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      productionOrdersService.update(orderId as string, { status: 'CONCLUIDA' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'production-orders'],
      });
      setSnackbar({ type: 'success', message: 'Ordem concluída com sucesso' });
    },
    onError: (error: unknown) => {
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => productionOrdersService.remove(orderId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['company', companyId, 'production-orders'],
      });
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'success', message: 'Ordem excluída com sucesso' });
      setTimeout(() => router.back(), 600);
    },
    onError: (error: unknown) => {
      setConfirmDeleteVisible(false);
      setSnackbar({ type: 'error', message: toApiError(error).message });
    },
  });

  if (!orderId) {
    return (
      <ScreenContainer padding keyboard={false}>
        <Stack.Screen options={{ title: 'Ordem de produção', headerShown: true }} />
        <ErrorState message="Ordem de produção não encontrada" />
      </ScreenContainer>
    );
  }

  const order = orderQuery.data;
  const statusBadge = order ? PRODUCTION_STATUS_BADGE[order.status] : null;
  const isOpen = orderIsOpen(order?.status);

  return (
    <View style={styles.screen}>
      <ScreenContainer scroll padding keyboard={false}>
        <Stack.Screen options={{ title: 'Detalhe da ordem', headerShown: true }} />

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Detalhe da ordem</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir ordem de produção"
              onPress={() => setConfirmDeleteVisible(true)}
              hitSlop={8}
              style={styles.headerAction}
            >
              <Ionicons name="trash-outline" size={sizes.icon.lg} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        {orderQuery.isLoading ? (
          <LoadingState text="Carregando ordem de produção..." />
        ) : orderQuery.isError ? (
          <ErrorState
            message={toApiError(orderQuery.error).message}
            onRetry={orderQuery.refetch}
          />
        ) : order ? (
          <>
            <AppCard shadow="light" style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderCode}>PO #{order.code}</Text>
                {statusBadge && (
                  <StatusBadge
                    status={statusBadge.variant}
                    label={statusBadge.label}
                    size="sm"
                  />
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.orderRow}>
                <View style={styles.rowIcon}>
                  <Ionicons
                    name="person-outline"
                    size={sizes.icon.sm}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>Responsável</Text>
                  <Text style={styles.rowValue}>
                    {order.responsiblePerson?.trim() || 'Responsável não informado'}
                  </Text>
                </View>
              </View>

              <View style={styles.orderRow}>
                <View style={styles.rowIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={sizes.icon.sm}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>Data prevista</Text>
                  <Text style={styles.rowValue}>
                    {order.dueDate
                      ? formatDate(order.dueDate)
                      : 'Sem prazo definido'}
                  </Text>
                </View>
              </View>

              {order.client && (
                <View style={styles.orderRow}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name="business-outline"
                      size={sizes.icon.sm}
                      color={colors.primary}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>Cliente</Text>
                    <Text style={styles.rowValue}>{order.client.name}</Text>
                  </View>
                </View>
              )}

              {order.work && (
                <View style={styles.orderRow}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name="construct-outline"
                      size={sizes.icon.sm}
                      color={colors.primary}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>Obra</Text>
                    <Text style={styles.rowValue}>{order.work.name}</Text>
                  </View>
                </View>
              )}

              {order.completedDate && (
                <View style={styles.orderRow}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={sizes.icon.sm}
                      color={colors.success}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>Conclusão</Text>
                    <Text style={styles.rowValue}>
                      {formatDate(order.completedDate)}
                    </Text>
                  </View>
                </View>
              )}
            </AppCard>

            <Text style={styles.sectionLabel}>Itens</Text>
            {!order.items || order.items.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum item adicionado</Text>
            ) : (
              order.items.map((item: ProductionOrderItem) => {
                const itemBadge = ITEM_STATUS_BADGE[item.status] ?? {
                  variant: 'expired' as StatusBadgeVariant,
                  label: item.status,
                };
                return (
                  <AppCard key={item.id} shadow="light" style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemIcon}>
                        <Ionicons
                          name="cube-outline"
                          size={sizes.icon.md}
                          color={colors.primary}
                          accessibilityElementsHidden
                        />
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.productName}
                        </Text>
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemQuantity}>
                            Meta: {formatNumber(item.quantity)} {item.unit}
                          </Text>
                          <Text style={styles.itemProgress}>
                            Produzido: {formatNumber(item.producedQty)} · Desperdício:{' '}
                            {formatNumber(item.wastedQty)}
                          </Text>
                        </View>
                      </View>
                      <StatusBadge
                        status={itemBadge.variant}
                        label={itemBadge.label}
                        size="sm"
                      />
                    </View>
                    {isOpen && (
                      <AppButton
                        title="Registrar produção"
                        variant="outline"
                        size="md"
                        accessibilityLabel={`Registrar produção de ${item.productName}`}
                        onPress={() => setRegisterItem(item)}
                        style={styles.itemActionButton}
                      />
                    )}
                  </AppCard>
                );
              })
            )}

            {order.observations ? (
              <>
                <Text style={styles.sectionLabel}>Observações</Text>
                <AppCard shadow="light" style={styles.obsCard}>
                  <Text style={styles.obsText}>{order.observations}</Text>
                </AppCard>
              </>
            ) : null}

            {isOpen && (
              <View style={styles.actions}>
                <AppButton
                  title="Concluir ordem"
                  size="md"
                  accessibilityLabel="Concluir ordem de produção"
                  onPress={() => completeMutation.mutate()}
                  loading={completeMutation.isPending}
                  disabled={completeMutation.isPending}
                  style={styles.actionButton}
                />
              </View>
            )}
          </>
        ) : null}
      </ScreenContainer>

      <RegisterProductionModal
        item={registerItem}
        loading={registerProductionMutation.isPending}
        onConfirm={(producedQty, wastedQty) => {
          if (registerItem) {
            registerProductionMutation.mutate({
              itemId: registerItem.id,
              data: { producedQty, wastedQty },
            });
          }
        }}
        onClose={() => setRegisterItem(null)}
      />

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Excluir ordem de produção"
        message="Tem certeza que deseja excluir esta ordem? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDeleteVisible(false)}
      />

      {snackbar && (
        <AppSnackbar
          visible={true}
          type={snackbar.type}
          message={snackbar.message}
          onHide={() => setSnackbar(null)}
        />
      )}
    </View>
  );
}
