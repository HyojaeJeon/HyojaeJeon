import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MealTypeTabProps {
  active: string;
}

export function MealTypeTab({ active }: MealTypeTabProps) {
  const { t } = useTranslation();

  const MEAL_TYPES = [
    { key: 'morning', label: t('dailyMenu.morning') },
    { key: 'lunch', label: t('dailyMenu.lunch') },
    { key: 'dinner', label: t('dailyMenu.dinner') },
  ];

  return (
    <View className="flex-row border-b border-gray-100">
      {MEAL_TYPES.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            className={`flex-1 py-3 items-center ${
              isActive ? 'border-b-2 border-[#3B82F6]' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-[#3B82F6]' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
