import { View, Text, TextInput, Pressable } from 'react-native';
import { formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

interface PresetAmountsProps {
  amounts: number[];
  selected: number | null;
}

export function PresetAmounts({ amounts, selected }: PresetAmountsProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <Text className="text-[15px] font-semibold text-gray-900">{t('topUp.selectAmount')}</Text>

      {/* 2x2 grid */}
      <View className="flex-row flex-wrap gap-3">
        {amounts.map((amount) => {
          const isSelected = amount === selected;
          return (
            <Pressable
              key={amount}
              className={`h-[56px] items-center justify-center rounded-xl border ${
                isSelected
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                  : 'border-gray-200 bg-white'
              }`}
              style={{ width: '48%' }}
            >
              <Text
                className={`text-[15px] font-medium ${
                  isSelected ? 'text-[#3B82F6]' : 'text-gray-900'
                }`}
              >
                {formatVnd(amount)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom amount input */}
      <Text className="text-center text-[13px] text-gray-400">{t('topUp.orEnterCustom')}</Text>
      <View className="flex-row h-[52px] items-center rounded-xl border border-gray-200 bg-white px-4">
        <TextInput
          placeholder="Nhap so tien"
          placeholderTextColor="#D1D5DB"
          className="flex-1 bg-transparent text-[15px] text-gray-900"
          editable={false}
        />
        <Text className="text-[15px] font-medium text-gray-400">d</Text>
      </View>
    </View>
  );
}
