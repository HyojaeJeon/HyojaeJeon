import { View, Text, Pressable } from 'react-native';
import { formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

interface PaymentSummaryProps {
  totalVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  gpsVerified: boolean;
}

export function PaymentSummary({
  totalVnd,
  companyShareVnd,
  employeeShareVnd,
  gpsVerified,
}: PaymentSummaryProps) {
  const { t } = useTranslation();
  const companyPercent = totalVnd > 0 ? Math.round((companyShareVnd / totalVnd) * 100) : 0;

  return (
    <View className="rounded-t-3xl border-t border-gray-100 bg-white px-5 pb-6 pt-4 shadow-lg">
      <Text className="text-[15px] font-semibold text-gray-900">{t('order.paymentDetails')}</Text>

      <View className="mt-3 gap-2">
        {/* Total */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] text-gray-600">{t('common.total')}</Text>
          <Text className="text-[14px] font-semibold text-gray-900">{formatVnd(totalVnd)}</Text>
        </View>

        {/* Company share */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] text-gray-600">{t('order.companyPay')}</Text>
          <Text className="text-[14px] font-medium text-[#3B82F6]">
            {formatVnd(companyShareVnd)}{' '}
            <Text className="text-[12px]">({companyPercent}%)</Text>
          </Text>
        </View>

        {/* Employee share */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] text-gray-600">{t('order.personalPay')}</Text>
          <Text className="text-[14px] text-gray-400">{formatVnd(employeeShareVnd)}</Text>
        </View>
      </View>

      {/* GPS status */}
      {gpsVerified && (
        <View className="mt-3 flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-[#10B981]" />
          <Text className="text-[12px] text-[#10B981]">{t('order.gpsVerified')}</Text>
        </View>
      )}

      {/* CTA */}
      <Pressable className="mt-4 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]">
        <Text className="text-[15px] font-semibold text-white">
          {t('order.orderBtn')} · {formatVnd(totalVnd)}
        </Text>
      </Pressable>
    </View>
  );
}
