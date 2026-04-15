import { View, Text, Pressable } from 'react-native';
import { colors, typography, spacing, radius, shadows, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/utils/format';

interface SummaryItem {
  name: string;
  price: number;
}

interface PreOrderSummaryProps {
  items: SummaryItem[];
  total: number;
  pickupTime: string;
  onSubmit?: () => void;
  submitting?: boolean;
}

export function PreOrderSummary({ items, total, pickupTime, onSubmit, submitting }: PreOrderSummaryProps) {
  const { t } = useTranslation();
  return (
    <View style={{ borderRadius: radius.xl, backgroundColor: colors.bgCard, padding: spacing.cardPaddingCompact, gap: spacing.elementGap, ...shadows.card }}>
      <Text style={typography.cardTitle}>{t('preOrder.summary')}</Text>

      {/* Items */}
      <View style={{ gap: spacing.sm }}>
        {items.map((item, i) => (
          <View key={i} className="flex-row items-center justify-between">
            <Text style={typography.body}>{item.name}</Text>
            <Text style={typography.body}>{formatVnd(item.price)}</Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.divider }} />

      {/* Total */}
      <View className="flex-row items-center justify-between">
        <Text style={{ ...typography.cardTitle, fontWeight: '700' }}>{t('common.total')}:</Text>
        <Text style={{ ...typography.sectionTitle }}>{formatVnd(total)}</Text>
      </View>

      {/* Pickup time */}
      <Text style={typography.caption}>{t('preOrder.pickupAt')} {pickupTime}</Text>

      {/* CTA */}
      <Pressable
        className="flex w-full items-center justify-center"
        style={{
          height: components.input.height,
          borderRadius: radius.md,
          backgroundColor: submitting ? `${colors.primary}99` : colors.primary,
        }}
        onPress={onSubmit}
        disabled={submitting}
      >
        <Text style={{ ...typography.button, color: colors.textInverse }}>
          {submitting ? '...' : t('preOrder.preOrderBtn')}
        </Text>
      </Pressable>
    </View>
  );
}
