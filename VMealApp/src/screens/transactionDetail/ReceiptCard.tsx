import { View, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { formatVnd, formatDateTime } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import type { MockMealTransaction } from '@shared/mock/types';

interface ReceiptCardProps {
  transaction: MockMealTransaction;
  merchantAddress: string;
}

function DetailRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-gray-400">{label}</Text>
      <Text className={`text-sm font-medium ${valueClassName ?? 'text-gray-900'}`}>{value}</Text>
    </View>
  );
}

export function ReceiptCard({ transaction, merchantAddress }: ReceiptCardProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top - Success section */}
      <View className="flex-col items-center px-5 pt-6 pb-5">
        <View className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
          <CheckCircle size={28} color="#10B981" />
        </View>
        <Text className="mt-3 text-lg font-semibold text-gray-900">{t('transaction.detail.success')}</Text>
        <Text className="mt-1 text-3xl font-bold text-gray-900">{formatVnd(transaction.amountVnd)}</Text>
        <Text className="mt-1 text-xs text-gray-400">{formatDateTime(transaction.createdAt)}</Text>
      </View>

      {/* Dashed divider */}
      <View className="mx-5 border-t border-gray-200" style={{ borderStyle: 'dashed' }} />

      {/* Detail rows */}
      <View className="px-5 py-3">
        <DetailRow label={t('transaction.detail.restaurant')} value={transaction.branchName || transaction.merchantName} />
        <DetailRow label={t('transaction.detail.address')} value={merchantAddress} />
        <DetailRow label={t('transaction.detail.type')} value={t('transaction.payment')} />
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-sm text-gray-400">{t('transaction.detail.status')}</Text>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <Text className="text-sm font-medium text-[#10B981]">
              {t('transaction.detail.approved')}
            </Text>
          </View>
        </View>
      </View>

      {/* Dashed divider */}
      <View className="mx-5 border-t border-gray-200" style={{ borderStyle: 'dashed' }} />

      {/* Payment breakdown */}
      <View className="px-5 py-3">
        <DetailRow label={t('common.total')} value={formatVnd(transaction.amountVnd)} valueClassName="text-gray-900 font-bold" />
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-sm text-gray-400">{t('transaction.company')}</Text>
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-[#3B82F6]">
              {formatVnd(transaction.companyShareVnd)}{' '}
            </Text>
            <Text className="text-sm text-gray-400 font-normal">
              ({Math.round((transaction.companyShareVnd / transaction.amountVnd) * 100)}%)
            </Text>
          </View>
        </View>
        <DetailRow label={t('transaction.personal')} value={formatVnd(transaction.employeeShareVnd)} />
      </View>

      {/* Dashed divider */}
      <View className="mx-5 border-t border-gray-200" style={{ borderStyle: 'dashed' }} />

      {/* Reference info */}
      <View className="px-5 py-3">
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-xs text-gray-400">{t('transaction.detail.policy')}</Text>
          <Text className="text-xs text-gray-500">{transaction.policyName ?? '—'}</Text>
        </View>
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-xs text-gray-400">{t('transaction.detail.transactionId')}</Text>
          <Text className="text-xs text-gray-500">{transaction.id}</Text>
        </View>
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-xs text-gray-400">{t('transaction.detail.orderId')}</Text>
          <Text className="text-xs text-gray-500">{transaction.orderId ?? '—'}</Text>
        </View>
      </View>
    </View>
  );
}
