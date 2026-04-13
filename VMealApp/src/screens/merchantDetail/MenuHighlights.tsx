import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/mock/mockData';
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
    <View className="px-5 gap-3">
      <Text className="text-base font-semibold text-gray-900">{t('merchant.popularItems')}</Text>

      <View className="gap-2">
        {popular.map((item, i) => (
          <View
            key={item.id}
            className="flex-row items-center gap-3 rounded-xl bg-white p-3 border border-gray-100 shadow-sm"
          >
            {/* Color placeholder */}
            <View
              className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-lg ${ITEM_COLORS[i % ITEM_COLORS.length]}`}
            >
              <Text className="text-lg">
                {item.category === 'Khai vi' ? '\u{1F960}' : '\u{1F35C}'}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                {item.nameVi}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                {item.descriptionVi}
              </Text>
            </View>

            {/* Price */}
            <Text className="shrink-0 text-sm font-semibold text-gray-900">
              {formatVnd(item.priceVnd)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
