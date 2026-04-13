import { View, Text, Pressable, ScrollView } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MOCK_MENU_COMTAM } from '@shared/mock/mockData';
import { AppHeader } from '@shared/ui/AppHeader';
import { MealTypeTab } from './MealTypeTab';
import { DailyMenuCard } from './DailyMenuCard';

export default function DailyMenuListScreen() {
  const { t } = useTranslation();
  const comtamItems = MOCK_MENU_COMTAM.slice(0, 3);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader
        title={t('dailyMenu.title')}
        right={
          <Pressable className="flex h-[44px] w-[44px] items-center justify-center rounded-full">
            <Bell size={20} color="#111827" />
          </Pressable>
        }
      />

      <ScrollView>
        {/* Date display */}
        <View className="flex-row items-center gap-2 px-5 pt-3">
          <Text className="text-sm text-gray-400">Thu Bay, 12/04/2026</Text>
          <View className="rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5">
            <Text className="text-[11px] font-medium text-[#3B82F6]">
              {t('common.today')}
            </Text>
          </View>
        </View>

        {/* Meal type tabs */}
        <View className="mt-3 px-5">
          <MealTypeTab active="lunch" />
        </View>

        {/* Daily menu cards */}
        <View className="px-5 pt-4 pb-6 gap-4">
          {/* Card 1: Canteen TechCorp */}
          <DailyMenuCard
            brandInitial="CT"
            brandColor="bg-blue-500"
            brandName="Canteen TechCorp"
            distance="0 km"
            items={[
              { name: 'Com suon nuong', price: 35_000 },
              { name: 'Pho ga', price: 30_000 },
              { name: 'Bun bo Hue', price: 35_000 },
            ]}
            subscribed={false}
          />

          {/* Card 2: Pho 24 */}
          <DailyMenuCard
            brandInitial="P"
            brandColor="bg-amber-500"
            brandName="Pho 24 - Nguyen Hue"
            distance="0.3 km"
            badge={t('dailyMenu.dailySpecial')}
            items={[
              { name: 'Pho Bo Dac Biet', price: 75_000, originalPrice: 85_000 },
              { name: 'Combo Pho + Goi Cuon', price: 85_000 },
            ]}
            subscribed={true}
          />

          {/* Card 3: Com Tam Ba Nam */}
          <DailyMenuCard
            brandInitial="C"
            brandColor="bg-emerald-500"
            brandName="Com Tam Ba Nam"
            distance="0.5 km"
            items={comtamItems.map((item) => ({
              name: item.nameVi,
              price: item.priceVnd,
            }))}
            subscribed={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
