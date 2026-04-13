import { View, Text, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export function MealSelector() {
  const { t } = useTranslation();

  const MEAL_SLOTS = [
    { key: 'morning', label: t('preOrder.morningSlot'), time: '06:00-09:00', selected: false },
    { key: 'lunch', label: t('preOrder.lunchSlot'), time: '11:00-14:00', selected: true },
    { key: 'dinner', label: t('preOrder.dinnerSlot'), time: '17:00-21:00', selected: false },
  ];

  return (
    <View className="gap-3">
      <Text className="text-base font-semibold text-gray-900">{t('preOrder.selectMeal')}</Text>

      <View className="gap-2">
        {MEAL_SLOTS.map((slot) => (
          <Pressable
            key={slot.key}
            className={`flex-row w-full items-center gap-3 rounded-xl border p-4 ${
              slot.selected
                ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Radio circle */}
            <View
              className={`flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 ${
                slot.selected
                  ? 'border-[#3B82F6]'
                  : 'border-gray-300'
              }`}
            >
              {slot.selected && (
                <View className="h-[10px] w-[10px] rounded-full bg-[#3B82F6]" />
              )}
            </View>

            {/* Label */}
            <View className="flex-1">
              <Text
                className={`text-sm font-medium ${
                  slot.selected ? 'text-[#3B82F6]' : 'text-gray-900'
                }`}
              >
                {slot.label}
              </Text>
            </View>

            {/* Time */}
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#9CA3AF" />
              <Text className="text-xs text-gray-400">{slot.time}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
