import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { QuickActionBottomSheet } from '../../../src/components/navigation/QuickActionBottomSheet';

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [quickActionVisible, setQuickActionVisible] = useState(false);

  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 24 : 10);
  const tabHeight = Platform.select({
    ios: 62 + (insets.bottom > 0 ? insets.bottom : 24),
    default: 74,
  });

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: tabHeight,
            paddingTop: 8,
            paddingBottom: bottomInset,
          },
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            lineHeight: 14,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="orcamentos"
          options={{
            title: 'Orçamentos',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="novo"
          options={{
            title: 'Novo',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={24}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setQuickActionVisible(true);
            },
          }}
        />
        <Tabs.Screen
          name="servicos"
          options={{
            title: 'Serviços',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'hammer' : 'hammer-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="mais"
          options={{
            title: 'Mais',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      <QuickActionBottomSheet
        visible={quickActionVisible}
        onClose={() => setQuickActionVisible(false)}
      />
    </>
  );
}
