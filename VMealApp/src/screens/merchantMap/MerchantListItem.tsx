import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/mock/mockData';
import type { MockMerchant } from '@shared/mock/types';

const BRAND_COLORS = [
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

interface MerchantListItemProps {
  merchant: MockMerchant;
  index: number;
}

export function MerchantListItem({ merchant, index }: MerchantListItemProps) {
  const { t } = useTranslation();
  const initial = merchant.brandName.charAt(0);
  const colorClass = BRAND_COLORS[index % BRAND_COLORS.length];

  return (
    <View
      className={`flex-row items-center gap-3 rounded-xl bg-white p-3 border border-gray-100 shadow-sm ${
        !merchant.isOpen ? 'opacity-60' : ''
      }`}
    >
      {/* Brand circle */}
      <View
        className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full ${colorClass}`}
      >
        <Text className="text-white font-bold text-lg">{initial}</Text>
      </View>

      {/* Info */}
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {merchant.brandName}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
          {merchant.address}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Star size={12} color="#F59E0B" fill="#F59E0B" />
          <Text className="text-xs text-gray-500">{merchant.rating}</Text>
          <Text className="text-xs text-gray-300">({merchant.reviewCount})</Text>
          <Text className="text-xs text-gray-300">{'\u00B7'}</Text>
          <Text className="text-xs text-gray-500">{merchant.distanceKm} km</Text>
          <Text className="text-xs text-gray-300">{'\u00B7'}</Text>
          <Text className="text-xs text-gray-500">{formatVnd(merchant.avgPriceVnd)}</Text>
        </View>
      </View>

      {/* Status badge */}
      <View className="shrink-0">
        {merchant.isOpen ? (
          <View className="rounded-full bg-[#10B981]/10 px-2.5 py-1">
            <Text className="text-[11px] font-medium text-[#10B981]">
              {t('merchant.open')}
            </Text>
          </View>
        ) : (
          <View className="rounded-full bg-gray-100 px-2.5 py-1">
            <Text className="text-[11px] font-medium text-gray-400">
              {t('merchant.closed')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
