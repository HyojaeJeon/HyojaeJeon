import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { formatVnd } from '@shared/utils/format';
import type { MockMenuItem } from '@shared/mock/types';

const ITEM_COLORS = [
  'bg-amber-100',
  'bg-rose-100',
  'bg-emerald-100',
  'bg-violet-100',
  'bg-blue-100',
];

interface MenuHighlightsProps {
  items: MockMenuItem[];
}

export function MenuHighlights({ items }: MenuHighlightsProps) {
  const { t } = useTranslation();
  const popular = items.filter((item) => item.isPopular);

  return (
    <View style={{ paddingHorizontal: spacing.screenHorizontal, gap: spacing.elementGap }}>
      <Text style={typography.sectionTitle}>{t('merchant.popularItems')}</Text>

      <View style={{ gap: spacing.sm }}>
        {popular.map((item, i) => (
          <View
            key={item.id}
            className="flex-row items-center"
            style={{
              gap: spacing.elementGap,
              borderRadius: radius.md,
              backgroundColor: colors.bgCard,
              padding: spacing.elementGap,
              ...shadows.card,
            }}
          >
            {/* Color placeholder */}
            <View
              className={`flex shrink-0 items-center justify-center ${ITEM_COLORS[i % ITEM_COLORS.length]}`}
              style={{ height: 48, width: 48, borderRadius: radius.sm }}
            >
              <Text style={{ fontSize: 18 }}>
                {item.category === 'Khai vi' ? '\u{1F960}' : '\u{1F35C}'}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1 min-w-0">
              <Text style={typography.cardTitle} numberOfLines={1}>
                {item.nameVi}
              </Text>
              <Text style={{ ...typography.caption, marginTop: 2 }} numberOfLines={1}>
                {item.descriptionVi}
              </Text>
            </View>

            {/* Price */}
            <Text className="shrink-0" style={{ ...typography.cardTitle, fontWeight: '600' }}>
              {formatVnd(item.priceVnd)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
