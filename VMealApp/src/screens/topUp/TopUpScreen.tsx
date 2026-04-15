import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Info } from 'lucide-react-native';
import { AppHeader, PrimaryButton, useModal } from '@shared/ui';
import { formatVnd } from '@shared/utils/format';
import { colors, typography, spacing, shadows, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { PresetAmounts } from './PresetAmounts';
import { PaymentMethodList } from './PaymentMethodList';
import { useTopUpData } from './useTopUpData';

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000];

export default function TopUpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { wallet, paymentMethods, loading, executeTopUp, topUpLoading } = useTopUpData();
  const { show } = useModal();

  const [selectedAmount, setSelectedAmount] = useState<number>(200_000);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  async function handleTopUp() {
    if (!selectedAmount || !selectedMethodId) return;

    try {
      await executeTopUp(selectedAmount, selectedMethodId);
      show({
        title: t('topUp.successTitle'),
        message: t('topUp.successMessage', { amount: formatVnd(selectedAmount) }),
        confirmText: t('common.ok'),
        onConfirm: () => {
          navigation.goBack();
        },
      });
    } catch {
      show({
        title: t('topUp.errorTitle'),
        message: t('topUp.errorMessage'),
        confirmText: t('common.ok'),
        variant: 'danger',
      });
    }
  }

  if (loading && !wallet) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.bg }}>
        <AppHeader title={t('topUp.title')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <AppHeader title={t('topUp.title')} />

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.sm, paddingBottom: 100, gap: spacing.lg }}
      >
        {/* Current balance card */}
        {wallet && (
        <View style={{ ...components.card, padding: spacing.cardPadding, ...shadows.balanceCard }}>
          <Text style={typography.caption}>{t('topUp.personalBalance')}</Text>
          <Text style={{ ...typography.displayMedium, marginTop: spacing.xs }}>
            {formatVnd(wallet.personalTopUpVnd)}
          </Text>
          <View className="flex-row items-start" style={{ marginTop: spacing.sm, gap: 6 }}>
            <Info size={14} color={colors.textPlaceholder} style={{ marginTop: 2, flexShrink: 0 }} />
            <Text style={typography.caption}>
              {t('topUp.personalInfo')}
            </Text>
          </View>
        </View>
        )}

        {/* Preset amounts */}
        <PresetAmounts
          amounts={PRESET_AMOUNTS}
          selected={selectedAmount}
          onSelect={setSelectedAmount}
        />

        {/* Payment methods */}
        <PaymentMethodList
          methods={paymentMethods}
          selectedId={selectedMethodId}
          onSelect={setSelectedMethodId}
        />
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{ borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.bgWhite, paddingHorizontal: spacing.screenHorizontal, paddingBottom: 24, paddingTop: spacing.lg }}
      >
        <PrimaryButton
          title={t('topUp.topUpBtn', { amount: formatVnd(selectedAmount) })}
          onPress={handleTopUp}
          size="lg"
          loading={topUpLoading}
          disabled={!selectedAmount || !selectedMethodId}
          className="w-full"
        />
      </View>
    </View>
  );
}
