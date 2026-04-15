import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { formatVnd } from '@shared/utils/format';
import { AppHeader } from '@shared/ui/AppHeader';
import { useModal } from '@shared/ui';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { MealSelector } from './MealSelector';
import { PreOrderSummary } from './PreOrderSummary';
import { usePreOrderData } from './usePreOrderData';

interface PreOrderMenuItem {
  id: string;
  name: string;
  priceVnd?: number;
  price?: number;
  description?: string;
}

export default function PreOrderScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RootStackParamList, 'PreOrderScreen'>>();
  const _branchId = route.params?.branchId;
  const routeMealType = route.params?.mealType;
  const modal = useModal();

  // TODO: dailyMenuId 를 route params 에서 받아올 것
  const {
    menuItems: MENU_ITEMS_RAW,
    sideDishes: SIDE_DISHES_RAW,
    drinks: DRINKS_RAW,
    merchantName,
    submitPreOrder,
    submitting,
  } = usePreOrderData('dm-001');

  // Meal selector state
  const [selectedMeal, setSelectedMeal] = useState(
    routeMealType ? routeMealType.toLowerCase() : 'lunch',
  );

  // Menu item radio selection state
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(
    MENU_ITEMS_RAW[1]?.id ?? MENU_ITEMS_RAW[0]?.id ?? '',
  );

  // Side dishes checkbox state
  const [checkedSides, setCheckedSides] = useState<Set<string>>(
    new Set(SIDE_DISHES_RAW.slice(0, 1).map((s: PreOrderMenuItem) => s.id)),
  );

  // Drinks checkbox state
  const [checkedDrinks, setCheckedDrinks] = useState<Set<string>>(
    new Set(DRINKS_RAW.map((d: PreOrderMenuItem) => d.id)),
  );

  const toggleSide = (id: string) => {
    setCheckedSides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDrink = (id: string) => {
    setCheckedDrinks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build summary from selection state
  const selectedMain = MENU_ITEMS_RAW.find((i: PreOrderMenuItem) => i.id === selectedMenuItemId);
  const selectedSides = SIDE_DISHES_RAW.filter((s: PreOrderMenuItem) => checkedSides.has(s.id));
  const selectedDrinkItems = DRINKS_RAW.filter((d: PreOrderMenuItem) => checkedDrinks.has(d.id));

  const summaryItems = [
    ...(selectedMain
      ? [{ name: selectedMain.name, price: selectedMain.priceVnd ?? selectedMain.price ?? 0 }]
      : []),
    ...selectedSides.map((s: PreOrderMenuItem) => ({
      name: s.name,
      price: s.priceVnd ?? s.price ?? 0,
    })),
    ...selectedDrinkItems.map((d: PreOrderMenuItem) => ({
      name: d.name,
      price: d.priceVnd ?? d.price ?? 0,
    })),
  ];

  const total = summaryItems.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async () => {
    try {
      await submitPreOrder({
        walletId: 'wallet-001',
        corporateId: 'corp-001',
        branchId: _branchId ?? 'branch-001',
        dailyMenuId: 'dm-001',
        mealType: selectedMeal.toUpperCase(),
        pickupSlot: '12:00',
        idempotencyKey: `preorder-${Date.now()}`,
        items: [
          { dailyMenuItemId: selectedMenuItemId, quantity: 1 },
          ...Array.from(checkedSides).map((id) => ({ dailyMenuItemId: id, quantity: 1 })),
          ...Array.from(checkedDrinks).map((id) => ({ dailyMenuItemId: id, quantity: 1 })),
        ],
      });
      modal.show({
        title: t('preOrder.successTitle'),
        message: t('preOrder.successMessage'),
        confirmText: 'OK',
      });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <AppHeader title={t('preOrder.title')} />

      <ScrollView>
        <View style={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.elementGap, paddingBottom: spacing.xxl, gap: spacing.cardPadding }}>
          {/* Restaurant info */}
          <View className="flex-row items-center" style={{ gap: spacing.elementGap, borderRadius: radius.md, backgroundColor: colors.bgCard, padding: spacing.elementGap, ...shadows.card }}>
            <View className="flex items-center justify-center" style={{ height: 36, width: 36, borderRadius: radius.full, backgroundColor: colors.primary }}>
              <Text style={{ color: colors.textInverse, fontWeight: '700', fontSize: 12 }}>CT</Text>
            </View>
            <View className="flex-1 min-w-0">
              <Text style={typography.cardTitle}>
                {merchantName ?? t('preOrder.title')}
              </Text>
            </View>
            <View style={{ borderRadius: radius.full, backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '500', color: colors.primary }}>
                {t('common.tomorrow')}, 13/04
              </Text>
            </View>
          </View>

          {/* Meal selector */}
          <MealSelector selectedMeal={selectedMeal} onMealChange={setSelectedMeal} />

          {/* Menu selection */}
          <View style={{ gap: spacing.elementGap }}>
            <Text style={typography.sectionTitle}>
              {t('preOrder.menuDate', { date: '13/04' })}
            </Text>

            {/* Main dishes (radio) */}
            {MENU_ITEMS_RAW.length === 0 ? (
              <View className="items-center" style={{ paddingVertical: spacing.sectionGap }}>
                <Text style={typography.body}>{t('preOrder.emptyMenu', { defaultValue: 'No menu items available' })}</Text>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {MENU_ITEMS_RAW.map((item: PreOrderMenuItem) => {
                  const isSelected = item.id === selectedMenuItemId;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedMenuItemId(item.id)}
                      className="flex-row w-full items-start"
                      style={{
                        gap: spacing.elementGap,
                        borderRadius: radius.md,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primaryLight : colors.bgCard,
                        padding: spacing.cardPaddingCompact,
                      }}
                    >
                      {/* Radio */}
                      <View
                        className="mt-0.5 flex shrink-0 items-center justify-center"
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

                      {/* Info */}
                      <View className="flex-1 min-w-0">
                        <Text
                          style={{
                            ...typography.cardTitle,
                            color: isSelected ? colors.primary : colors.textPrimary,
                          }}
                        >
                          {item.name}
                        </Text>
                        {item.description ? (
                          <Text style={{ ...typography.caption, marginTop: 2 }}>{item.description}</Text>
                        ) : null}
                      </View>

                      {/* Price */}
                      <Text className="shrink-0" style={{ ...typography.cardTitle }}>
                        {formatVnd(item.priceVnd ?? item.price ?? 0)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Side dishes (checkbox) */}
            <View style={{ gap: 6 }}>
              <Text style={{ ...typography.body, fontWeight: '500', marginTop: spacing.sm }}>{t('preOrder.sideDishes')}</Text>
              {SIDE_DISHES_RAW.map((side: PreOrderMenuItem) => {
                const isChecked = checkedSides.has(side.id);
                return (
                  <Pressable
                    key={side.id}
                    onPress={() => toggleSide(side.id)}
                    className="flex-row items-center"
                    style={{ gap: spacing.elementGap, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, padding: spacing.elementGap }}
                  >
                    {/* Checkbox */}
                    <View
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        height: 20, width: 20, borderRadius: spacing.xs,
                        backgroundColor: isChecked ? colors.primary : 'transparent',
                        borderWidth: isChecked ? 0 : 2,
                        borderColor: colors.textPlaceholder,
                      }}
                    >
                      {isChecked && <Check size={13} color={colors.textInverse} />}
                    </View>
                    <Text className="flex-1" style={typography.body}>{side.name}</Text>
                    <Text style={typography.body}>
                      + {formatVnd(side.priceVnd ?? side.price ?? 0)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Drinks (checkbox) */}
            <View style={{ gap: 6 }}>
              <Text style={{ ...typography.body, fontWeight: '500', marginTop: spacing.sm }}>{t('preOrder.drinks')}</Text>
              {DRINKS_RAW.map((drink: PreOrderMenuItem) => {
                const isChecked = checkedDrinks.has(drink.id);
                const price = drink.priceVnd ?? drink.price ?? 0;
                return (
                  <Pressable
                    key={drink.id}
                    onPress={() => toggleDrink(drink.id)}
                    className="flex-row items-center"
                    style={{ gap: spacing.elementGap, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, padding: spacing.elementGap }}
                  >
                    {/* Checkbox */}
                    <View
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        height: 20, width: 20, borderRadius: spacing.xs,
                        backgroundColor: isChecked ? colors.primary : 'transparent',
                        borderWidth: isChecked ? 0 : 2,
                        borderColor: colors.textPlaceholder,
                      }}
                    >
                      {isChecked && <Check size={13} color={colors.textInverse} />}
                    </View>
                    <Text className="flex-1" style={typography.body}>{drink.name}</Text>
                    <Text style={typography.body}>
                      + {price === 0 ? '0\u20AB' : formatVnd(price)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Order summary */}
          <PreOrderSummary
            items={summaryItems}
            total={total}
            pickupTime="12:00 - 13/04/2026"
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </View>
      </ScrollView>
    </View>
  );
}
