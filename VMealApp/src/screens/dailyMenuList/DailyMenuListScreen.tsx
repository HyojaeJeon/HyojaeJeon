import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { AppHeader } from '@shared/ui/AppHeader';
import { useModal } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useMutation } from '@apollo/client';
import { MEAL_MERCHANT_SUBSCRIBE, MEAL_MERCHANT_UNSUBSCRIBE } from '@graphql/mutations/merchantSubscription';
import { useAppSelector } from '@store/index';
import { MealTypeTab } from './MealTypeTab';
import { DailyMenuCard } from './DailyMenuCard';
import { useDailyMenuData } from './useDailyMenuData';

interface DailyMenuItem {
  id: string;
  name: string;
  priceVnd: number;
  originalPrice?: number;
}

interface DailyMenuData {
  id: string;
  branchId: string;
  brandInitial?: string;
  brandColor?: string;
  brandName?: string;
  distance?: string;
  date: string;
  mealType: string;
  status: string;
  items: DailyMenuItem[];
  subscribed: boolean;
}

export default function DailyMenuListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const modal = useModal();
  const employeeId = useAppSelector((s) => s.auth.user?.employeeId) ?? '';
  const { dailyMenus, refetch } = useDailyMenuData(employeeId);
  const [activeMealType, setActiveMealType] = useState('lunch');

  const [subscribeMutation] = useMutation(MEAL_MERCHANT_SUBSCRIBE);
  const [unsubscribeMutation] = useMutation(MEAL_MERCHANT_UNSUBSCRIBE);

  const handleSubscribeToggle = (menu: DailyMenuData) => {
    if (menu.subscribed) {
      modal.show({
        title: t('dailyMenu.unsubscribeTitle'),
        message: t('dailyMenu.unsubscribeConfirm', { name: menu.brandName }),
        confirmText: t('dailyMenu.unsubscribe'),
        cancelText: t('common.cancel'),
        variant: 'danger',
        onConfirm: async () => {
          const { data } = await unsubscribeMutation({
            variables: { employeeId, branchId: menu.branchId },
          });
          if (data?.mealMerchantUnsubscribe?.error) {
            modal.show({
              title: t('common.error'),
              message: data.mealMerchantUnsubscribe.error.message ?? data.mealMerchantUnsubscribe.error.code,
              confirmText: t('common.ok'),
            });
            return;
          }
          refetch();
        },
      });
    } else {
      modal.show({
        title: t('dailyMenu.subscribeTitle'),
        message: t('dailyMenu.subscribeConfirm', { name: menu.brandName }),
        confirmText: t('dailyMenu.subscribe'),
        cancelText: t('common.cancel'),
        onConfirm: async () => {
          const { data } = await subscribeMutation({
            variables: {
              employeeId,
              branchId: menu.branchId,
              notifyBreakfast: true,
              notifyLunch: true,
              notifyDinner: true,
            },
          });
          if (data?.mealMerchantSubscribe?.error) {
            modal.show({
              title: t('common.error'),
              message: data.mealMerchantSubscribe.error.message ?? data.mealMerchantSubscribe.error.code,
              confirmText: t('common.ok'),
            });
            return;
          }
          refetch();
        },
      });
    }
  };

  const handleItemPress = (menu: DailyMenuData) => {
    navigation.navigate('PreOrderScreen', {
      branchId: menu.branchId,
      mealType: activeMealType.toUpperCase(),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <AppHeader
        title={t('dailyMenu.title')}
        right={
          <Pressable className="flex items-center justify-center" style={{ height: 44, width: 44, borderRadius: radius.full }}>
            <Bell size={20} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView>
        {/* Date display */}
        <View className="flex-row items-center" style={{ gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.elementGap }}>
          <Text style={typography.body}>Thu Bay, 12/04/2026</Text>
          <View style={{ borderRadius: radius.full, backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '500', color: colors.primary }}>
              {t('common.today')}
            </Text>
          </View>
        </View>

        {/* Meal type tabs */}
        <View style={{ marginTop: spacing.elementGap, paddingHorizontal: spacing.screenHorizontal }}>
          <MealTypeTab active={activeMealType} onTabChange={setActiveMealType} />
        </View>

        {/* Daily menu cards */}
        <View style={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg }}>
          {dailyMenus.length === 0 ? (
            <View className="items-center" style={{ paddingVertical: spacing.sectionGap }}>
              <Text style={typography.body}>{t('dailyMenu.empty', { defaultValue: 'No daily menus available' })}</Text>
            </View>
          ) : (
            dailyMenus.map((menu: DailyMenuData) => (
              <DailyMenuCard
                key={menu.id}
                brandInitial={menu.brandInitial ?? menu.brandName?.charAt(0) ?? '?'}
                brandColor={menu.brandColor ?? 'bg-gray-500'}
                brandName={menu.brandName ?? ''}
                distance={menu.distance ?? ''}
                items={(menu.items ?? []).map((item: DailyMenuItem) => ({
                  name: item.name,
                  price: item.priceVnd,
                  originalPrice: item.originalPrice,
                }))}
                subscribed={menu.subscribed ?? false}
                onSubscribeToggle={() => handleSubscribeToggle(menu)}
                onItemPress={() => handleItemPress(menu)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
