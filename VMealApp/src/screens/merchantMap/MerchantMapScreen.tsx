import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { List, Map } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import type { MockMerchant } from '@shared/mock/types';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { MerchantListItem } from './MerchantListItem';
import { useMerchantMapData } from './useMerchantMapData';

type ViewMode = 'list' | 'map';

export default function MerchantMapScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { merchants } = useMerchantMapData();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleMerchantPress = (merchant: MockMerchant) => {
    navigation.navigate('MerchantDetailScreen', { enrollmentId: merchant.id });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} bounces>
      <View style={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: 8, paddingBottom: 24, gap: spacing.sectionGap }}>
        {/* Greeting */}
        <View>
          <Text style={typography.screenTitle}>{t('wallet.greeting')} Tuan</Text>
          <Text style={{ ...typography.caption, marginTop: spacing.xs }}>{t('merchant.whatToEat')}</Text>
        </View>

        {/* Search */}
        <SearchBar />

        {/* Filter chips + view toggle */}
        <View style={{ gap: spacing.md }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 overflow-hidden">
              <FilterChips />
            </View>
            {/* View toggle */}
            <View
              className="flex-row shrink-0 items-center overflow-hidden"
              style={{ marginLeft: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite }}
            >
              <Pressable
                onPress={() => setViewMode('list')}
                className="flex-row items-center"
                style={{ gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: viewMode === 'list' ? colors.primary : 'transparent' }}
              >
                <List size={12} color={viewMode === 'list' ? colors.textInverse : colors.textTertiary} />
                <Text
                  style={{
                    ...typography.caption,
                    fontWeight: '500',
                    color: viewMode === 'list' ? colors.textInverse : colors.textTertiary,
                  }}
                >
                  {t('merchant.listView')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode('map')}
                className="flex-row items-center"
                style={{ gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: viewMode === 'map' ? colors.primary : 'transparent' }}
              >
                <Map size={12} color={viewMode === 'map' ? colors.textInverse : colors.textTertiary} />
                <Text
                  style={{
                    ...typography.caption,
                    fontWeight: '500',
                    color: viewMode === 'map' ? colors.textInverse : colors.textTertiary,
                  }}
                >
                  {t('merchant.mapView')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Map placeholder */}
        <View className="relative overflow-hidden" style={{ height: 200, width: '100%', borderRadius: radius.xl, backgroundColor: '#E8F4FD' }}>
          {/* Fake street grid lines */}
          <View className="absolute inset-0 opacity-20">
            <View className="absolute left-[20%] top-0 h-full w-px" style={{ backgroundColor: colors.textTertiary }} />
            <View className="absolute left-[50%] top-0 h-full w-px" style={{ backgroundColor: colors.textTertiary }} />
            <View className="absolute left-[75%] top-0 h-full w-px" style={{ backgroundColor: colors.textTertiary }} />
            <View className="absolute top-[30%] left-0 w-full h-px" style={{ backgroundColor: colors.textTertiary }} />
            <View className="absolute top-[60%] left-0 w-full h-px" style={{ backgroundColor: colors.textTertiary }} />
          </View>
          {/* Pin markers */}
          <View className="absolute left-[30%] top-[25%]" style={{ height: 12, width: 12, borderRadius: radius.full, backgroundColor: colors.primary }} />
          <View className="absolute left-[55%] top-[40%]" style={{ height: 12, width: 12, borderRadius: radius.full, backgroundColor: colors.success }} />
          <View className="absolute left-[40%] top-[65%]" style={{ height: 12, width: 12, borderRadius: radius.full, backgroundColor: colors.warning }} />
          <View className="absolute left-[70%] top-[50%]" style={{ height: 12, width: 12, borderRadius: radius.full, backgroundColor: colors.danger }} />
          {/* Current location marker */}
          <View className="absolute left-[45%] top-[45%]" style={{ height: 16, width: 16, borderRadius: radius.full, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.bgWhite }} />
          {/* Attribution */}
          <Text className="absolute bottom-2 right-3" style={{ fontSize: 9, color: colors.textTertiary }}>
            Google Maps
          </Text>
        </View>

        {/* Merchant list header */}
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <Text style={typography.sectionTitle}>{t('merchant.nearby')}</Text>
          <View style={{ borderRadius: radius.full, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ ...typography.caption, color: colors.primary, fontWeight: '500' }}>
              ({merchants.length})
            </Text>
          </View>
        </View>

        {/* Merchant list */}
        <View style={{ gap: spacing.md }}>
          {merchants.length === 0 ? (
            <View className="items-center" style={{ paddingVertical: spacing.sectionGap }}>
              <Text style={typography.body}>{t('merchant.empty', { defaultValue: 'No merchants nearby' })}</Text>
            </View>
          ) : (
            merchants.map((merchant: MockMerchant, i: number) => (
              <MerchantListItem
                key={merchant.id}
                merchant={merchant}
                index={i}
                onPress={handleMerchantPress}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
