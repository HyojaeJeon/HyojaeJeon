import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { MapPin, Clock, Check } from 'lucide-react-native';
import { AppHeader, useModal, PrimaryButton } from '@shared/ui';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { formatVnd } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { ParticipantList } from './ParticipantList';
import { useGroupPayData } from './useGroupPayData';

type SplitMethod = 'EQUAL' | 'CUSTOM';

const TOTAL_AMOUNT = 350_000;
const PER_PERSON = Math.ceil(TOTAL_AMOUNT / 3);
const LAST_PERSON = TOTAL_AMOUNT - PER_PERSON * 2;

const PARTICIPANTS = [
  { initials: 'NT', name: 'Nguyen Minh Tuan', amountVnd: PER_PERSON, status: 'PAID' as const, isSelf: true },
  { initials: 'TM', name: 'Tran Thi Mai', amountVnd: PER_PERSON, status: 'PENDING' as const, isSelf: false },
  { initials: 'LH', name: 'Le Van Hung', amountVnd: LAST_PERSON, status: 'PENDING' as const, isSelf: false },
];

export default function GroupPayScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const modal = useModal();
  const { creating, handleCreateAllGroupOrders } = useGroupPayData();
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('EQUAL');

  const executePayment = useCallback(async () => {
    const orders = PARTICIPANTS.map((p) => ({
      participantName: p.name,
      input: {
        walletId: '', // Provided by auth context at runtime
        branchId: '', // Provided by route params at runtime
        diningType: 'DINE_IN',
        scheduledAt: new Date().toISOString(),
        idempotencyKey: `group-${p.name}-${Date.now()}`,
        items: [
          {
            menuItemName: 'Group order item',
            quantity: 1,
            unitPriceVnd: p.amountVnd,
          },
        ],
      },
    }));

    const results = await handleCreateAllGroupOrders(orders);
    const firstSuccess = results.find((r) => r.orderId);
    const hasError = results.some((r) => r.error);

    if (firstSuccess?.orderId) {
      navigation.navigate('OrderStatusScreen', { orderId: firstSuccess.orderId });
    }
    if (hasError) {
      const failedNames = results.filter((r) => r.error).map((r) => r.participantName).join(', ');
      modal.show({
        title: t('common.error'),
        message: `${t('groupPay.partialError', { defaultValue: 'Some orders failed' })}: ${failedNames}`,
        confirmText: t('common.ok', { defaultValue: 'OK' }),
      });
    }
  }, [handleCreateAllGroupOrders, navigation, t, modal]);

  const onStartPayment = useCallback(() => {
    modal.show({
      title: t('groupPay.confirmTitle', { defaultValue: 'Confirm Group Payment' }),
      message: t('groupPay.confirmMessage', {
        defaultValue: `Start payment for ${PARTICIPANTS.length} members?`,
        count: PARTICIPANTS.length,
      }),
      confirmText: t('groupPay.startPayment'),
      cancelText: t('common.cancel'),
      onConfirm: executePayment,
    });
  }, [modal, t, executePayment]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <AppHeader title={t('groupPay.title')} onBack={() => navigation.goBack()} />

      {/* Scrollable content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.sm, paddingBottom: 160, gap: spacing.lg }}>
        {/* Restaurant selection card */}
        <View className="flex-row items-center" style={{ gap: spacing.elementGap, borderRadius: radius.xl, backgroundColor: colors.bgCard, padding: spacing.cardPaddingCompact, ...shadows.card }}>
          <View className="flex items-center justify-center" style={{ height: 40, width: 40, borderRadius: radius.md, backgroundColor: colors.primaryLight }}>
            <MapPin size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text style={typography.cardTitle}>Pho 24 - Nguyen Hue</Text>
            <View className="flex-row items-center" style={{ marginTop: 2, gap: spacing.xs }}>
              <Clock size={12} color={colors.textTertiary} />
              <Text style={typography.caption}>{t('groupPay.todayAt')} 12:00</Text>
            </View>
          </View>
        </View>

        {/* Total amount */}
        <View className="items-center" style={{ paddingVertical: spacing.lg }}>
          <Text style={typography.caption}>{t('groupPay.totalBill')}</Text>
          <Text style={{ ...typography.displayLarge, marginTop: spacing.sm }}>{formatVnd(TOTAL_AMOUNT)}</Text>
          <View style={{ marginTop: spacing.xs, height: 2, width: 120, borderRadius: 1, backgroundColor: `${colors.primary}4D` }} />
        </View>

        {/* Split method */}
        <View style={{ gap: spacing.elementGap }}>
          <Text style={typography.cardTitle}>{t('groupPay.splitMethod')}</Text>
          <View style={{ gap: spacing.sm }}>
            {/* Option 1: Equal split */}
            <Pressable
              onPress={() => setSplitMethod('EQUAL')}
              className="flex-row w-full items-center"
              style={{
                gap: spacing.elementGap,
                borderRadius: radius.md,
                padding: spacing.cardPaddingCompact,
                borderWidth: splitMethod === 'EQUAL' ? 2 : 0,
                borderColor: splitMethod === 'EQUAL' ? colors.primary : 'transparent',
                backgroundColor: splitMethod === 'EQUAL' ? colors.primaryLight : colors.bgCard,
              }}
            >
              <View className="flex items-center justify-center" style={{ height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: splitMethod === 'EQUAL' ? colors.primary : colors.textPlaceholder }}>
                {splitMethod === 'EQUAL' && (
                  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center" style={{ gap: spacing.sm }}>
                  <Text style={typography.cardTitle}>{t('groupPay.equalSplit')}</Text>
                  {splitMethod === 'EQUAL' && <Check size={14} color={colors.primary} />}
                </View>
                <Text style={typography.caption}>{t('groupPay.equalDesc')}</Text>
              </View>
            </Pressable>

            {/* Option 2: Custom */}
            <Pressable
              onPress={() => setSplitMethod('CUSTOM')}
              className="flex-row w-full items-center"
              style={{
                gap: spacing.elementGap,
                borderRadius: radius.md,
                padding: spacing.cardPaddingCompact,
                borderWidth: splitMethod === 'CUSTOM' ? 2 : 0,
                borderColor: splitMethod === 'CUSTOM' ? colors.primary : 'transparent',
                backgroundColor: splitMethod === 'CUSTOM' ? colors.primaryLight : colors.bgCard,
              }}
            >
              <View className="flex items-center justify-center" style={{ height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: splitMethod === 'CUSTOM' ? colors.primary : colors.textPlaceholder }}>
                {splitMethod === 'CUSTOM' && (
                  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center" style={{ gap: spacing.sm }}>
                  <Text style={typography.cardTitle}>{t('groupPay.custom')}</Text>
                  {splitMethod === 'CUSTOM' && <Check size={14} color={colors.primary} />}
                </View>
                <Text style={typography.caption}>{t('groupPay.customDesc')}</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Participant list */}
        <ParticipantList participants={PARTICIPANTS} />
      </ScrollView>

      {/* Sticky bottom */}
      <View className="absolute bottom-0 left-0 right-0" style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgWhite, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.xxl, paddingTop: spacing.lg, gap: spacing.sm }}>
        <Text style={{ ...typography.caption, textAlign: 'center' }}>
          {t('groupPay.yourShare')}: {formatVnd(PER_PERSON)}
        </Text>
        <PrimaryButton
          title={t('groupPay.startPayment')}
          onPress={onStartPayment}
          variant="primary"
          size="lg"
          loading={creating}
          disabled={creating}
          className="w-full"
        />
        <Pressable
          onPress={() => navigation.goBack()}
          className="flex w-full items-center justify-center active:opacity-70"
          style={{ height: 40 }}
        >
          <Text style={{ ...typography.body, fontWeight: '500', color: colors.textTertiary }}>
            {t('common.cancel')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
