import { BackButton } from '@/src/components/navigation/BackButton';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppCard, ScreenContainer, StatusBadge, EmptyState } from '@/src/components/ui';
import { catalogService } from '@/src/services/api/catalog';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import { formatCurrency } from '@/src/utils/format';
import { createCatalogoStyles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];
type CatalogTab = 'geral' | 'servicos' | 'materiais' | 'produtos';

interface CatalogMenuItem {
  id: number | string;
  name: string;
  unit?: string | null;
  status?: string | null;
  price?: number | null;
  cost?: number | null;
  stockQty?: number | null;
}

interface CatalogoItemCardProps {
  item: CatalogMenuItem;
  styles: ReturnType<typeof createCatalogoStyles>;
}

/** Card memoizado — evita re-render de todos os itens quando a tela re-renderiza. */
const CatalogoItemCard = React.memo(function CatalogoItemCard({ item, styles }: CatalogoItemCardProps) {
  return (
    <AppCard shadow="light" radius={radius.md} style={styles.itemCard}>
      <View style={styles.itemCardContent}>
        <View style={styles.itemCardMain}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemMeta}>
            Unidade: {item.unit || 'un'}
            {item.stockQty != null ? ` • Estoque: ${item.stockQty}` : ''}
          </Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemPrice}>{formatCurrency(item.price ?? item.cost ?? 0)}</Text>
          <StatusBadge
            status={item.status === 'ACTIVE' ? 'active' : 'cancelled'}
            label={item.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
            size="sm"
          />
        </View>
      </View>
    </AppCard>
  );
});

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
  const [activeTab, setActiveTab] = useState<CatalogTab>('geral');

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

  const tabs: { id: CatalogTab; label: string; count?: number | null }[] = [
    { id: 'geral', label: 'Visão Geral' },
    { id: 'servicos', label: 'Serviços', count: counts.servicos },
    { id: 'materiais', label: 'Materiais', count: counts.materiais },
    { id: 'produtos', label: 'Produtos', count: counts.produtos },
  ];

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <BackButton fallback="/(app)/(tabs)/mais" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Catálogo</Text>
          <Text style={styles.subtitle}>
            Gerencie produtos, serviços e materiais da sua empresa
          </Text>
        </View>
      </View>

      {/* Segmented Tabs / Pills */}
      <View style={{ marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
                  {tab.label}
                </Text>
                {tab.count != null ? (
                  <View style={[styles.badgeCount, isActive && styles.badgeCountActive]}>
                    <Text style={[styles.badgeCountText, isActive && styles.badgeCountTextActive]}>
                      {tab.count}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Conteúdo da Aba Geral */}
      {activeTab === 'geral' && (
        <View style={styles.cardsContainer}>
          {MENU_CARDS.map((card) => {
            const count = counts[card.id];
            return (
              <Pressable
                key={card.id}
                onPress={() => router.push(card.route as any)}
                accessibilityRole="button"
                accessibilityLabel={`${card.title}${count != null ? `, ${count} itens` : ''}`}
                style={({ pressed }) => [pressed && styles.cardPressed]}
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
                    <Text style={styles.cardAction}>Abrir gerenciador</Text>
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
      )}

      {/* Conteúdo da Aba Serviços */}
      {activeTab === 'servicos' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Serviços Cadastrados</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push('/(app)/catalogo/servicos')}
            >
              <Text style={styles.sectionActionText}>Gerenciar todos</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {!services || services.length === 0 ? (
            <EmptyState
              title="Nenhum serviço"
              description="Cadastre serviços para orçar mão de obra com facilidade"
              icon="hammer-outline"
              actionLabel="Novo Serviço"
              onAction={() => router.push('/(app)/catalogo/servicos')}
            />
          ) : (
            <View style={styles.itemsList}>
              {services.map((item: any) => (
                <CatalogoItemCard key={item.id} item={item} styles={styles} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Conteúdo da Aba Materiais */}
      {activeTab === 'materiais' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Materiais & Insumos</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push('/(app)/catalogo/materiais')}
            >
              <Text style={styles.sectionActionText}>Gerenciar todos</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {!materials || materials.length === 0 ? (
            <EmptyState
              title="Nenhum material"
              description="Cadastre insumos e matéria-prima para cálculo automático"
              icon="layers-outline"
              actionLabel="Novo Material"
              onAction={() => router.push('/(app)/catalogo/materiais')}
            />
          ) : (
            <View style={styles.itemsList}>
              {materials.map((item: any) => (
                <CatalogoItemCard key={item.id} item={item} styles={styles} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Conteúdo da Aba Produtos */}
      {activeTab === 'produtos' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produtos Prontos</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push('/(app)/catalogo/produtos')}
            >
              <Text style={styles.sectionActionText}>Gerenciar todos</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {!products || products.length === 0 ? (
            <EmptyState
              title="Nenhum produto"
              description="Cadastre produtos acabados para venda direta ou composição"
              icon="cube-outline"
              actionLabel="Novo Produto"
              onAction={() => router.push('/(app)/catalogo/produtos')}
            />
          ) : (
            <View style={styles.itemsList}>
              {products.map((item: any) => (
                <CatalogoItemCard key={item.id} item={item} styles={styles} />
              ))}
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
