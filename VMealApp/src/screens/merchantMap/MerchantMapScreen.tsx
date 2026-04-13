import { View, Text, Pressable, ScrollView } from 'react-native';
import { List, Map } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MOCK_MERCHANTS } from '@shared/mock/mockData';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { MerchantListItem } from './MerchantListItem';

export default function MerchantMapScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView className="bg-[#F8FAFC]">
      <View className="px-5 pt-2 pb-6 gap-4">
        {/* Greeting */}
        <View>
          <Text className="text-lg font-semibold text-gray-900">Xin chao, Tuan</Text>
          <Text className="text-sm text-gray-400">{t('merchant.whatToEat')}</Text>
        </View>

        {/* Search */}
        <SearchBar />

        {/* Filter chips + view toggle */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 overflow-hidden">
              <FilterChips />
            </View>
            {/* View toggle */}
            <View className="ml-3 flex-row shrink-0 items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
              <Pressable className="flex-row items-center gap-1 px-3 py-1.5 bg-[#3B82F6]">
                <List size={12} color="#ffffff" />
                <Text className="text-xs font-medium text-white">{t('merchant.listView')}</Text>
              </Pressable>
              <Pressable className="flex-row items-center gap-1 px-3 py-1.5">
                <Map size={12} color="#9CA3AF" />
                <Text className="text-xs font-medium text-gray-400">{t('merchant.mapView')}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Map placeholder */}
        <View className="relative h-[200px] w-full rounded-2xl bg-[#E8F4FD] overflow-hidden">
          {/* Fake street grid lines */}
          <View className="absolute inset-0 opacity-20">
            <View className="absolute left-[20%] top-0 h-full w-px bg-gray-400" />
            <View className="absolute left-[50%] top-0 h-full w-px bg-gray-400" />
            <View className="absolute left-[75%] top-0 h-full w-px bg-gray-400" />
            <View className="absolute top-[30%] left-0 w-full h-px bg-gray-400" />
            <View className="absolute top-[60%] left-0 w-full h-px bg-gray-400" />
          </View>
          {/* Pin markers */}
          <View className="absolute left-[30%] top-[25%] h-3 w-3 rounded-full bg-[#3B82F6]" />
          <View className="absolute left-[55%] top-[40%] h-3 w-3 rounded-full bg-[#10B981]" />
          <View className="absolute left-[40%] top-[65%] h-3 w-3 rounded-full bg-[#F59E0B]" />
          <View className="absolute left-[70%] top-[50%] h-3 w-3 rounded-full bg-[#EF4444]" />
          {/* Current location marker */}
          <View className="absolute left-[45%] top-[45%] h-4 w-4 rounded-full bg-[#3B82F6] border-2 border-white" />
          {/* Attribution */}
          <Text className="absolute bottom-2 right-3 text-[9px] text-gray-400">
            Google Maps
          </Text>
        </View>

        {/* Merchant list header */}
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-gray-900">{t('merchant.nearby')}</Text>
          <View className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5">
            <Text className="text-xs font-medium text-[#3B82F6]">
              ({MOCK_MERCHANTS.length})
            </Text>
          </View>
        </View>

        {/* Merchant list */}
        <View className="gap-3">
          {MOCK_MERCHANTS.map((merchant, i) => (
            <MerchantListItem key={merchant.id} merchant={merchant} index={i} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
