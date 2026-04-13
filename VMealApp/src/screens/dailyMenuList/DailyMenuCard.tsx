import { View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/mock/mockData';

interface DailyMenuItem {
  name: string;
  price: number;
  originalPrice?: number;
}

interface DailyMenuCardProps {
  brandInitial: string;
  brandColor: string;
  brandName: string;
  distance: string;
  badge?: string;
  items: DailyMenuItem[];
  subscribed: boolean;
}

export function DailyMenuCard({
  brandInitial,
  brandColor,
  brandName,
  distance,
  badge,
  items,
  subscribed,
}: DailyMenuCardProps) {
  const { t } = useTranslation();

  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm gap-3">
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <View
          className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full ${brandColor}`}
        >
          <Text className="text-white font-bold text-sm">{brandInitial}</Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
            {brandName}
          </Text>
        </View>
        <Text className="text-xs text-gray-400 shrink-0">{distance}</Text>
      </View>

      {/* Special badge */}
      {badge && (
        <View className="self-start rounded-full bg-[#F59E0B]/10 px-3 py-1">
          <Text className="text-xs font-medium text-[#F59E0B]">{badge}</Text>
        </View>
      )}

      {/* Menu items */}
      <View className="gap-2">
        {items.map((item, i) => (
          <View key={i} className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">{item.name}</Text>
            <View className="flex-row items-center gap-2">
              {item.originalPrice && (
                <Text className="text-xs text-gray-300 line-through">
                  {formatVnd(item.originalPrice)}
                </Text>
              )}
              <Text className="text-sm font-medium text-gray-900">
                {formatVnd(item.price)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Subscribe / Subscribed */}
      <View className="pt-1">
        {subscribed ? (
          <View className="flex-row items-center gap-1.5">
            <View className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#10B981]">
              <Check size={11} color="#ffffff" />
            </View>
            <Text className="text-xs font-medium text-[#10B981]">{t('dailyMenu.subscribed')}</Text>
          </View>
        ) : (
          <Pressable>
            <Text className="text-xs font-medium text-[#3B82F6]">
              {t('dailyMenu.subscribe')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
