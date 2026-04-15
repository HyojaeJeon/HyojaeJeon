import { View, Text, Pressable } from 'react-native';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';

interface DiningTypeSelectorProps {
  selected: 'DINE_IN' | 'TAKEOUT';
  tableNo: string;
  scheduledTime: string;
  onTypeChange?: (type: 'DINE_IN' | 'TAKEOUT') => void;
}

export function DiningTypeSelector({ selected, tableNo, scheduledTime, onTypeChange }: DiningTypeSelectorProps) {
  const { t } = useTranslation();

  const toggleStyle = (isActive: boolean) => ({
    height: 40,
    borderRadius: radius.md,
    backgroundColor: isActive ? colors.primary : colors.bgWhite,
    borderWidth: isActive ? 0 : 1,
    borderColor: colors.border,
  });

  const toggleTextStyle = (isActive: boolean) => ({
    ...typography.body,
    fontWeight: '500' as const,
    color: isActive ? colors.textInverse : colors.textSecondary,
  });

  return (
    <View style={{ gap: spacing.elementGap }}>
      {/* Toggle buttons */}
      <View className="flex-row" style={{ gap: spacing.sm }}>
        <Pressable
          onPress={() => onTypeChange?.('DINE_IN')}
          className="flex-1 items-center justify-center"
          style={toggleStyle(selected === 'DINE_IN')}
        >
          <Text style={toggleTextStyle(selected === 'DINE_IN')}>
            {t('order.dineIn')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTypeChange?.('TAKEOUT')}
          className="flex-1 items-center justify-center"
          style={toggleStyle(selected === 'TAKEOUT')}
        >
          <Text style={toggleTextStyle(selected === 'TAKEOUT')}>
            {t('order.takeout')}
          </Text>
        </Pressable>
      </View>

      {/* Table + time info */}
      {selected === 'DINE_IN' && tableNo && (
        <Text style={{ textAlign: 'center', ...typography.caption }}>
          {t('order.table')} {tableNo} · {t('order.scheduledAt')} {scheduledTime}
        </Text>
      )}
    </View>
  );
}
