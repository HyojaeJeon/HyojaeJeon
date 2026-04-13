import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronRight, Star, MapPin, UtensilsCrossed } from 'lucide-react-native';
import { MOCK_MERCHANTS } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

/** Color palette for merchant card placeholders */
const CARD_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#6366F1'];

export function NearbyMerchants() {
  const { t } = useTranslation();
  const merchants = MOCK_MERCHANTS.slice(0, 4);

  return (
    <View>
      {/* Section header */}
      <View className="flex flex-row items-center justify-between">
        <Text className="text-[15px] font-semibold text-gray-900">
          {t('wallet.nearbyMerchants')}
        </Text>
        <Pressable className="flex flex-row items-center gap-0.5">
          <Text className="text-xs font-medium text-[#3B82F6]">
            {t('wallet.map')}
          </Text>
          <ChevronRight size={14} color="#3B82F6" />
        </Pressable>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 -mx-5 px-5"
        contentContainerClassName="gap-3 pr-5"
      >
        {merchants.map((m, i) => (
          <View
            key={m.id}
            className="w-[140px] rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
          >
            {/* Image placeholder */}
            <View
              className="flex h-[80px] items-center justify-center"
              style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] + '18' }}
            >
              <UtensilsCrossed
                size={28}
                color={CARD_COLORS[i % CARD_COLORS.length]}
                opacity={0.6}
              />
            </View>

            {/* Info */}
            <View className="p-2.5">
              <Text className="text-xs font-semibold text-gray-900" numberOfLines={1}>
                {m.brandName}
              </Text>
              <View className="mt-1 flex flex-row items-center gap-2">
                <View className="flex flex-row items-center gap-0.5">
                  <MapPin size={10} color="#9CA3AF" />
                  <Text className="text-[10px] text-gray-400">
                    {m.distanceKm === 0 ? 'T\u1EA1i ch\u1ED7' : `${m.distanceKm}km`}
                  </Text>
                </View>
                <View className="flex flex-row items-center gap-0.5">
                  <Star size={10} color="#FBBF24" />
                  <Text className="text-[10px] text-gray-600 font-medium">
                    {m.rating}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
