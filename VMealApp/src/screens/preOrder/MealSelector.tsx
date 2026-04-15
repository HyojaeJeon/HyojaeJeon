import { View, Text, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';

interface MealSelectorProps {
  selectedMeal?: string;
  onMealChange?: (key: string) => void;
}

export function MealSelector({ selectedMeal = 'lunch', onMealChange }: MealSelectorProps) {
  const { t } = useTranslation();

  const MEAL_SLOTS = [
    { key: 'morning', label: t('preOrder.morningSlot'), time: '06:00-09:00' },
    { key: 'lunch', label: t('preOrder.lunchSlot'), time: '11:00-14:00' },
    { key: 'dinner', label: t('preOrder.dinnerSlot'), time: '17:00-21:00' },
  ];

  return (
    <View style={{ gap: spacing.elementGap }}>
      <Text style={typography.sectionTitle}>{t('preOrder.selectMeal')}</Text>

      <View style={{ gap: spacing.sm }}>
        {MEAL_SLOTS.map((slot) => {
          const isSelected = slot.key === selectedMeal;
          return (
            <Pressable
              key={slot.key}
              onPress={() => onMealChange?.(slot.key)}
              className="flex-row w-full items-center"
              style={{
                gap: spacing.elementGap,
                borderRadius: radius.md,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.primaryLight : colors.bgCard,
                padding: spacing.cardPaddingCompact,
              }}
            >
              {/* Radio circle */}
              <View
                className="flex items-center justify-center"
                style={{
                  height: 20, width: 20, borderRadius: 10,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.textPlaceholder,
                }}
              >
                {isSelected && (
                  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                )}
              </View>

              {/* Label */}
              <View className="flex-1">
                <Text
                  style={{
                    ...typography.cardTitle,
                    color: isSelected ? colors.primary : colors.textPrimary,
                  }}
                >
                  {slot.label}
                </Text>
              </View>

              {/* Time */}
              <View className="flex-row items-center" style={{ gap: spacing.xs }}>
                <Clock size={12} color={colors.textTertiary} />
                <Text style={typography.caption}>{slot.time}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
