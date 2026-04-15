import { View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/utils/format';

interface DailyMenuItem {
  name: string;
  price: number;
  originalPrice?: number;
}

interface DailyMenuCardProps {
  brandInitial: string;
  brandColor: string;
  brandName: string;
  distance: string;
  badge?: string;
  items: DailyMenuItem[];
  subscribed: boolean;
  onSubscribeToggle?: () => void;
  onItemPress?: () => void;
}

export function DailyMenuCard({
  brandInitial,
  brandColor,
  brandName,
  distance,
  badge,
  items,
  subscribed,
  onSubscribeToggle,
  onItemPress,
}: DailyMenuCardProps) {
  const { t } = useTranslation();

  return (
    <View style={{ borderRadius: radius.xl, backgroundColor: colors.bgCard, padding: spacing.cardPaddingCompact, gap: spacing.elementGap, ...shadows.card }}>
      {/* Header */}
      <View className="flex-row items-center" style={{ gap: spacing.elementGap }}>
        <View
          className={`flex shrink-0 items-center justify-center rounded-full ${brandColor}`}
          style={{ height: components.avatar.sm.size, width: components.avatar.sm.size }}
        >
          <Text style={{ color: colors.textInverse, fontWeight: '700', fontSize: components.avatar.sm.fontSize }}>{brandInitial}</Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text style={typography.cardTitle} numberOfLines={1}>
            {brandName}
          </Text>
        </View>
        <Text className="shrink-0" style={typography.caption}>{distance}</Text>
      </View>

      {/* Special badge */}
      {badge && (
        <View style={{ alignSelf: 'flex-start', borderRadius: radius.full, backgroundColor: colors.warningLight, paddingHorizontal: spacing.elementGap, paddingVertical: spacing.xs }}>
          <Text style={{ ...typography.caption, fontWeight: '500', color: colors.warning }}>{badge}</Text>
        </View>
      )}

      {/* Menu items */}
      <View style={{ gap: spacing.sm }}>
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={onItemPress}
            className="flex-row items-center justify-between active:opacity-70"
          >
            <Text style={typography.body}>{item.name}</Text>
            <View className="flex-row items-center" style={{ gap: spacing.sm }}>
              {item.originalPrice && (
                <Text style={{ ...typography.caption, textDecorationLine: 'line-through', color: colors.textPlaceholder }}>
                  {formatVnd(item.originalPrice)}
                </Text>
              )}
              <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>
                {formatVnd(item.price)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Subscribe / Subscribed */}
      <View style={{ paddingTop: spacing.xs }}>
        {subscribed ? (
          <Pressable onPress={onSubscribeToggle} className="flex-row items-center" style={{ gap: 6 }}>
            <View className="flex items-center justify-center" style={{ height: 18, width: 18, borderRadius: 9, backgroundColor: colors.success }}>
              <Check size={11} color={colors.textInverse} />
            </View>
            <Text style={{ ...typography.caption, fontWeight: '500', color: colors.success }}>{t('dailyMenu.subscribed')}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onSubscribeToggle}>
            <Text style={{ ...typography.caption, fontWeight: '500', color: colors.primary }}>
              {t('dailyMenu.subscribe')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
