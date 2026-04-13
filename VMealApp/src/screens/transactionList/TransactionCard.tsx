import { View, Text } from 'react-native';
import { formatVnd, formatTime } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import type { MockMealTransaction } from '@shared/mock/types';

interface TransactionCardProps {
  transaction: MockMealTransaction;
}

function getAvatarColor(type: MockMealTransaction['type'], status: MockMealTransaction['status']): string {
  if (status === 'DECLINED') return 'bg-[#EF4444]';
  if (type === 'TOP_UP') return 'bg-[#10B981]';
  if (type === 'REFUND') return 'bg-[#F59E0B]';
  return 'bg-[#3B82F6]';
}

function getInitial(transaction: MockMealTransaction): string {
  if (transaction.type === 'TOP_UP') return '₫';
  if (transaction.type === 'REFUND') return 'H';
  return transaction.merchantName.charAt(0);
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { t } = useTranslation();

  const getDisplayName = (txn: MockMealTransaction): string => {
    if (txn.type === 'TOP_UP') return t('wallet.personalTopUp');
    if (txn.type === 'REFUND') return t('transaction.refund');
    return txn.merchantName;
  };

  const getAmountDisplay = (txn: MockMealTransaction): { text: string; className: string } => {
    const isDeclined = txn.status === 'DECLINED';
    if (txn.type === 'TOP_UP' || txn.type === 'REFUND') {
      return {
        text: `+${formatVnd(txn.amountVnd)}`,
        className: isDeclined ? 'text-gray-400 line-through' : 'text-[#10B981] font-medium',
      };
    }
    return {
      text: `−${formatVnd(txn.amountVnd)}`,
      className: isDeclined ? 'text-gray-400 line-through' : 'text-gray-900 font-medium',
    };
  };

  const getSourceLabel = (txn: MockMealTransaction): string | null => {
    if (txn.type === 'TOP_UP') return t('transaction.personal');
    if (txn.companyShareVnd === txn.amountVnd) return t('transaction.companyFull');
    if (txn.employeeShareVnd > 0 && txn.companyShareVnd > 0) {
      const pct = Math.round((txn.companyShareVnd / txn.amountVnd) * 100);
      return `${pct}% ${t('transaction.company')}`;
    }
    if (txn.employeeShareVnd === txn.amountVnd) return t('transaction.personal');
    return null;
  };

  const avatarColor = getAvatarColor(transaction.type, transaction.status);
  const initial = getInitial(transaction);
  const displayName = getDisplayName(transaction);
  const amount = getAmountDisplay(transaction);
  const sourceLabel = getSourceLabel(transaction);
  const isDeclined = transaction.status === 'DECLINED';

  return (
    <View className="flex-row items-center gap-3 bg-white rounded-xl p-3">
      {/* Avatar */}
      <View className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor}`}>
        <Text className="text-white text-sm font-semibold">{initial}</Text>
      </View>

      {/* Center */}
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {displayName}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">{formatTime(transaction.createdAt)}</Text>
      </View>

      {/* Right */}
      <View className="flex-col items-end shrink-0">
        <Text className={`text-sm ${amount.className}`}>{amount.text}</Text>
        {isDeclined ? (
          <View className="mt-0.5 flex-row items-center rounded-full bg-[#EF4444]/10 px-2 py-0.5">
            <Text className="text-[10px] font-medium text-[#EF4444]">
              {t('transaction.declined')}
            </Text>
          </View>
        ) : sourceLabel ? (
          <Text className="text-[10px] text-gray-400 mt-0.5">{sourceLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}
