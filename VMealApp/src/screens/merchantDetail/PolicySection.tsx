import { View, Text } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { formatVnd } from '@shared/mock/mockData';
import type { MockMealPolicy } from '@shared/mock/types';

interface PolicySectionProps {
  policy: MockMealPolicy;
}

export function PolicySection({ policy }: PolicySectionProps) {
  const { t } = useTranslation();
  return (
    <View className="mx-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <View className="flex-row items-center gap-2 mb-3">
        <Shield size={18} color="#3B82F6" />
        <Text className="text-sm font-semibold text-gray-900">{t('merchant.companyPolicy')}</Text>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <View className="h-1 w-1 rounded-full bg-[#3B82F6]" />
          <Text className="text-sm text-gray-700">
            {t('merchant.limit')} {formatVnd(policy.maxAmountPerTxnVnd)}/{t('merchant.perTransaction')}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-1 w-1 rounded-full bg-[#3B82F6]" />
          <Text className="text-sm text-gray-700">
            {t('merchant.timeApplied')} {policy.allowedTimeStart} – {policy.allowedTimeEnd}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-1 w-1 rounded-full bg-[#3B82F6]" />
          <Text className="text-sm text-gray-700">
            {t('merchant.hybridPayment')} {policy.hybridPaymentAllowed ? t('common.yes') : t('common.no')}
          </Text>
        </View>
      </View>

      <Text className="mt-3 text-xs text-gray-400">
        {t('merchant.appliedPolicy', { name: policy.nameVi })}
      </Text>
    </View>
  );
}
