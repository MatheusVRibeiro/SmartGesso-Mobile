import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, sizes, spacing, typography } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { ActivePalette } from '../../theme/ThemeProvider';
import {
  QuickCalculatorIcon,
  QuickCreditCardIcon,
  QuickDocumentIcon,
  QuickDollarIcon,
  QuickWrenchIcon,
  QuickUserPlusIcon,
  type LucideIconComponent,
} from '../ui/LucideIcons';

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIconComponent;
  route: string;
}

const ACTIONS: QuickActionItem[] = [
  {
    id: 'orcamento',
    title: 'Novo Orçamento',
    subtitle: 'Composição de forro, parede e sanca',
    Icon: QuickDocumentIcon,
    route: '/orcamentos/novo',
  },
  {
    id: 'cliente',
    title: 'Novo Cliente',
    subtitle: 'Cadastro rápido de contato e obra',
    Icon: QuickUserPlusIcon,
    route: '/clientes/novo',
  },
  {
    id: 'calculadora',
    title: 'Calculadora Drywall',
    subtitle: 'Estimativa de placas, perfis e parafusos',
    Icon: QuickCalculatorIcon,
    route: '/ferramentas/calculadora',
  },
  {
    id: 'pagamento',
    title: 'Registrar Pagamento',
    subtitle: 'Entrada de valor ou faturamento de O.S.',
    Icon: QuickDollarIcon,
    route: '/pagamentos/novo',
  },
  {
    id: 'despesa',
    title: 'Nova Despesa',
    subtitle: 'Custos operacionais e notas fiscais',
    Icon: QuickCreditCardIcon,
    route: '/despesas/novo',
  },
  {
    id: 'producao',
    title: 'Nova Produção',
    subtitle: 'Ordem de fabricação de placas/perfis',
    Icon: QuickWrenchIcon,
    route: '/producao/novo',
  },
];

export interface QuickActionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function QuickActionBottomSheet({ visible, onClose }: QuickActionBottomSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const iconColor = isDark ? '#818CF8' : colors.primary;

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 25,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSelect = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xl),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.indicator} />

          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.title}>Ações Rápidas</Text>
              <Text style={styles.subtitle}>O que você deseja criar agora?</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={8}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleSelect(action.route)}
                activeOpacity={0.7}
                style={styles.actionCard}
                accessibilityRole="button"
                accessibilityLabel={action.title}
              >
                <View style={styles.actionIcon}>
                  <action.Icon size={24} color={iconColor} strokeWidth={2} />
                </View>
                <View style={styles.actionTextBox}>
                  <Text style={styles.actionTitle} numberOfLines={1}>
                    {action.title}
                  </Text>
                  <Text style={styles.actionSubtitle} numberOfLines={1}>
                    {action.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(15, 23, 42, 0.5)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 16,
      elevation: 20,
    },
    indicator: {
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerTitleBox: {
      flex: 1,
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    subtitle: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      width: sizes.touchTarget,
      height: sizes.touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    grid: {
      gap: spacing.xs,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: isDark ? '#1C1D20' : colors.background,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
    },
    actionIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(94, 106, 210, 0.18)' : colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    actionTextBox: {
      flex: 1,
    },
    actionTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    actionSubtitle: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

export default QuickActionBottomSheet;
