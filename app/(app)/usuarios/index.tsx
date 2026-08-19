import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppCard } from '../../../src/components/ui/AppCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { PermissionGate } from '../../../src/components/domain/PermissionGate';
import { mockCompanyUsers } from '../../../src/data/mockUsers';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { USER_MANAGE_ROLES } from '../../../src/types/permissions';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';
import { COMPANY_USER_ROLE_LABELS } from '../../../src/types/user';
import type { CompanyUser } from '../../../src/types/user';

export default function UsuariosListScreen() {
  const router = useRouter();
  const companyName = useSessionStore((s) => s.activeCompany?.company.tradeName ?? null);

  const renderItem = ({ item }: { item: CompanyUser }) => {
    const initial = item.name.trim().charAt(0).toUpperCase();

    return (
      <AppCard shadow="light" radius={radius.md} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <StatusBadge
                status={item.status === 'ATIVO' ? 'active' : 'suspended'}
                label={item.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                size="sm"
              />
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="briefcase-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardRowText} numberOfLines={1}>
                {COMPANY_USER_ROLE_LABELS[item.role]}
              </Text>
            </View>

            <View style={styles.cardRow}>
              <Ionicons
                name="mail-outline"
                size={sizes.icon.sm}
                color={colors.textSecondary}
                accessibilityElementsHidden
              />
              <Text style={styles.cardRowText} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <ScreenContainer padding keyboard={false}>
      <Stack.Screen options={{ title: 'Usuários' }} />

      <PermissionGate
        allow={USER_MANAGE_ROLES}
        fallback={
          <EmptyState
            title="Sem permissão"
            description="Apenas o proprietário e gerentes podem gerenciar usuários."
            icon="lock-closed-outline"
          />
        }
      >
        <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Usuários</Text>
          {companyName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {companyName}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/usuarios/novo')}
          accessibilityRole="button"
          accessibilityLabel="Convidar usuário"
          style={styles.addButton}
        >
          <Ionicons name="add" size={sizes.icon.lg} color={colors.white} accessibilityElementsHidden />
        </TouchableOpacity>
      </View>

      {/* Aviso honesto: dados de exemplo até a API expor o endpoint de membros */}
      <AppCard shadow="light" radius={radius.md} style={styles.noticeCard}>
        <View style={styles.noticeContent}>
          <Ionicons
            name="information-circle-outline"
            size={sizes.icon.lg}
            color={colors.info}
            accessibilityElementsHidden
          />
          <Text style={styles.noticeText}>
            Lista de exemplo — a integração com a API estará disponível na próxima versão.
          </Text>
        </View>
      </AppCard>

      <AppButton
        title="Convidar usuário"
        onPress={() => router.push('/usuarios/novo')}
        accessibilityLabel="Convidar usuário"
        style={styles.inviteButton}
      />

      <FlatList
        data={mockCompanyUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      </PermissionGate>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitles: {
    flex: 1,
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  addButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.infoSoft,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  inviteButton: {
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing['3xl'],
  },
  card: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardRowText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});