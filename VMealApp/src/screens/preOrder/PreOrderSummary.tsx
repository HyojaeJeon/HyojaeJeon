import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/mock/mockData';

interface SummaryItem {
  name: string;
  price: number;
}

interface PreOrderSummaryProps {
  items: SummaryItem[];
  total: number;
  pickupTime: string;
}

export function PreOrderSummary({ items, total, pickupTime }: PreOrderSummaryProps) {
  const { t } = useTranslation();
  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm gap-3">
      <Text className="text-sm font-semibold text-gray-900">{t('preOrder.summary')}</Text>

      {/* Items */}
      <View className="gap-2">
        {items.map((item, i) => (
          <View key={i} className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">{item.name}</Text>
            <Text className="text-sm text-gray-700">{formatVnd(item.price)}</Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-100" />

      {/* Total */}
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-gray-900">{t('common.total')}:</Text>
        <Text className="text-base font-bold text-gray-900">{formatVnd(total)}</Text>
      </View>

      {/* Pickup time */}
      <Text className="text-xs text-gray-400">{t('preOrder.pickupAt')} {pickupTime}</Text>

      {/* CTA */}
      <Pressable className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]">
        <Text className="text-[15px] font-semibold text-white">
          {t('preOrder.preOrderBtn')}
        </Text>
      </Pressable>
    </View>
  );
}
