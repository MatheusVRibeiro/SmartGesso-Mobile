import { useAppTheme } from '../../../theme/ThemeProvider';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppCard } from '../../ui/AppCard';
import { AppButton } from '../../ui/AppButton';
import { borders, colors, radius, sizes, spacing, typography } from '../../../theme';
import { formatCurrency } from '../../../utils/format';
import type { Quote } from '../../../types/quote';
import type { Company, CompanySummary } from '../../../types/company';

export interface QuoteFollowUpCardProps {
  quote: Quote;
  company?: Partial<Company> | Partial<CompanySummary> | null;
  daysPending: number;
  onFollowUpRegistered?: () => void;
}

export function QuoteFollowUpCard({

  quote,
  company,
  daysPending,
  onFollowUpRegistered,
}: QuoteFollowUpCardProps) {
  const router = useRouter();

  const clientName = quote.client?.name || 'Cliente';
  const companyName =
    ('tradeName' in (company || {}) ? (company as Partial<CompanySummary>).tradeName : '') ||
    ('name' in (company || {}) ? (company as Partial<Company>).name : '') ||
    'SmartGesso';
  const phone = (('phone' in (quote.client || {}) ? (quote.client as { phone?: string }).phone : '') || '').replace(/\D/g, '');

  const handleWhatsAppFollowUp = async () => {
    const text = encodeURIComponent(
      `Olá *${clientName}*, tudo bem?\n\n` +
        `Aqui é da *${companyName}*! Estou passando para saber se você conseguiu avaliar a proposta de gesso / drywall que enviamos para a sua obra.\n\n` +
        `💰 *Valor:* ${formatCurrency(quote.total)}\n\n` +
        `Ficamos à sua inteira disposição caso queira tirar dúvidas ou ajustar algum detalhe do projeto. Podemos dar andamento?`
    );

    const url = phone
      ? `https://wa.me/55${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    await Linking.openURL(url);
    onFollowUpRegistered?.();
  };

  return (
    <AppCard shadow="light" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="time-outline" size={sizes.icon.sm} color={colors.warning} />
          <Text style={styles.badgeText}>Pendente há {daysPending} dias</Text>
        </View>
        <Text style={styles.quoteCode}>#{quote.quoteNumber} v{quote.version}</Text>
      </View>

      <Text style={styles.clientName} numberOfLines={1}>
        {clientName}
      </Text>

      {quote.work?.name ? (
        <Text style={styles.workName} numberOfLines={1}>
          Obra: {quote.work.name}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Valor da Proposta</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver detalhes do orçamento"
            onPress={() => router.push(`/orcamentos/${quote.id}`)}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>Ver</Text>
          </Pressable>

          <AppButton
            title="Recontatar"
            size="sm"
            variant="primary"
            accessibilityLabel={`Recontatar ${clientName} no WhatsApp`}
            onPress={handleWhatsAppFollowUp}
            style={styles.whatsAppButton}
          />
        </View>
      </View>
    </AppCard>
  );
}

export default QuoteFollowUpCard;

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.warning,
  },
  quoteCode: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  clientName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  workName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  totalValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailsButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailsButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  whatsAppButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
  },
});
const styles = createStyles(colors, false);
