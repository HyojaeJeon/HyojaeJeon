import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export function FilterChips() {
  const { t } = useTranslation();

  const FILTERS = [
    { label: t('merchant.open'), active: true },
    { label: '< 1km', active: false },
    { label: 'Viet Nam', active: false },
    { label: 'Han Quoc', active: false },
    { label: 'Nhat Ban', active: false },
    { label: 'Canteen', active: false },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
      <View className="flex-row gap-2">
        {FILTERS.map((f) => (
          <Pressable
            key={f.label}
            className={`flex-row shrink-0 items-center gap-1.5 rounded-full px-4 py-2 ${
              f.active
                ? 'bg-[#3B82F6]'
                : 'border border-gray-200 bg-white'
            }`}
          >
            {f.active && <Check size={14} color="#ffffff" />}
            <Text
              className={`text-sm font-medium ${
                f.active ? 'text-white' : 'text-gray-600'
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
