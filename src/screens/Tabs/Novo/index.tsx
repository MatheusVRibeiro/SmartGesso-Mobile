import React, { useMemo } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppCard } from '@/src/components/ui/AppCard';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius } from '@/src/theme';
import {
  QuickCalculatorIcon,
  QuickCreditCardIcon,
  QuickDocumentIcon,
  QuickDollarIcon,
  QuickWrenchIcon,
  QuickUserPlusIcon,
  type LucideIconComponent,
} from '@/src/components/ui/LucideIcons';
import { createNovoStyles } from './styles';

interface QuickAction {
  id: string;
  title: string;
  Icon: LucideIconComponent;
  route?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'orcamento',
    title: 'Novo orçamento',
    Icon: QuickDocumentIcon,
    route: '/orcamentos/novo',
  },
  {
    id: 'cliente',
    title: 'Novo cliente',
    Icon: QuickUserPlusIcon,
    route: '/clientes/novo',
  },
  {
    id: 'calculadora',
    title: 'Calculadora Drywall',
    Icon: QuickCalculatorIcon,
    route: '/ferramentas/calculadora',
  },
  {
    id: 'pagamento',
    title: 'Registrar pagamento',
    Icon: QuickDollarIcon,
    route: '/pagamentos/novo',
  },
  {
    id: 'despesa',
    title: 'Nova despesa',
    Icon: QuickCreditCardIcon,
    route: '/despesas/novo',
  },
  {
    id: 'producao',
    title: 'Nova produção',
    Icon: QuickWrenchIcon,
    route: '/producao/novo',
  },
];

export default function NovoScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovoStyles(colors, isDark), [colors, isDark]);
  const iconColor = colors.iconAccent;

  const handleAction = (action: QuickAction) => {
    if (action.route) {
      router.push(action.route);
      return;
    }
    Alert.alert(
      'Módulo em desenvolvimento',
      `A funcionalidade "${action.title}" ainda está em desenvolvimento. Em breve disponível!`,
      [{ text: 'Entendi' }]
    );
  };

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Ações Rápidas</Text>
        <Text style={styles.subtitle}>O que você deseja cadastrar agora?</Text>
      </View>

      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => handleAction(action)}
            activeOpacity={0.7}
            style={styles.actionButton}
            accessibilityLabel={action.title}
            accessibilityRole="button"
          >
            <AppCard shadow="light" radius={radius.lg} style={styles.actionCard}>
              <View style={styles.actionIconContainer}>
                <action.Icon
                  size={26}
                  color={iconColor}
                  strokeWidth={2}
                />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </AppCard>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}
