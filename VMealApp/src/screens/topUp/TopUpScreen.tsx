import { View, Text, ScrollView, Pressable } from 'react-native';
import { Info } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { MOCK_WALLET, MOCK_PAYMENT_METHODS, formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { PresetAmounts } from './PresetAmounts';
import { PaymentMethodList } from './PaymentMethodList';

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000];
const SELECTED_AMOUNT = 200_000;

export default function TopUpScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title={t('topUp.title')} onBack={() => {}} />

      {/* Scrollable content */}
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-2 pb-[100px] gap-4">
        {/* Current balance card */}
        <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <Text className="text-[13px] text-gray-400">{t('topUp.personalBalance')}</Text>
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            {formatVnd(MOCK_WALLET.personalTopUpVnd)}
          </Text>
          <View className="mt-2 flex-row items-start gap-1.5">
            <Info size={14} color="#D1D5DB" className="mt-0.5 flex-shrink-0" />
            <Text className="text-xs text-gray-400">
              {t('topUp.personalInfo')}
            </Text>
          </View>
        </View>

        {/* Preset amounts */}
        <PresetAmounts amounts={PRESET_AMOUNTS} selected={SELECTED_AMOUNT} />

        {/* Payment methods */}
        <PaymentMethodList methods={MOCK_PAYMENT_METHODS} selectedId="pm-001" />
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pb-6 pt-4">
        <Pressable className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]">
          <Text className="text-[15px] font-semibold text-white">
            {t('topUp.topUpBtn', { amount: formatVnd(SELECTED_AMOUNT) })}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
