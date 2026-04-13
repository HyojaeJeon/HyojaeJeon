import { View, Text, Pressable, ScrollView } from 'react-native';
import { Navigation, ShoppingBag } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MOCK_MERCHANTS, MOCK_MENU_PHO24, MOCK_POLICIES } from '@shared/mock/mockData';
import { PhotoHeader } from './PhotoHeader';
import { InfoSection } from './InfoSection';
import { PolicySection } from './PolicySection';
import { MenuHighlights } from './MenuHighlights';

/* Congestion data (fake) */
const CONGESTION = [
  { hour: '11:00', pct: 30, peak: false },
  { hour: '12:00', pct: 85, peak: true },
  { hour: '13:00', pct: 60, peak: false },
  { hour: '14:00', pct: 20, peak: false },
];

export default function MerchantDetailScreen() {
  const { t } = useTranslation();
  const merchant = MOCK_MERCHANTS[0]; // Pho 24
  const policy = MOCK_POLICIES[0]; // Lunch policy

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Photo */}
        <PhotoHeader merchant={merchant} />

        {/* Info */}
        <InfoSection merchant={merchant} />

        {/* Divider */}
        <View className="my-4 h-2 bg-gray-50" />

        {/* Policy */}
        <PolicySection policy={policy} />

        {/* Divider */}
        <View className="my-4 h-2 bg-gray-50" />

        {/* Menu highlights */}
        <MenuHighlights items={MOCK_MENU_PHO24} />

        {/* Divider */}
        <View className="my-4 h-2 bg-gray-50" />

        {/* Congestion */}
        <View className="px-5 gap-3">
          <Text className="text-base font-semibold text-gray-900">{t('merchant.congestion')}</Text>

          <View className="flex-row items-end justify-between gap-3 h-[100px] px-2">
            {CONGESTION.map((c) => (
              <View key={c.hour} className="flex-1 items-center gap-1.5">
                <View className="relative w-full items-center justify-end h-[72px]">
                  {c.peak && (
                    <Text className="mb-1 text-[9px] font-medium text-[#EF4444]">
                      {t('merchant.busiest')}
                    </Text>
                  )}
                  <View
                    className={`w-full max-w-[40px] rounded-t-md ${
                      c.peak ? 'bg-[#EF4444]' : 'bg-[#3B82F6]/60'
                    }`}
                    style={{ height: `${c.pct}%` }}
                  />
                </View>
                <Text className="text-[10px] text-gray-400">{c.hour}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar (sticky) */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex-row gap-3">
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 h-[48px] rounded-xl border border-gray-200 bg-white">
          <Navigation size={16} color="#374151" />
          <Text className="text-sm font-semibold text-gray-700">{t('merchant.navigate')}</Text>
        </Pressable>
        <Pressable className="flex-[2] flex-row items-center justify-center gap-2 h-[48px] rounded-xl bg-[#3B82F6]">
          <ShoppingBag size={16} color="#ffffff" />
          <Text className="text-sm font-semibold text-white">{t('order.orderBtn')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
