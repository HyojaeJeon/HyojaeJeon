import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

interface MonthSelectorProps {
  month: string;
  totalSpent: number;
  companySpent: number;
  personalSpent: number;
}

export function MonthSelector({ month, totalSpent, companySpent, personalSpent }: MonthSelectorProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      {/* Month navigation */}
      <View className="flex-row items-center justify-center gap-4">
        <Pressable className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200">
          <ChevronLeft size={16} color="#4B5563" />
        </Pressable>
        <Text className="text-[15px] font-semibold text-gray-900">{month}</Text>
        <Pressable className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200">
          <ChevronRight size={16} color="#4B5563" />
        </Pressable>
      </View>

      {/* Summary card */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <Text className="text-xs text-gray-400">{t('transaction.monthlyTotal')}</Text>
        <Text className="text-2xl font-bold text-gray-900 mt-1">{formatVnd(totalSpent)}</Text>
        <View className="flex-row items-center gap-2 mt-3">
          <View className="flex-row items-center rounded-full bg-[#3B82F6]/10 px-3 py-1">
            <Text className="text-xs font-medium text-[#3B82F6]">
              {t('transaction.company')}: {formatVnd(companySpent)}
            </Text>
          </View>
          <View className="flex-row items-center rounded-full bg-gray-100 px-3 py-1">
            <Text className="text-xs font-medium text-gray-600">
              {t('transaction.personal')}: {formatVnd(personalSpent)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
