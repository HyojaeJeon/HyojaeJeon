import { View, Text } from 'react-native';
import { Star, MapPin, Clock, Phone, Navigation } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '@shared/ui/tokens';
import type { MockMerchant } from '@shared/mock/types';

interface InfoSectionProps {
  merchant: MockMerchant;
}

export function InfoSection({ merchant }: InfoSectionProps) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: spacing.elementGap, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg }}>
      {/* Name */}
      <Text style={typography.sectionTitle}>{merchant.branchName}</Text>

      {/* Rating row */}
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Star size={14} color={colors.warning} fill={colors.warning} />
        <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>{merchant.rating}</Text>
        <Text style={typography.body}>
          ({merchant.reviewCount} {t('merchant.rating')})
        </Text>
        <Text style={{ ...typography.body, color: colors.textPlaceholder }}>{'\u00B7'}</Text>
        <Text style={typography.body}>{merchant.cuisineType}</Text>
      </View>

      {/* Address */}
      <View className="flex-row items-start" style={{ gap: spacing.itemGap }}>
        <View className="mt-0.5 shrink-0">
          <MapPin size={16} color={colors.textTertiary} />
        </View>
        <Text style={typography.body}>{merchant.address}</Text>
      </View>

      {/* Hours */}
      <View className="flex-row items-center" style={{ gap: spacing.itemGap }}>
        <View className="shrink-0">
          <Clock size={16} color={colors.textTertiary} />
        </View>
        <Text style={typography.body}>{merchant.operatingHours}</Text>
        {merchant.isOpen ? (
          <View style={{ borderRadius: 9999, backgroundColor: colors.successLight, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: colors.success }}>
              {t('merchant.open')}
            </Text>
          </View>
        ) : (
          <View style={{ borderRadius: 9999, backgroundColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textTertiary }}>
              {t('merchant.closed')}
            </Text>
          </View>
        )}
      </View>

      {/* Phone */}
      <View className="flex-row items-center" style={{ gap: spacing.itemGap }}>
        <View className="shrink-0">
          <Phone size={16} color={colors.textTertiary} />
        </View>
        <Text style={typography.body}>{merchant.phone}</Text>
      </View>

      {/* Distance */}
      <View className="flex-row items-center" style={{ gap: spacing.itemGap }}>
        <View className="shrink-0">
          <Navigation size={16} color={colors.textTertiary} />
        </View>
        <Text style={typography.body}>{merchant.distanceKm} km</Text>
      </View>
    </View>
  );
}
