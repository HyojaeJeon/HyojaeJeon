import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronRight, Star, MapPin, UtensilsCrossed, Store } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { colors, typography, spacing, shadows, radius } from '@shared/ui/tokens';
import type { MockMerchant } from '@shared/mock/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** Color palette for merchant card placeholders */
const CARD_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

interface NearbyMerchantsProps {
  merchants: MockMerchant[];
}

export function NearbyMerchants({ merchants }: NearbyMerchantsProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View>
      {/* Section header */}
      <View className="flex flex-row items-center justify-between">
        <Text style={typography.sectionTitle}>
          {t('wallet.nearbyMerchants')}
        </Text>
        <Pressable
          className="flex flex-row items-center"
          style={{ gap: spacing.xs }}
          onPress={() => navigation.navigate('Main', { screen: 'MerchantMap' } as never)}
        >
          <Text style={[typography.body, { color: colors.primary, fontWeight: '500' }]}>
            {t('wallet.map')}
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Horizontal scroll */}
      {merchants.length === 0 ? (
        <View style={{ marginTop: spacing.lg, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg }}>
          <Store size={32} color={colors.textTertiary} />
          <Text style={[typography.body, { color: colors.textTertiary }]}>
            {t('wallet.noNearbyMerchants')}
          </Text>
        </View>
      ) : (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.md, marginHorizontal: -spacing.screenHorizontal }}
        contentContainerStyle={{ gap: spacing.md, paddingHorizontal: spacing.screenHorizontal }}
      >
        {merchants.map((m, i) => {
          const accentColor = CARD_COLORS[i % CARD_COLORS.length];

          return (
            <Pressable
              key={m.id}
              onPress={() =>
                navigation.navigate('MerchantDetailScreen', {
                  enrollmentId: m.id,
                })
              }
            >
              <View
                style={{
                  width: 160,
                  borderRadius: radius.lg,
                  backgroundColor: colors.bgCard,
                  overflow: 'hidden',
                  ...shadows.card,
                }}
              >
                {/* Image placeholder */}
                <View
                  className="items-center justify-center"
                  style={{
                    height: 90,
                    backgroundColor: accentColor + '14',
                  }}
                >
                  <UtensilsCrossed size={30} color={accentColor} opacity={0.5} />
                </View>

                {/* Info */}
                <View style={{ padding: spacing.md }}>
                  <Text style={typography.cardTitle} numberOfLines={1}>
                    {m.brandName}
                  </Text>
                  <View className="flex flex-row items-center" style={{ marginTop: spacing.sm, gap: spacing.md }}>
                    <View className="flex flex-row items-center" style={{ gap: spacing.xs }}>
                      <MapPin size={11} color={colors.textTertiary} />
                      <Text style={typography.caption}>
                        {m.distanceKm === 0 ? 'T\u1EA1i ch\u1ED7' : `${m.distanceKm}km`}
                      </Text>
                    </View>
                    <View className="flex flex-row items-center" style={{ gap: spacing.xs }}>
                      <Star size={11} color={colors.warning} />
                      <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {m.rating}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      )}
    </View>
  );
}
