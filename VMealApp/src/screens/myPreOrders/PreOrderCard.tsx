import { View, Text, Pressable } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { formatVnd } from '@shared/mock/mockData';
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

export function PreOrderCard({ order }: PreOrderCardProps) {
  const { t } = useTranslation();
  const statusStyle = STATUS_STYLE[order.status];

  return (
    <View className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${order.muted ? 'opacity-70' : ''}`}>
      {/* Top row: merchant + status */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: order.merchantColor }}
          >
            <Text className="text-white text-sm font-semibold">{order.merchantInitial}</Text>
          </View>
          <Text className="text-sm font-medium text-gray-900">{order.merchantName}</Text>
        </View>
        <View className={`flex-row items-center rounded-full px-2.5 py-1 ${statusStyle.bg}`}>
          <Text className={`text-[11px] font-medium ${statusStyle.text}`}>
            {t(STATUS_LABEL_KEY[order.status])}
          </Text>
        </View>
      </View>

      {/* Items summary */}
      <Text className="text-sm text-gray-600 mt-3">{order.items}</Text>

      {/* Amount */}
      <Text className="text-[16px] font-bold text-gray-900 mt-1">{formatVnd(order.amount)}</Text>

      {/* Date */}
      <View className="flex-row items-center gap-1.5 mt-2">
        <Calendar size={14} color="#9CA3AF" />
        <Text className="text-xs text-gray-400">{order.dateLabel}</Text>
      </View>

      {/* Cancel action (only for upcoming) */}
      {(order.status === 'CONFIRMED' || order.status === 'PENDING') && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Pressable>
            <Text className="text-xs font-medium text-[#EF4444]">{t('myPreOrders.cancelOrder')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
