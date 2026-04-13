import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { MOCK_MENU_PHO24 } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { DiningTypeSelector } from './DiningTypeSelector';
import { MenuItemCard } from './MenuItemCard';
import { PaymentSummary } from './PaymentSummary';

const FOOD_CATEGORIES = ['Phở', 'Khai vị', 'Đồ uống'];

const TIME_SLOTS = ['11:30', '12:00', '12:30', '13:00', '13:30'];

const ITEM_QUANTITIES: Record<string, number> = {
  'mi-001': 1, // Phở Bò Tái
  'mi-004': 1, // Gỏi Cuốn
};

export default function OrderScreen() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('Phở');
  const [selectedTime, setSelectedTime] = useState('12:00');

  const allCategoryLabel = t('order.allCategories');
  const CATEGORIES = [allCategoryLabel, ...FOOD_CATEGORIES];

  const filteredItems =
    selectedCategory === allCategoryLabel
      ? MOCK_MENU_PHO24
      : MOCK_MENU_PHO24.filter((item) => item.category === selectedCategory);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title="Phở 24 - Nguyễn Huệ" onBack={() => {}} />

      {/* Scrollable content */}
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-2 pb-[220px]">
        {/* Dining type selector */}
        <View className="mt-2">
          <DiningTypeSelector selected="DINE_IN" tableNo="A-05" scheduledTime="12:00" />
        </View>

        {/* Menu section */}
        <View className="mt-6 gap-3">
          <Text className="text-[15px] font-semibold text-gray-900">{t('order.menu')}</Text>

          {/* Category chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
            <View className="flex-row gap-2">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 ${
                    selectedCategory === cat
                      ? 'bg-[#3B82F6]'
                      : 'border border-gray-200 bg-white'
                  }`}
                >
                  <Text
                    className={`text-[13px] font-medium ${
                      selectedCategory === cat ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Menu items */}
          <View className="gap-2">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={ITEM_QUANTITIES[item.id] ?? 0}
              />
            ))}
          </View>
        </View>

        {/* Time slot picker */}
        <View className="mt-6 gap-3">
          <Text className="text-[15px] font-semibold text-gray-900">{t('order.timeSlot')}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
            <View className="flex-row gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = slot === selectedTime;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setSelectedTime(slot)}
                    className={`flex-row items-center gap-1.5 rounded-xl px-4 py-2.5 ${
                      isSelected
                        ? 'bg-[#3B82F6]'
                        : 'border border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-medium ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {slot}
                    </Text>
                    {isSelected && <Check size={14} color="#FFFFFF" />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky bottom payment summary */}
      <View className="absolute bottom-0 left-0 right-0">
        <PaymentSummary
          totalVnd={100_000}
          companyShareVnd={100_000}
          employeeShareVnd={0}
          gpsVerified
        />
      </View>
    </View>
  );
}
