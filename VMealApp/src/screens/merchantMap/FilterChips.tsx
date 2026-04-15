import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius } from '@shared/ui/tokens';

interface FilterChipsProps {
  onFilterChange?: (activeLabels: string[]) => void;
}

export function FilterChips({ onFilterChange }: FilterChipsProps) {
  const { t } = useTranslation();

  const FILTER_OPTIONS = [
    t('merchant.open'),
    '< 1km',
    'Viet Nam',
    'Han Quoc',
    'Nhat Ban',
    'Canteen',
  ];

  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set([FILTER_OPTIONS[0]]),
  );

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      onFilterChange?.(Array.from(next));
      return next;
    });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 4 }}>
      <View className="flex-row" style={{ gap: 8 }}>
        {FILTER_OPTIONS.map((label) => {
          const isActive = activeFilters.has(label);
          return (
            <Pressable
              key={label}
              onPress={() => toggleFilter(label)}
              className="flex-row shrink-0 items-center"
              style={{
                height: 36,
                borderRadius: radius.full,
                paddingHorizontal: 16,
                gap: 6,
                backgroundColor: isActive ? colors.primary : colors.bgWhite,
                borderWidth: isActive ? 0 : 1,
                borderColor: isActive ? undefined : colors.border,
              }}
            >
              {isActive && <Check size={14} color={colors.textInverse} />}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: isActive ? colors.textInverse : colors.textSecondary,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
