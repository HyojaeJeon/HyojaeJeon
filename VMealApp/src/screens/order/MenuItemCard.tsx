import { View, Text, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import type { MockMenuItem } from '@shared/mock/types';

interface MenuItemCardProps {
  item: MockMenuItem;
  quantity: number;
}

export function MenuItemCard({ item, quantity }: MenuItemCardProps) {
  const { t } = useTranslation();
  const isDisabled = !item.isAvailable;

  return (
    <View
      className={`flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ${
        isDisabled ? 'opacity-50' : ''
      }`}
    >
      {/* Left: info */}
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-2">
          <Text className={`text-[15px] font-semibold ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {item.nameVi}
          </Text>
          {item.isPopular && !isDisabled && (
            <View className="rounded-full bg-[#F59E0B]/10 px-2 py-0.5">
              <Text className="text-[10px] font-medium text-[#F59E0B]">
                {t('order.popular')}
              </Text>
            </View>
          )}
        </View>
        <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>{item.descriptionVi}</Text>
        <Text className="mt-1 text-[14px] font-medium text-gray-900">
          {item.priceVnd === 0 ? 'Miễn phí' : formatVnd(item.priceVnd)}
        </Text>
      </View>

      {/* Right: quantity controls */}
      <View className="flex-row items-center gap-2">
        {quantity > 0 ? (
          <>
            <Pressable
              className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-gray-200 bg-white"
              disabled={isDisabled}
            >
              <Minus size={16} color="#4B5563" />
            </Pressable>
            <Text className="w-[24px] text-center text-[15px] font-semibold text-gray-900">
              {quantity}
            </Text>
            <Pressable
              className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#3B82F6]"
              disabled={isDisabled}
            >
              <Plus size={16} color="#FFFFFF" />
            </Pressable>
          </>
        ) : (
          <Pressable
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-lg ${
              isDisabled
                ? 'border border-gray-100 bg-gray-50'
                : 'border border-gray-200 bg-white'
            }`}
            disabled={isDisabled}
          >
            <Plus size={16} color={isDisabled ? '#D1D5DB' : '#4B5563'} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
