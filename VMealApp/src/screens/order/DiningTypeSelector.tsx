import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

interface DiningTypeSelectorProps {
  selected: 'DINE_IN' | 'TAKEOUT';
  tableNo: string;
  scheduledTime: string;
}

export function DiningTypeSelector({ selected, tableNo, scheduledTime }: DiningTypeSelectorProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-3">
      {/* Toggle buttons */}
      <View className="flex-row gap-2">
        <Pressable
          className={`flex-1 h-[40px] items-center justify-center rounded-xl ${
            selected === 'DINE_IN'
              ? 'bg-[#3B82F6]'
              : 'border border-gray-200 bg-white'
          }`}
        >
          <Text
            className={`text-[14px] font-medium ${
              selected === 'DINE_IN' ? 'text-white' : 'text-gray-600'
            }`}
          >
            {t('order.dineIn')}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 h-[40px] items-center justify-center rounded-xl ${
            selected === 'TAKEOUT'
              ? 'bg-[#3B82F6]'
              : 'border border-gray-200 bg-white'
          }`}
        >
          <Text
            className={`text-[14px] font-medium ${
              selected === 'TAKEOUT' ? 'text-white' : 'text-gray-600'
            }`}
          >
            {t('order.takeout')}
          </Text>
        </Pressable>
      </View>

      {/* Table + time info */}
      {selected === 'DINE_IN' && tableNo && (
        <Text className="text-center text-[13px] text-gray-400">
          {t('order.table')} {tableNo} · {t('order.scheduledAt')} {scheduledTime}
        </Text>
      )}
    </View>
  );
}
