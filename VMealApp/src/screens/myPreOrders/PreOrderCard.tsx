import { View, Text, Pressable } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { formatVnd } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';

type PreOrderStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface PreOrderData {
  id: string;
  merchantName: string;
  merchantInitial: string;
  merchantColor: string;
  items: string;
  amount: number;
  dateLabel: string;
  status: PreOrderStatus;
  muted?: boolean;
}

interface PreOrderCardProps {
  order: PreOrderData;
  onCancel?: (id: string) => void;
}

const STATUS_STYLE: Record<PreOrderStatus, { bg: string; text: string }> = {
  CONFIRMED: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  PENDING: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-500' },
  CANCELLED: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]' },
};

const STATUS_LABEL_KEY: Record<PreOrderStatus, string> = {
  CONFIRMED: 'myPreOrders.confirmed',
  PENDING: 'myPreOrders.pending',
  COMPLETED: 'myPreOrders.completed',
  CANCELLED: 'myPreOrders.cancelled',
};

export type { PreOrderData, PreOrderStatus };

export function PreOrderCard({ order, onCancel }: PreOrderCardProps) {
  const { t } = useTranslation();
  const statusStyle = STATUS_STYLE[order.status];

  return (
    <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: spacing.cardPaddingCompact, opacity: order.muted ? 0.7 : 1, ...shadows.card }}>
      {/* Top row: merchant + status */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center" style={{ gap: spacing.elementGap }}>
          <View
            className="flex shrink-0 items-center justify-center"
            style={{ height: 40, width: 40, borderRadius: radius.full, backgroundColor: order.merchantColor }}
          >
            <Text style={{ color: colors.textInverse, fontSize: 14, fontWeight: '600' }}>{order.merchantInitial}</Text>
          </View>
          <Text style={typography.cardTitle}>{order.merchantName}</Text>
        </View>
        <View className={`flex-row items-center ${statusStyle.bg}`} style={{ borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text className={statusStyle.text} style={{ fontSize: 11, fontWeight: '500' }}>
            {t(STATUS_LABEL_KEY[order.status])}
          </Text>
        </View>
      </View>

      {/* Items summary */}
      <Text style={{ ...typography.body, marginTop: spacing.elementGap }}>{order.items}</Text>

      {/* Amount */}
      <Text style={{ ...typography.cardTitle, fontSize: 16, fontWeight: '700', marginTop: spacing.xs }}>{formatVnd(order.amount)}</Text>

      {/* Date */}
      <View className="flex-row items-center" style={{ gap: 6, marginTop: spacing.sm }}>
        <Calendar size={14} color={colors.textTertiary} />
        <Text style={typography.caption}>{order.dateLabel}</Text>
      </View>

      {/* Cancel action (only for upcoming) */}
      {(order.status === 'CONFIRMED' || order.status === 'PENDING') && (
        <View style={{ marginTop: spacing.elementGap, paddingTop: spacing.elementGap, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Pressable onPress={() => onCancel?.(order.id)} className="active:opacity-70">
            <Text style={{ ...typography.caption, fontWeight: '500', color: colors.danger }}>{t('myPreOrders.cancelOrder')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
