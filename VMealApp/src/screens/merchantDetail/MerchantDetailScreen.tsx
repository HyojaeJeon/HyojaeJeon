import { View, Text, ScrollView, Linking, Platform } from 'react-native';
import { Navigation, ShoppingBag } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { PrimaryButton } from '@shared/ui';
import { colors, typography, spacing } from '@shared/ui/tokens';
import { PhotoHeader } from './PhotoHeader';
import { InfoSection } from './InfoSection';
import { PolicySection } from './PolicySection';
import { MenuHighlights } from './MenuHighlights';
import { useMerchantDetailData } from './useMerchantDetailData';

/* Congestion data (fake) */
const CONGESTION = [
  { hour: '11:00', pct: 30, peak: false },
  { hour: '12:00', pct: 85, peak: true },
  { hour: '13:00', pct: 60, peak: false },
  { hour: '14:00', pct: 20, peak: false },
];

export default function MerchantDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MerchantDetailScreen'>>();
  // TODO: enrollmentId 를 사용하여 가맹점 데이터를 조회할 것
  const { enrollmentId: _enrollmentId } = route.params ?? {};
  void _enrollmentId;

  // TODO: brandHqId / corporateId 를 route params 에서 받아올 것
  const { merchant, policy, menuItems, loading } = useMerchantDetailData(
    'brand-hq-001',
    'corp-001',
  );

  if (loading || !merchant) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={typography.body}>{loading ? '' : t('merchant.notFound', { defaultValue: 'Merchant not found' })}</Text>
      </View>
    );
  }

  const handleNavigate = () => {
    const { latitude, longitude } = merchant;
    const label = encodeURIComponent(merchant.branchName);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        );
      });
    }
  };

  const handleOrder = () => {
    navigation.navigate('OrderScreen', {
      merchantId: merchant.id,
      branchId: merchant.id,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView className="flex-1" bounces contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Photo */}
        <PhotoHeader merchant={merchant} />

        {/* Info */}
        <InfoSection merchant={merchant} />

        {/* Divider */}
        <View style={{ marginVertical: spacing.lg, height: 8, backgroundColor: colors.border }} />

        {/* Policy */}
        {policy && <PolicySection policy={policy} />}

        {/* Divider */}
        <View style={{ marginVertical: spacing.lg, height: 8, backgroundColor: colors.border }} />

        {/* Menu highlights */}
        <MenuHighlights items={menuItems} />

        {/* Divider */}
        <View style={{ marginVertical: spacing.lg, height: 8, backgroundColor: colors.border }} />

        {/* Congestion */}
        <View style={{ paddingHorizontal: spacing.screenHorizontal, gap: spacing.elementGap }}>
          <Text style={typography.sectionTitle}>{t('merchant.congestion')}</Text>

          <View className="flex-row items-end justify-between" style={{ gap: spacing.elementGap, height: 100, paddingHorizontal: spacing.sm }}>
            {CONGESTION.map((c) => (
              <View key={c.hour} className="flex-1 items-center" style={{ gap: 6 }}>
                <View className="relative w-full items-center justify-end h-[72px]">
                  {c.peak && (
                    <Text style={{ marginBottom: 4, fontSize: 9, fontWeight: '500', color: colors.danger }}>
                      {t('merchant.busiest')}
                    </Text>
                  )}
                  <View
                    className="w-full max-w-[40px] rounded-t-md"
                    style={{
                      height: `${c.pct}%`,
                      backgroundColor: c.peak ? colors.danger : `${colors.primary}99`,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 10, color: colors.textTertiary }}>{c.hour}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar (sticky) */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row"
        style={{
          backgroundColor: colors.bgWhite,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.screenHorizontal,
          paddingVertical: spacing.elementGap,
          gap: spacing.elementGap,
        }}
      >
        <PrimaryButton
          title={t('merchant.navigate')}
          variant="outline"
          onPress={handleNavigate}
          icon={<Navigation size={16} color="#374151" />}
          className="flex-1"
        />
        <PrimaryButton
          title={t('order.orderBtn')}
          variant="primary"
          onPress={handleOrder}
          icon={<ShoppingBag size={16} color={colors.textInverse} />}
          className="flex-[2]"
          size="lg"
        />
      </View>
    </View>
  );
}
