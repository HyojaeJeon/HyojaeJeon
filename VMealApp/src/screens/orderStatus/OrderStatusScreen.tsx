import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { CheckCircle, Clock, MapPin, Share2, Home, X, QrCode } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useModal } from '@shared/ui';
import { formatVnd } from '@shared/utils/format';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { StatusTimeline } from './StatusTimeline';
import { useOrderStatusData } from './useOrderStatusData';

export default function OrderStatusScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const modal = useModal();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderStatusScreen'>>();
  const orderId = route.params?.orderId ?? '';

  const {
    order,
    loading,
    cancelling,
    checkingIn,
    error,
    handleCancel,
    handleCheckin,
  } = useOrderStatusData(orderId);

  if (loading || !order) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const onCancel = useCallback(() => {
    modal.show({
      title: t('orderStatus.cancelConfirmTitle', { defaultValue: 'Cancel Order' }),
      message: t('orderStatus.cancelConfirmMessage', { defaultValue: 'Are you sure you want to cancel this order?' }),
      confirmText: t('common.cancel'),
      cancelText: t('orderStatus.keepOrder', { defaultValue: 'Keep order' }),
      variant: 'danger',
      onConfirm: async () => {
        const success = await handleCancel();
        if (!success && error) {
          modal.show({
            title: t('common.error'),
            message: error,
            confirmText: t('common.ok', { defaultValue: 'OK' }),
          });
        }
      },
    });
  }, [handleCancel, error, t, modal]);

  const onCheckin = useCallback(async () => {
    const success = await handleCheckin();
    if (!success && error) {
      modal.show({
        title: t('common.error'),
        message: error,
        confirmText: t('common.ok', { defaultValue: 'OK' }),
      });
    }
  }, [handleCheckin, error, t, modal]);

  const onShareReceipt = useCallback(() => {
    modal.show({
      title: t('orderStatus.shareReceipt'),
      message: t('transaction.detail.shareComingSoon'),
      confirmText: t('common.ok', { defaultValue: 'OK' }),
    });
  }, [modal, t]);

  // Build timeline from order status
  const statusToStep = (targetStatus: string, currentStatus: string) => {
    const ORDER = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
    const currentIdx = ORDER.indexOf(currentStatus);
    const targetIdx = ORDER.indexOf(targetStatus);
    if (currentStatus === 'CANCELLED') return 'PENDING' as const;
    if (targetIdx < currentIdx) return 'COMPLETED' as const;
    if (targetIdx === currentIdx) return 'ACTIVE' as const;
    return 'PENDING' as const;
  };

  const TIMELINE_STEPS = [
    { label: t('orderStatus.paid'), time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : null, status: statusToStep('PENDING', order.status) },
    { label: t('orderStatus.accepted'), time: (order as { acceptedAt?: string | null }).acceptedAt ? new Date((order as { acceptedAt: string }).acceptedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : null, status: statusToStep('ACCEPTED', order.status) },
    { label: t('orderStatus.preparing'), time: null, status: statusToStep('PREPARING', order.status) },
    { label: t('orderStatus.ready'), time: null, status: statusToStep('READY', order.status) },
    { label: t('orderStatus.completed'), time: (order as { completedAt?: string | null }).completedAt ? new Date((order as { completedAt: string }).completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : null, status: statusToStep('COMPLETED', order.status) },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Success banner */}
      <LinearGradient
        colors={[colors.success, '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="items-center"
        style={{ paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.sectionGap, paddingTop: 48 }}
      >
        <CheckCircle size={56} color={colors.textInverse} strokeWidth={1.5} />
        <Text style={{ ...typography.sectionTitle, color: colors.textInverse, marginTop: spacing.elementGap }}>{t('orderStatus.success')}</Text>
        <Text style={{ ...typography.body, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs }}>
          {'merchantName' in order ? (order as { merchantName: string }).merchantName : ''}
        </Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: 24, gap: spacing.lg }}
      >
        {/* Timeline card */}
        <View style={{ ...components.card, padding: spacing.cardPadding }}>
          <StatusTimeline steps={TIMELINE_STEPS} />
        </View>

        {/* Order details card */}
        <View style={{ ...components.card, padding: spacing.cardPadding, gap: spacing.elementGap }}>
          {/* Items */}
          <View style={{ gap: spacing.sm }}>
            {order.items.map((item) => {
              const displayName = 'menuItemName' in item
                ? (item as { menuItemName: string }).menuItemName
                : 'nameVi' in item
                  ? (item as { nameVi: string }).nameVi
                  : '';
              return (
                <View key={item.id} className="flex-row items-center justify-between">
                  <Text style={{ ...typography.body, color: colors.textPrimary }}>
                    {item.quantity}x {displayName}
                  </Text>
                  <Text style={typography.body}>
                    {formatVnd(item.unitPriceVnd * item.quantity)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Divider */}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.divider }} />

          {/* Total */}
          <View className="flex-row items-center justify-between">
            <Text style={{ ...typography.body, fontWeight: '600', color: colors.textPrimary }}>{t('common.total')}</Text>
            <Text style={{ ...typography.body, fontWeight: '700', color: colors.textPrimary }}>
              {formatVnd(order.totalAmountVnd)}
            </Text>
          </View>

          {/* Company share */}
          <Text style={{ fontSize: 13, fontWeight: '400', color: colors.primary }}>
            {t('orderStatus.companyShare')}: {formatVnd(order.companyShareVnd)} (
            {Math.round((order.companyShareVnd / order.totalAmountVnd) * 100)}%)
          </Text>
        </View>

        {/* Info row */}
        <View style={{ ...components.card, padding: spacing.cardPadding, gap: spacing.sm }}>
          <View className="flex-row items-center" style={{ gap: spacing.elementGap }}>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <MapPin size={14} color={colors.textTertiary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t('orderStatus.table')} {order.tableNo}</Text>
            </View>
            <Text style={{ color: colors.textPlaceholder }}>·</Text>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Clock size={14} color={colors.textTertiary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t('orderStatus.scheduledTime')} 12:00</Text>
            </View>
          </View>
          <Text style={typography.caption}>{t('orderStatus.orderCode')} #{order.id}</Text>
        </View>

        {/* Action buttons */}
        <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
          <Pressable
            onPress={() => navigation.navigate('Main')}
            className="flex-row w-full items-center justify-center"
            style={{ height: 52, gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.primary }}
          >
            <Home size={18} color={colors.textInverse} />
            <Text style={{ ...typography.button, color: colors.textInverse }}>{t('orderStatus.goHome')}</Text>
          </Pressable>

          {/* QR Check-in — only for DINE_IN orders that haven't checked in yet */}
          {order.diningType === 'DINE_IN' && !(order as { checkedInAt?: string | null }).checkedInAt && (
            <Pressable
              onPress={onCheckin}
              disabled={checkingIn}
              className="flex-row w-full items-center justify-center"
              style={{ height: 48, gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite, opacity: checkingIn ? 0.5 : 1 }}
            >
              {checkingIn ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <QrCode size={16} color={colors.primary} />
              )}
              <Text style={{ ...typography.body, fontWeight: '500', color: colors.primary }}>
                {t('orderStatus.checkin', { defaultValue: 'QR Check-in' })}
              </Text>
            </Pressable>
          )}

          {/* Cancel — only for cancellable statuses */}
          {['PENDING', 'ACCEPTED'].includes(order.status) && (
            <Pressable
              onPress={onCancel}
              disabled={cancelling}
              className="flex-row w-full items-center justify-center"
              style={{ height: 48, gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.dangerLight, backgroundColor: colors.bgWhite, opacity: cancelling ? 0.5 : 1 }}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <X size={16} color={colors.danger} />
              )}
              <Text style={{ ...typography.body, fontWeight: '500', color: colors.danger }}>
                {t('common.cancel')}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={onShareReceipt}
            className="flex-row w-full items-center justify-center"
            style={{ height: 48, gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite }}
          >
            <Share2 size={16} color={colors.textPrimary} />
            <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>{t('orderStatus.shareReceipt')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
