import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/mock/mockData';
import { AppHeader } from '@shared/ui/AppHeader';
import { MealSelector } from './MealSelector';
import { PreOrderSummary } from './PreOrderSummary';

/* Menu items for tomorrow */
const MENU_ITEMS = [
  {
    id: 'po-1',
    name: 'Com suon nuong mat ong',
    price: 40_000,
    description: 'Com tam suon nuong mat ong, kem do chua',
    selected: false,
  },
  {
    id: 'po-2',
    name: 'Bun bo Hue dac biet',
    price: 45_000,
    description: 'Bun bo Hue truyen thong, gio heo, huyet',
    selected: true,
  },
  {
    id: 'po-3',
    name: 'Pho ga ta',
    price: 35_000,
    description: 'Pho ga ta tha vuon, nuoc dung trong',
    selected: false,
  },
];

const SIDE_DISHES = [
  { id: 'sd-1', name: 'Cha gio (2 cai)', price: 15_000, checked: true },
  { id: 'sd-2', name: 'Rau xao thap cam', price: 10_000, checked: false },
];

const DRINKS = [
  { id: 'dk-1', name: 'Tra da', price: 0, checked: true },
];

export default function PreOrderScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title={t('preOrder.title')} />

      <ScrollView>
        <View className="px-5 pt-3 pb-6 gap-5">
          {/* Restaurant info */}
          <View className="flex-row items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            <View className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-blue-500">
              <Text className="text-white font-bold text-xs">CT</Text>
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-medium text-gray-900">
                Canteen TechCorp - Tang B1
              </Text>
            </View>
            <View className="rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5">
              <Text className="text-[11px] font-medium text-[#3B82F6]">
                {t('common.tomorrow')}, 13/04
              </Text>
            </View>
          </View>

          {/* Meal selector */}
          <MealSelector />

          {/* Menu selection */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-gray-900">
              {t('preOrder.menuDate', { date: '13/04' })}
            </Text>

            {/* Main dishes (radio) */}
            <View className="gap-2">
              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.id}
                  className={`flex-row w-full items-start gap-3 rounded-xl border p-4 ${
                    item.selected
                      ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Radio */}
                  <View
                    className={`mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border-2 ${
                      item.selected
                        ? 'border-[#3B82F6]'
                        : 'border-gray-300'
                    }`}
                  >
                    {item.selected && (
                      <View className="h-[10px] w-[10px] rounded-full bg-[#3B82F6]" />
                    )}
                  </View>

                  {/* Info */}
                  <View className="flex-1 min-w-0">
                    <Text
                      className={`text-sm font-medium ${
                        item.selected ? 'text-[#3B82F6]' : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-gray-400">{item.description}</Text>
                  </View>

                  {/* Price */}
                  <Text className="shrink-0 text-sm font-medium text-gray-900">
                    {formatVnd(item.price)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Side dishes (checkbox) */}
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-500 mt-2">{t('preOrder.sideDishes')}</Text>
              {SIDE_DISHES.map((side) => (
                <View
                  key={side.id}
                  className="flex-row items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
                >
                  {/* Checkbox */}
                  <View
                    className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded ${
                      side.checked
                        ? 'bg-[#3B82F6]'
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {side.checked && <Check size={13} color="#ffffff" />}
                  </View>
                  <Text className="flex-1 text-sm text-gray-700">{side.name}</Text>
                  <Text className="text-sm text-gray-600">
                    + {formatVnd(side.price)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Drinks (checkbox) */}
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-gray-500 mt-2">{t('preOrder.drinks')}</Text>
              {DRINKS.map((drink) => (
                <View
                  key={drink.id}
                  className="flex-row items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
                >
                  {/* Checkbox */}
                  <View
                    className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded ${
                      drink.checked
                        ? 'bg-[#3B82F6]'
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {drink.checked && <Check size={13} color="#ffffff" />}
                  </View>
                  <Text className="flex-1 text-sm text-gray-700">{drink.name}</Text>
                  <Text className="text-sm text-gray-600">
                    + {drink.price === 0 ? '0\u20AB' : formatVnd(drink.price)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Order summary */}
          <PreOrderSummary
            items={[
              { name: 'Bun bo Hue dac biet', price: 45_000 },
              { name: 'Cha gio (2 cai)', price: 15_000 },
              { name: 'Tra da', price: 0 },
            ]}
            total={60_000}
            pickupTime="12:00 - 13/04/2026"
          />
        </View>
      </ScrollView>
    </View>
  );
}
