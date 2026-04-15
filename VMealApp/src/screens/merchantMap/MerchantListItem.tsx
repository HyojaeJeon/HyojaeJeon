import { View, Text, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/utils/format';
import type { MockMerchant } from '@shared/mock/types';
import { Card } from '@shared/ui';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';

const BRAND_COLORS = [
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

interface MerchantListItemProps {
  merchant: MockMerchant;
  index: number;
  onPress?: (merchant: MockMerchant) => void;
}

export function MerchantListItem({ merchant, index, onPress }: MerchantListItemProps) {
  const { t } = useTranslation();
  const initial = merchant.brandName.charAt(0);
  const colorClass = BRAND_COLORS[index % BRAND_COLORS.length];

  return (
    <Pressable onPress={() => onPress?.(merchant)} className="active:opacity-80">
      <Card
        className={`${!merchant.isOpen ? 'opacity-60' : ''}`}
        style={{ padding: spacing.cardPaddingCompact }}
      >
        <View className="flex-row items-center" style={{ gap: spacing.md }}>
          {/* Brand circle */}
          <View
            className={`flex shrink-0 items-center justify-center ${colorClass}`}
            style={{
              height: components.avatar.md.size,
              width: components.avatar.md.size,
              borderRadius: radius.full,
            }}
          >
            <Text style={{ color: colors.textInverse, fontWeight: '700', fontSize: components.avatar.md.fontSize }}>{initial}</Text>
          </View>

          {/* Info */}
          <View className="min-w-0 flex-1">
            <Text style={typography.cardTitle} numberOfLines={1}>
              {merchant.brandName}
            </Text>
            <Text style={{ ...typography.caption, marginTop: 2 }} numberOfLines={1}>
              {merchant.address}
            </Text>
            <View className="flex-row items-center" style={{ marginTop: 4, gap: 4 }}>
              <Star size={12} color={colors.warning} fill={colors.warning} />
              <Text style={{ ...typography.caption, color: colors.textSecondary }}>{merchant.rating}</Text>
              <Text style={typography.caption}>({merchant.reviewCount})</Text>
              <Text style={typography.caption}>{'\u00B7'}</Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary }}>{merchant.distanceKm} km</Text>
              <Text style={typography.caption}>{'\u00B7'}</Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary }}>{formatVnd(merchant.avgPriceVnd)}</Text>
            </View>
          </View>

          {/* Status badge */}
          <View className="shrink-0">
            {merchant.isOpen ? (
              <View style={{ borderRadius: radius.full, backgroundColor: colors.successLight, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '500', color: colors.success }}>
                  {t('merchant.open')}
                </Text>
              </View>
            ) : (
              <View style={{ borderRadius: radius.full, backgroundColor: colors.bgInput, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textTertiary }}>
                  {t('merchant.closed')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
