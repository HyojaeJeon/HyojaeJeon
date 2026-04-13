import { View, Text } from 'react-native';
import { Star, MapPin, Clock, Phone, Navigation } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { MockMerchant } from '@shared/mock/types';

interface InfoSectionProps {
  merchant: MockMerchant;
}

export function InfoSection({ merchant }: InfoSectionProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 px-5 pt-4">
      {/* Name */}
      <Text className="text-xl font-bold text-gray-900">{merchant.branchName}</Text>

      {/* Rating row */}
      <View className="flex-row items-center gap-1.5">
        <Star size={14} color="#F59E0B" fill="#F59E0B" />
        <Text className="text-sm font-medium text-gray-900">{merchant.rating}</Text>
        <Text className="text-sm text-gray-400">
          ({merchant.reviewCount} {t('merchant.rating')})
        </Text>
        <Text className="text-sm text-gray-300">{'\u00B7'}</Text>
        <Text className="text-sm text-gray-600">{merchant.cuisineType}</Text>
      </View>

      {/* Address */}
      <View className="flex-row items-start gap-2.5">
        <View className="mt-0.5 shrink-0">
          <MapPin size={16} color="#9CA3AF" />
        </View>
        <Text className="text-sm text-gray-600">{merchant.address}</Text>
      </View>

      {/* Hours */}
      <View className="flex-row items-center gap-2.5">
        <View className="shrink-0">
          <Clock size={16} color="#9CA3AF" />
        </View>
        <Text className="text-sm text-gray-600">{merchant.operatingHours}</Text>
        {merchant.isOpen ? (
          <View className="rounded-full bg-[#10B981]/10 px-2 py-0.5">
            <Text className="text-[11px] font-medium text-[#10B981]">
              {t('merchant.open')}
            </Text>
          </View>
        ) : (
          <View className="rounded-full bg-gray-100 px-2 py-0.5">
            <Text className="text-[11px] font-medium text-gray-400">
              {t('merchant.closed')}
            </Text>
          </View>
        )}
      </View>

      {/* Phone */}
      <View className="flex-row items-center gap-2.5">
        <View className="shrink-0">
          <Phone size={16} color="#9CA3AF" />
        </View>
        <Text className="text-sm text-gray-600">{merchant.phone}</Text>
      </View>

      {/* Distance */}
      <View className="flex-row items-center gap-2.5">
        <View className="shrink-0">
          <Navigation size={16} color="#9CA3AF" />
        </View>
        <Text className="text-sm text-gray-600">{merchant.distanceKm} km</Text>
      </View>
    </View>
  );
}
