import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppCard, ScreenContainer } from '@/src/components/ui';
import { catalogService } from '@/src/services/api/catalog';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import { createCatalogoStyles } from './styles';

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
    description: 'Matéria-prima e insumos de produção',
    icon: 'layers-outline',
    route: '/(app)/catalogo/materiais',
  },
];

export default function CatalogoIndexScreen() {
  const router = useRouter();
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCatalogoStyles(colors, isDark), [colors, isDark]);

  const { data: products } = useQuery({
    queryKey: ['company', companyId, 'catalog-products'],
    queryFn: () => catalogService.listProducts(),
    select: (result) => (Array.isArray(result) ? result : (result as any)?.data ?? []),
    enabled: Boolean(companyId),
  });

  const { data: services } = useQuery({
    queryKey: ['company', companyId, 'catalog-services'],
    queryFn: () => catalogService.listServices(),
    select: (result) => (Array.isArray(result) ? result : (result as any)?.data ?? []),
    enabled: Boolean(companyId),
  });

  const { data: materials } = useQuery({
    queryKey: ['company', companyId, 'catalog-materials'],
    queryFn: () => catalogService.listMaterials(),
    select: (result) => (Array.isArray(result) ? result : (result as any)?.data ?? []),
    enabled: Boolean(companyId),
  });

  const counts: Record<string, number | null> = {
    produtos: products ? products.length : null,
    servicos: services ? services.length : null,
    materiais: materials ? materials.length : null,
  };

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

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
              onPress={() => router.push(card.route as any)}
              accessibilityRole="button"
              accessibilityLabel={`${card.title}${count != null ? `, ${count} itens` : ''}`}
              style={({ pressed }) => [
                pressed && styles.cardPressed,
              ]}
            >
              <AppCard shadow="light" radius={radius.lg} style={styles.card}>
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
