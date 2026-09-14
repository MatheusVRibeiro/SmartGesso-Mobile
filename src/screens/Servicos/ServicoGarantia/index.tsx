import React, { useState, useMemo } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import type { StatusBadgeVariant } from '@/src/components/ui/StatusBadge';
import { toApiError } from '@/src/services/api/client';
import { warrantiesService } from '@/src/services/api/warranties';
import { useSessionStore } from '@/src/store/useSessionStore';
import { borders, colors, radius, sizes, spacing, typography } from '@/src/theme';
import { createServicoGarantiaStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const WARRANTY_STATUS_MAP: Record<string, { variant: StatusBadgeVariant; label: string }> = {
  ACTIVE: { variant: 'active', label: 'Ativa' },
  EXPIRED: { variant: 'expired', label: 'Expirada' },
  CLOSED: { variant: 'cancelled', label: 'Encerrada' },
};

const RETURN_STATUS_MAP: Record<string, { variant: StatusBadgeVariant; label: string }> = {
  OPEN: { variant: 'warning', label: 'Aberto' },
  RESOLVED: { variant: 'active', label: 'Resolvido' },
  CLOSED: { variant: 'cancelled', label: 'Encerrado' },
};

export default function GarantiaServicoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createServicoGarantiaStyles(colors, isDark), [colors, isDark]);
  const queryClient = useQueryClient();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const params = useLocalSearchParams<{ id: string }>();
  const serviceOrderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [snackbar, setSnackbar] = useState<{ type: AppSnackbarType; message: string } | null>(null);
  
  // Modals
  const [createWarrantyModalVisible, setCreateWarrantyModalVisible] = useState(false);
  const [createReturnModalVisible, setCreateReturnModalVisible] = useState(false);

  // Form states
  const [warrantyDays, setWarrantyDays] = useState('');
  const [warrantyNotes, setWarrantyNotes] = useState('');
  
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnWarrantyId, setReturnWarrantyId] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const warrantiesQuery = useQuery({
    queryKey: ['company', companyId, 'warranties', serviceOrderId],
    queryFn: () => warrantiesService.listWarranties(serviceOrderId as string),
    enabled: Boolean(companyId && serviceOrderId),
  });

  const returnsQuery = useQuery({
    queryKey: ['company', companyId, 'returns', serviceOrderId],
    queryFn: () => warrantiesService.listReturns(serviceOrderId as string),
    enabled: Boolean(companyId && serviceOrderId),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([warrantiesQuery.refetch(), returnsQuery.refetch()]);
    setRefreshing(false);
  };

  const createWarrantyMutation = useMutation({
    mutationFn: () => warrantiesService.createWarranty(serviceOrderId as string, {
      warrantyDays: parseInt(warrantyDays, 10),
      notes: warrantyNotes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'warranties', serviceOrderId] });
      setCreateWarrantyModalVisible(false);
      setWarrantyDays('');
      setWarrantyNotes('');
      setSnackbar({ type: 'success', message: 'Garantia criada com sucesso' });
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  const createReturnMutation = useMutation({
    mutationFn: () => warrantiesService.createReturn(serviceOrderId as string, {
      reason: returnReason,
      description: returnDescription || undefined,
      warrantyId: returnWarrantyId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId, 'returns', serviceOrderId] });
      setCreateReturnModalVisible(false);
      setReturnReason('');
      setReturnDescription('');
      setReturnWarrantyId('');
      setSnackbar({ type: 'success', message: 'Retorno registrado com sucesso' });
    },
    onError: (err) => {
      setSnackbar({ type: 'error', message: toApiError(err).message });
    },
  });

  if (warrantiesQuery.isLoading || returnsQuery.isLoading) {
    return <LoadingState />;
  }

  if (warrantiesQuery.isError || returnsQuery.isError) {
    return <ErrorState message="Erro ao carregar dados" onRetry={handleRefresh} />;
  }

  const warranties = warrantiesQuery.data?.data || [];
  const returns = returnsQuery.data?.data || [];

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Garantias</Text>
          <AppButton
            title="Nova Garantia"
            size="sm"
            onPress={() => setCreateWarrantyModalVisible(true)}
            style={styles.addButton}
          />
        </View>

        {warranties.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma garantia registrada</Text>
          </AppCard>
        ) : (
          warranties.map((w) => {
            const statusInfo = WARRANTY_STATUS_MAP[w.status] || { variant: 'info' as StatusBadgeVariant, label: w.status };
            return (
              <AppCard key={w.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Garantia #{w.id.substring(0, 8)}</Text>
                  <StatusBadge status={statusInfo.variant} label={statusInfo.label} size="sm" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.label}>Início:</Text>
                  <Text style={styles.value}>{new Date(w.startDate).toLocaleDateString('pt-BR')}</Text>
                  <Text style={styles.label}>Término:</Text>
                  <Text style={styles.value}>{new Date(w.endDate).toLocaleDateString('pt-BR')}</Text>
                  {w.notes && (
                    <>
                      <Text style={styles.label}>Observação:</Text>
                      <Text style={styles.value}>{w.notes}</Text>
                    </>
                  )}
                </View>
              </AppCard>
            );
          })
        )}

        <View style={[styles.header, styles.sectionHeader]}>
          <Text style={styles.title}>Retornos</Text>
          <AppButton
            title="Novo Retorno"
            size="sm"
            variant="outline"
            onPress={() => setCreateReturnModalVisible(true)}
            style={styles.addButton}
          />
        </View>

        {returns.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum retorno registrado</Text>
          </AppCard>
        ) : (
          returns.map((r) => {
            const statusInfo = RETURN_STATUS_MAP[r.status] || { variant: 'info' as StatusBadgeVariant, label: r.status };
            return (
              <AppCard key={r.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Retorno #{r.id.substring(0, 8)}</Text>
                  <StatusBadge status={statusInfo.variant} label={statusInfo.label} size="sm" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.label}>Motivo:</Text>
                  <Text style={styles.value}>{r.reason}</Text>
                  {r.description && (
                    <>
                      <Text style={styles.label}>Descrição:</Text>
                      <Text style={styles.value}>{r.description}</Text>
                    </>
                  )}
                </View>
              </AppCard>
            );
          })
        )}
      </ScrollView>

      {/* Modal Criar Garantia */}
      <Modal visible={createWarrantyModalVisible} animationType="slide" onRequestClose={() => setCreateWarrantyModalVisible(false)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Garantia</Text>
            <Pressable onPress={() => setCreateWarrantyModalVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <AppInput
              label="Dias de Garantia"
              value={warrantyDays}
              onChangeText={setWarrantyDays}
              keyboardType="number-pad"
              placeholder="Ex: 90"
            />
            <AppInput
              label="Observações"
              value={warrantyNotes}
              onChangeText={setWarrantyNotes}
              multiline
            />
            <AppButton
              title="Criar Garantia"
              loading={createWarrantyMutation.isPending}
              onPress={() => createWarrantyMutation.mutate()}
              style={styles.modalButton}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal Criar Retorno */}
      <Modal visible={createReturnModalVisible} animationType="slide" onRequestClose={() => setCreateReturnModalVisible(false)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Retorno</Text>
            <Pressable onPress={() => setCreateReturnModalVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <AppInput
              label="Motivo *"
              value={returnReason}
              onChangeText={setReturnReason}
              placeholder="Descreva o motivo"
            />
            <AppInput
              label="Descrição"
              value={returnDescription}
              onChangeText={setReturnDescription}
              multiline
            />
            <AppInput
              label="ID da Garantia (Opcional)"
              value={returnWarrantyId}
              onChangeText={setReturnWarrantyId}
              placeholder="Se aplicável"
            />
            <AppButton
              title="Registrar Retorno"
              loading={createReturnMutation.isPending}
              onPress={() => createReturnMutation.mutate()}
              style={styles.modalButton}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <AppSnackbar visible={!!snackbar} message={snackbar?.message || ''} type={snackbar?.type || 'info'} onHide={() => setSnackbar(null)} />
    </ScreenContainer>
  );
}
