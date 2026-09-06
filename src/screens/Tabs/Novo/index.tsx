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
  QuickHammerIcon,
  QuickUserPlusIcon,
  type LucideIconComponent,
} from '@/src/components/ui/LucideIcons';
import { createNovoStyles } from './styles';

interface QuickAction {
  id: string;
  title: string;
  Icon: LucideIconComponent;
  route?: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'orcamento',
    title: 'Novo orçamento',
    Icon: QuickDocumentIcon,
    route: '/orcamentos/novo',
    color: '#2563EB',
    bgLight: '#EFF6FF',
    bgDark: 'rgba(37,99,235,0.18)',
  },
  {
    id: 'cliente',
    title: 'Novo cliente',
    Icon: QuickUserPlusIcon,
    route: '/clientes/novo',
    color: '#059669',
    bgLight: '#ECFDF5',
    bgDark: 'rgba(5,150,105,0.18)',
  },
  {
    id: 'calculadora',
    title: 'Calculadora Drywall',
    Icon: QuickCalculatorIcon,
    route: '/ferramentas/calculadora',
    color: '#9333EA',
    bgLight: '#F3E8FF',
    bgDark: 'rgba(147,51,234,0.18)',
  },
  {
    id: 'pagamento',
    title: 'Registrar pagamento',
    Icon: QuickDollarIcon,
    route: '/pagamentos/novo',
    color: '#D97706',
    bgLight: '#FFFBEB',
    bgDark: 'rgba(217,119,6,0.18)',
  },
  {
    id: 'despesa',
    title: 'Nova despesa',
    Icon: QuickCreditCardIcon,
    route: '/despesas/novo',
    color: '#DC2626',
    bgLight: '#FEF2F2',
    bgDark: 'rgba(220,38,38,0.18)',
  },
  {
    id: 'producao',
    title: 'Nova produção',
    Icon: QuickHammerIcon,
    route: '/producao/novo',
    color: '#475569',
    bgLight: '#F1F5F9',
    bgDark: 'rgba(71,85,105,0.18)',
  },
];

export default function NovoScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovoStyles(colors, isDark), [colors, isDark]);

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
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: isDark ? action.bgDark : action.bgLight },
                ]}
              >
                <action.Icon
                  size={26}
                  color={action.color}
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
