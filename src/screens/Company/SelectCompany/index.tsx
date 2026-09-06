import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppCard } from '@/src/components/ui/AppCard';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { queryClient } from '@/src/lib/queryClient';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { authService } from '@/src/services/api/auth';
import { useSessionStore } from '@/src/store/useSessionStore';
import { SecureTokenStorage } from '@/src/services/auth/SecureTokenStorage';
import { colors, spacing, typography, radius, sizes } from '@/src/theme';
import type { CompanyResult, CompanyMemberStatus } from '@/src/types/company';
import { createSelectCompanyStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function SelectCompanyScreen() {
  const router = useRouter();
  const { setSession, setActiveCompany } = useSessionStore();
  const [companies, setCompanies] = useState<CompanyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createSelectCompanyStyles(colors, isDark), [colors, isDark]);

  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const data = await authService.companies();
      setCompanies(data);

      // Auto-select if only one active company
      const activeCompanies = data.filter(
        (c) => c.member.status === 'ACTIVE'
      );
      if (activeCompanies.length === 1) {
        await handleSelectCompany(activeCompanies[0].company.id);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSelectCompany = useCallback(
    async (companyId: string) => {
      try {
        setSelectingId(companyId);
        const response = await authService.switchCompany({ companyId });
        
        // Save new tokens
        await SecureTokenStorage.setAccessToken(response.accessToken);
        await SecureTokenStorage.setRefreshToken(response.refreshToken);
        
        // Find the selected company in the list
        const selectedCompany = companies.find(
          (c) => c.company.id === companyId
        );
        
        // Update store
        if (selectedCompany) {
          setActiveCompany(selectedCompany);
        }
        
        // V3 §59: limpar cache do tenant anterior ao trocar de empresa.
        queryClient.clear();

        // Navigate to main app
        router.replace('/(app)/(tabs)');
      } catch (err: any) {
        setError(err?.message || 'Erro ao selecionar empresa');
        setSelectingId(null);
      }
    },
    [companies, setActiveCompany, router]
  );

  const getStatusVariant = (status: CompanyMemberStatus): 'active' | 'warning' | 'suspended' | 'cancelled' | 'expired' => {
    switch (status) {
      case 'ACTIVE':
        return 'active';
      case 'INVITED':
        return 'warning';
      case 'INACTIVE':
        return 'cancelled';
      case 'BLOCKED':
        return 'suspended';
      default:
        return 'expired';
    }
  };

  const getStatusLabel = (status: CompanyMemberStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'INVITED':
        return 'Convite pendente';
      case 'INACTIVE':
        return 'Inativo';
      case 'BLOCKED':
        return 'Bloqueado';
      default:
        return 'Desconhecido';
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: CompanyResult }) => {
      const isSelected = selectingId === item.company.id;
      const isBlocked = item.member.status === 'BLOCKED';
      const isInactive = item.member.status === 'INACTIVE';
      const canSelect = !isBlocked && !isInactive && !selectingId;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.cardPressable,
            pressed && canSelect && styles.cardPressed,
          ]}
          onPress={() => canSelect && handleSelectCompany(item.company.id)}
          disabled={!canSelect}
          accessibilityRole="button"
          accessibilityLabel={`Selecionar empresa ${item.company.tradeName}`}
          testID={`company-card-${item.company.id}`}
        >
          <AppCard
            padding={spacing.lg}
            radius={radius.lg}
            shadow="light"
            style={StyleSheet.flatten([
              styles.card,
              isSelected && styles.cardSelected,
              isBlocked && styles.cardBlocked,
            ])}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name="business-outline"
                  size={sizes.icon.lg}
                  color={colors.primary}
                  accessibilityElementsHidden
                />
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {item.company.tradeName}
                  </Text>
                  <StatusBadge
                    status={getStatusVariant(item.member.status)}
                    label={getStatusLabel(item.member.status)}
                    size="sm"
                  />
                </View>

                <Text style={styles.companyDocument}>
                  {item.company.document}
                </Text>

                {item.member.isOwner && (
                  <View style={styles.ownerBadge}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <Text style={styles.ownerText}>Proprietário</Text>
                  </View>
                )}
              </View>

              {canSelect && (
                <Ionicons
                  name="chevron-forward"
                  size={sizes.icon.md}
                  color={colors.textLight}
                  accessibilityElementsHidden
                />
              )}
            </View>

            {isSelected && (
              <View style={styles.loadingOverlay}>
                <LoadingState size="small" text="Selecionando..." />
              </View>
            )}
          </AppCard>
        </Pressable>
      );
    },
    [selectingId, handleSelectCompany]
  );

  if (loading && !refreshing) {
    return (
      <ScreenContainer>
        <LoadingState text="Carregando empresas..." />
      </ScreenContainer>
    );
  }

  if (error && companies.length === 0) {
    return (
      <ScreenContainer>
        <ErrorState
          message={error}
          title="Erro ao carregar empresas"
          onRetry={fetchCompanies}
          retryLabel="Tentar novamente"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padding={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Selecione sua empresa</Text>
        <Text style={styles.headerSubtitle}>
          Escolha a empresa que deseja acessar
        </Text>
      </View>

      {companies.length === 0 ? (
        <EmptyState
          title="Nenhuma empresa vinculada"
          description="Você não possui acesso a nenhuma empresa no momento."
          icon="business-outline"
          actionLabel="Suporte"
          onAction={() => {
            // TODO: Open support link
          }}
        />
      ) : (
        <FlatList
          data={companies}
          renderItem={renderItem}
          keyExtractor={(item) => item.company.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <AppButton
                  title="Tentar novamente"
                  variant="ghost"
                  size="sm"
                  onPress={fetchCompanies}
                />
              </View>
            ) : null
          }
        />
      )}
    </ScreenContainer>
  );
}
