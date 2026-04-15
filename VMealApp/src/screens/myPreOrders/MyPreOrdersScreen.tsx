import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { useModal } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { PreOrderCard } from './PreOrderCard';
import type { PreOrderData } from './PreOrderCard';
import { useMyPreOrdersData } from './useMyPreOrdersData';

export default function MyPreOrdersScreen() {
  const { t } = useTranslation();
  const modal = useModal();
  // TODO: walletId 를 auth/wallet state 에서 받아올 것
  const { preOrders, handleCancel } = useMyPreOrdersData('wallet-001');

  const TAB_OPTIONS = [
    { key: 'upcoming', label: t('myPreOrders.upcoming') },
    { key: 'completed', label: t('myPreOrders.completed') },
    { key: 'cancelled', label: t('myPreOrders.cancelled') },
  ];

  const [activeTab, setActiveTab] = useState('upcoming');

  // Filter pre-orders based on active tab
  const filteredOrders = preOrders.filter((order: PreOrderData) => {
    if (activeTab === 'upcoming') {
      return order.status === 'CONFIRMED' || order.status === 'PENDING';
    }
    if (activeTab === 'completed') return order.status === 'COMPLETED';
    if (activeTab === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  const handleCancelPress = (orderId: string) => {
    modal.show({
      title: t('myPreOrders.cancelConfirmTitle'),
      message: t('myPreOrders.cancelConfirmMessage'),
      confirmText: t('myPreOrders.cancelOrder'),
      cancelText: t('common.cancel'),
      variant: 'danger',
      onConfirm: async () => {
        await handleCancel(orderId);
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('myPreOrders.title')} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ gap: spacing.lg }}>
          {/* Filter tabs */}
          <View className="flex-row" style={{ gap: spacing.sm }}>
            {TAB_OPTIONS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className="flex-row items-center"
                  style={{
                    gap: 6,
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    backgroundColor: isActive ? colors.primary : colors.bgCard,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  {isActive && <Check size={14} color={colors.textInverse} />}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: isActive ? colors.textInverse : colors.textSecondary,
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Pre-order cards */}
          {filteredOrders.map((order: PreOrderData) => (
            <PreOrderCard
              key={order.id}
              order={order}
              onCancel={handleCancelPress}
            />
          ))}

          {/* Empty state */}
          {filteredOrders.length === 0 && (
            <View className="items-center" style={{ paddingVertical: spacing.xxxl }}>
              <Text style={typography.body}>
                {t('myPreOrders.empty')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
