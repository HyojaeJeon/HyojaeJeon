import { View, Text, ScrollView } from 'react-native';
import { MOCK_TRANSACTIONS } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { MonthSelector } from './MonthSelector';
import { SourceFilter } from './SourceFilter';
import { TransactionCard } from './TransactionCard';

/** Group transactions by date label */
function groupByDate(
  transactions: typeof MOCK_TRANSACTIONS,
): { label: string; items: typeof MOCK_TRANSACTIONS }[] {
  const groups = new Map<string, typeof MOCK_TRANSACTIONS>();
  const today = '2026-04-12';
  const yesterday = '2026-04-11';

  for (const txn of transactions) {
    const dateStr = txn.createdAt.slice(0, 10);
    let label: string;
    if (dateStr === today) {
      label = 'Hôm nay · 12/04';
    } else if (dateStr === yesterday) {
      label = 'Hôm qua · 11/04';
    } else {
      const d = new Date(txn.createdAt);
      label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(txn);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export default function TransactionListScreen() {
  const { t } = useTranslation();
  const groups = groupByDate(MOCK_TRANSACTIONS);

  // Calculate monthly summary
  const payments = MOCK_TRANSACTIONS.filter((tx) => tx.type === 'PAYMENT' && tx.status === 'APPROVED');
  const totalSpent = payments.reduce((sum, tx) => sum + tx.amountVnd, 0);
  const companySpent = payments.reduce((sum, tx) => sum + tx.companyShareVnd, 0);
  const personalSpent = payments.reduce((sum, tx) => sum + tx.employeeShareVnd, 0);

  const filters = [
    { label: t('transaction.all'), active: true },
    { label: t('transaction.payment'), active: false },
    { label: t('transaction.topUp'), active: false },
    { label: t('transaction.refund'), active: false },
  ];

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC] px-5 pt-2 pb-6">
      {/* Title */}
      <Text className="text-lg font-bold text-gray-900 py-3">Lịch sử giao dịch</Text>

      <View className="gap-4">
        {/* Month summary */}
        <MonthSelector
          month="Tháng 4, 2026"
          totalSpent={totalSpent}
          companySpent={companySpent}
          personalSpent={personalSpent}
        />

        {/* Source filter */}
        <SourceFilter filters={filters} />

        {/* Transaction groups */}
        {groups.map((group) => (
          <View key={group.label} className="gap-2">
            <Text className="text-xs font-semibold uppercase text-gray-400 tracking-wide">
              {group.label}
            </Text>
            <View className="gap-1.5">
              {group.items.map((txn) => (
                <TransactionCard key={txn.id} transaction={txn} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
