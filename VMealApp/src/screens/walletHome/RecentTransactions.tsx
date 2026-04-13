import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { MOCK_TRANSACTIONS, formatVnd, formatTime } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

/** First-letter circle avatar for merchant */
function MerchantAvatar({ name, type }: { name: string; type: string }) {
  const isTopUp = type === 'TOP_UP';
  const letter = isTopUp ? '+' : name.charAt(0).toUpperCase();
  const bg = isTopUp ? 'bg-emerald-100' : 'bg-blue-100';
  const text = isTopUp ? 'text-emerald-600' : 'text-blue-600';

  return (
    <View className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bg}`}>
      <Text className={`text-sm font-bold ${text}`}>{letter}</Text>
    </View>
  );
}

export function RecentTransactions() {
  const { t } = useTranslation();
  const transactions = MOCK_TRANSACTIONS.slice(0, 4);

  return (
    <View>
      {/* Section header */}
      <View className="flex flex-row items-center justify-between">
        <Text className="text-[15px] font-semibold text-gray-900">
          {t('wallet.recentTxn')}
        </Text>
        <Pressable className="flex flex-row items-center gap-0.5">
          <Text className="text-xs font-medium text-[#3B82F6]">
            {t('common.viewAll')}
          </Text>
          <ChevronRight size={14} color="#3B82F6" />
        </Pressable>
      </View>

      {/* Transaction rows */}
      <View className="mt-3 gap-1">
        {transactions.map((txn) => {
          const isTopUp = txn.type === 'TOP_UP';
          const displayName = isTopUp ? t('wallet.personalTopUp') : txn.merchantName;
          const amountPrefix = isTopUp ? '+' : '\u2212';
          const amountColor = isTopUp ? 'text-emerald-500' : 'text-gray-900';

          return (
            <View
              key={txn.id}
              className="flex flex-row items-center gap-3 rounded-xl px-1 py-2.5"
            >
              <MerchantAvatar name={txn.merchantName} type={txn.type} />

              {/* Info */}
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                  {displayName}
                </Text>
                <Text className="text-xs text-gray-400">{formatTime(txn.createdAt)}</Text>
              </View>

              {/* Amount + split badge */}
              <View className="flex flex-col items-end flex-shrink-0">
                <Text className={`text-sm font-semibold ${amountColor}`}>
                  {amountPrefix}{formatVnd(txn.amountVnd)}
                </Text>
                {!isTopUp && txn.employeeShareVnd > 0 && (
                  <Text className="mt-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                    {t('transaction.personal')}: {formatVnd(txn.employeeShareVnd)}
                  </Text>
                )}
                {!isTopUp && txn.employeeShareVnd === 0 && (
                  <Text className="mt-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
                    {t('transaction.companyFull')}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
