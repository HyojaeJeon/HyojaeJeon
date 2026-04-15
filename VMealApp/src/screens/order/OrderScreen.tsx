import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { AppHeader, useModal } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { DiningTypeSelector } from './DiningTypeSelector';
import { MenuItemCard } from './MenuItemCard';
import { PaymentSummary } from './PaymentSummary';
import { useOrderData } from './useOrderData';

const FOOD_CATEGORIES = ['Phở', 'Khai vị', 'Đồ uống'];

const TIME_SLOTS = ['11:30', '12:00', '12:30', '13:00', '13:30'];

export default function OrderScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const modal = useModal();
  const { menuItems, creating, error, handleCreateOrder } = useOrderData();
  const [selectedCategory, setSelectedCategory] = useState('Phở');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [diningType, setDiningType] = useState<'DINE_IN' | 'TAKEOUT'>('DINE_IN');
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'mi-001': 1, // Phở Bò Tái
    'mi-004': 1, // Gỏi Cuốn
  });

  const allCategoryLabel = t('order.allCategories');
  const CATEGORIES = [allCategoryLabel, ...FOOD_CATEGORIES];

  const filteredItems =
    selectedCategory === allCategoryLabel
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleQuantityChange = useCallback((itemId: string, newQty: number) => {
    setQuantities((prev) => {
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: newQty };
    });
  }, []);

  // Compute totals from current quantities
  const totalVnd = Object.entries(quantities).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find((m) => m.id === itemId);
    return sum + (item?.priceVnd ?? 0) * qty;
  }, 0);

  const onOrder = useCallback(async () => {
    // Build order items from selected quantities
    const selectedItems = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => {
        const menuItem = menuItems.find((m) => m.id === itemId);
        return {
          menuItemName: menuItem?.name ?? '',
          quantity: qty,
          unitPriceVnd: menuItem?.priceVnd ?? 0,
        };
      });

    if (selectedItems.length === 0) return;

    const result = await handleCreateOrder({
      walletId: '', // Provided by auth context at runtime
      branchId: '', // Provided by route params at runtime
      diningType,
      tableNo: diningType === 'DINE_IN' ? 'A-05' : undefined,
      scheduledAt: new Date().toISOString(),
      idempotencyKey: `order-${Date.now()}`,
      items: selectedItems,
    });

    if (result) {
      navigation.navigate('OrderStatusScreen', { orderId: result.id });
    } else if (error) {
      modal.show({
        title: t('common.error'),
        message: error,
        confirmText: t('common.ok', { defaultValue: 'OK' }),
      });
    }
  }, [handleCreateOrder, menuItems, navigation, error, t, quantities, diningType, modal]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <AppHeader title="Pho 24 - Nguyen Hue" onBack={() => navigation.goBack()} />

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.sm, paddingBottom: 220 }}
      >
        {/* Dining type selector */}
        <View style={{ marginTop: spacing.sm }}>
          <DiningTypeSelector
            selected={diningType}
            tableNo="A-05"
            scheduledTime={selectedTime}
            onTypeChange={setDiningType}
          />
        </View>

        {/* Menu section */}
        <View style={{ marginTop: spacing.sectionGap, gap: spacing.elementGap }}>
          <Text style={typography.sectionTitle}>{t('order.menu')}</Text>

          {/* Category chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
            <View className="flex-row" style={{ gap: spacing.sm }}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    backgroundColor: selectedCategory === cat ? colors.primary : colors.bgWhite,
                    borderWidth: selectedCategory === cat ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: selectedCategory === cat ? colors.textInverse : colors.textSecondary,
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Menu items */}
          <View style={{ gap: spacing.sm }}>
            {filteredItems.length === 0 ? (
              <View className="items-center" style={{ paddingVertical: spacing.sectionGap }}>
                <Text style={typography.body}>{t('order.emptyMenu', { defaultValue: 'No menu items available' })}</Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={quantities[item.id] ?? 0}
                  onQuantityChange={handleQuantityChange}
                />
              ))
            )}
          </View>
        </View>

        {/* Time slot picker */}
        <View style={{ marginTop: spacing.sectionGap, gap: spacing.elementGap }}>
          <Text style={typography.sectionTitle}>{t('order.timeSlot')}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
            <View className="flex-row" style={{ gap: spacing.sm }}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = slot === selectedTime;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setSelectedTime(slot)}
                    className="flex-row items-center"
                    style={{
                      gap: 6,
                      borderRadius: radius.md,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: 10,
                      backgroundColor: isSelected ? colors.primary : colors.bgWhite,
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: isSelected ? colors.textInverse : colors.textSecondary,
                      }}
                    >
                      {slot}
                    </Text>
                    {isSelected && <Check size={14} color={colors.textInverse} />}
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
          totalVnd={totalVnd}
          companyShareVnd={totalVnd}
          employeeShareVnd={0}
          gpsVerified
          onOrder={onOrder}
          loading={creating}
          disabled={creating || totalVnd === 0}
        />
      </View>
    </View>
  );
}
