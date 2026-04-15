import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatVnd } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, shadows, radius } from '@shared/ui/tokens';

interface MonthSelectorProps {
  month: string;
  totalSpent: number;
  companySpent: number;
  personalSpent: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export function MonthSelector({
  month,
  totalSpent,
  companySpent,
  personalSpent,
  onPrevMonth,
  onNextMonth,
}: MonthSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={{ gap: spacing.md }}>
      {/* Month navigation */}
      <View className="flex-row items-center justify-center" style={{ gap: spacing.lg }}>
        <Pressable
          onPress={onPrevMonth}
          className="flex items-center justify-center active:bg-gray-100"
          style={{ height: 32, width: 32, borderRadius: radius.full, backgroundColor: colors.bgWhite, borderWidth: 1, borderColor: colors.border }}
        >
          <ChevronLeft size={16} color={colors.textSecondary} />
        </Pressable>
        <Text style={typography.sectionTitle}>{month}</Text>
        <Pressable
          onPress={onNextMonth}
          className="flex items-center justify-center active:bg-gray-100"
          style={{ height: 32, width: 32, borderRadius: radius.full, backgroundColor: colors.bgWhite, borderWidth: 1, borderColor: colors.border }}
        >
          <ChevronRight size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Summary card */}
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderRadius: radius.xl,
          padding: spacing.cardPadding,
          ...shadows.card,
        }}
      >
        <Text style={typography.overline}>{t('transaction.monthlyTotal')}</Text>
        <Text style={{ ...typography.displayMedium, marginTop: spacing.xs }}>{formatVnd(totalSpent)}</Text>
        <View className="flex-row items-center" style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <View
            className="flex-row items-center"
            style={{ borderRadius: radius.full, backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Text style={{ ...typography.caption, color: colors.primary, fontWeight: '500' }}>
              {t('transaction.company')}: {formatVnd(companySpent)}
            </Text>
          </View>
          <View
            className="flex-row items-center"
            style={{ borderRadius: radius.full, backgroundColor: colors.bgInput, paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Text style={{ ...typography.caption, color: colors.textSecondary, fontWeight: '500' }}>
              {t('transaction.personal')}: {formatVnd(personalSpent)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
