import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppCard, ScreenContainer } from '../../../src/components/ui';
import { catalogService } from '../../../src/services/api/catalog';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface CatalogMenuCard {
  id: 'produtos' | 'servicos' | 'materiais';
  title: string;
  description: string;
  icon: IconName;
  route: string;
}

const MENU_CARDS: CatalogMenuCard[] = [
  {
    id: 'produtos',
    title: 'Produtos',
    description: 'Itens prontos e materiais vendidos',
    icon: 'cube-outline',
    route: '/(app)/catalogo/produtos',
  },
  {
    id: 'servicos',
    title: 'Serviços',
    description: 'Mão de obra e serviços executados',
    icon: 'hammer-outline',
    route: '/(app)/catalogo/servicos',
  },
  {
    id: 'materiais',
    title: 'Materiais',
    description: 'Insumos com controle de estoque',
    icon: 'layers-outline',
    route: '/(app)/catalogo/materiais',
  },
];

export default function CatalogoMenuScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company.id);

  const productsQuery = useQuery({
    queryKey: ['company', companyId, 'catalog', 'products', 'count'],
    queryFn: () => catalogService.listProducts({ limit: 1 }),
    enabled: !!companyId,
    select: (response) => response.total,
  });

  const servicesQuery = useQuery({
    queryKey: ['company', companyId, 'catalog', 'services', 'count'],
    queryFn: () => catalogService.listServices({ limit: 1 }),
    enabled: !!companyId,
    select: (response) => response.total,
  });

  const materialsQuery = useQuery({
    queryKey: ['company', companyId, 'catalog', 'materials', 'count'],
    queryFn: () => catalogService.listMaterials({ limit: 1 }),
    enabled: !!companyId,
    select: (response) => response.total,
  });

  const counts: Record<CatalogMenuCard['id'], number | undefined> = {
    produtos: productsQuery.data,
    servicos: servicesQuery.data,
    materiais: materialsQuery.data,
  };

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <Stack.Screen options={{ title: 'Catálogo' }} />

      <View style={styles.header}>
        <Text style={styles.title}>Catálogo</Text>
        <Text style={styles.subtitle}>
          Gerencie produtos, serviços e materiais da sua empresa
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {MENU_CARDS.map((card) => {
          const count = counts[card.id];
          return (
            <Pressable
              key={card.id}
              onPress={() => router.push(card.route)}
              accessibilityRole="button"
              accessibilityLabel={`${card.title}${count != null ? `, ${count} itens` : ''}`}
              style={({ pressed }) => [
                pressed && styles.cardPressed,
              ]}
            >
              <AppCard shadow="light" style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={card.icon}
                      size={sizes.icon.xl}
                      color={colors.primary}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.countContainer}>
                    <Text style={styles.countValue}>
                      {count != null ? count : '—'}
                    </Text>
                    <Text style={styles.countLabel}>itens</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardAction}>Abrir</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={sizes.icon.md}
                    color={colors.primary}
                    accessibilityElementsHidden
                  />
                </View>
              </AppCard>
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  cardsContainer: {
    gap: spacing.lg,
  },
  cardPressed: {
    opacity: 0.85,
  },
  card: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countContainer: {
    alignItems: 'flex-end',
  },
  countValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  countLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  cardDescription: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  cardFooter: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardAction: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});