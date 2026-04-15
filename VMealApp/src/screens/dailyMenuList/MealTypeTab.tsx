import { View, Text, Pressable } from 'react-native';
import { colors, typography, spacing } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';

interface MealTypeTabProps {
  active: string;
  onTabChange?: (key: string) => void;
}

export function MealTypeTab({ active, onTabChange }: MealTypeTabProps) {
  const { t } = useTranslation();

  const MEAL_TYPES = [
    { key: 'morning', label: t('dailyMenu.morning') },
    { key: 'lunch', label: t('dailyMenu.lunch') },
    { key: 'dinner', label: t('dailyMenu.dinner') },
  ];

  return (
    <View className="flex-row" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      {MEAL_TYPES.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange?.(tab.key)}
            className="flex-1 items-center"
            style={{
              paddingVertical: spacing.elementGap,
              borderBottomWidth: isActive ? 2 : 0,
              borderBottomColor: isActive ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                ...typography.body,
                fontWeight: '500',
                color: isActive ? colors.primary : colors.textTertiary,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
