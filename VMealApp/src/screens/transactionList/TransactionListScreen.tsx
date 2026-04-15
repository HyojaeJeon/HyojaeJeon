import { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import type { MockMealTransaction } from '@shared/mock/types';
import { colors, typography, spacing } from '@shared/ui/tokens';
import { useTransactionListData } from './useTransactionListData';
import { MonthSelector } from './MonthSelector';
import { SourceFilter } from './SourceFilter';
import { TransactionCard } from './TransactionCard';

/** i18n-aware date group label */
function getDateLabel(
  dateStr: string,
  todayStr: string,
  yesterdayStr: string,
  tToday: string,
  tYesterday: string,
): string {
  if (dateStr === todayStr) {
    const parts = todayStr.split('-');
    return `${tToday} · ${parts[2]}/${parts[1]}`;
  }
  if (dateStr === yesterdayStr) {
    const parts = yesterdayStr.split('-');
    return `${tYesterday} · ${parts[2]}/${parts[1]}`;
  }
  const d = new Date(dateStr + 'T00:00:00');
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function groupByDate(
  transactions: MockMealTransaction[],
  tToday: string,
  tYesterday: string,
): { label: string; items: MockMealTransaction[] }[] {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const groups = new Map<string, MockMealTransaction[]>();
  for (const txn of transactions) {
    const dateStr = txn.createdAt.slice(0, 10);
    const label = getDateLabel(dateStr, todayStr, yesterdayStr, tToday, tYesterday);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(txn);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

/** i18n-aware month name */
function formatMonth(monthIndex: number, year: number, locale: string): string {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function TransactionListScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { transactions } = useTransactionListData();

  const [monthIndex, setMonthIndex] = useState(3);
  const [year, setYear] = useState(2026);

  const handlePrevMonth = useCallback(() => {
    setMonthIndex((prev) => {
      if (prev === 0) { setYear((y) => y - 1); return 11; }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonthIndex((prev) => {
      if (prev === 11) { setYear((y) => y + 1); return 0; }
      return prev + 1;
    });
  }, []);

  const filterOptions = [
    { key: 'all', label: t('transaction.all') },
    { key: 'payment', label: t('transaction.payment') },
    { key: 'topUp', label: t('transaction.topUp') },
    { key: 'refund', label: t('transaction.refund') },
  ];
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterPress = (label: string) => {
    const found = filterOptions.find((f) => f.label === label);
    if (found) setActiveFilter(found.key);
  };

  const filters = filterOptions.map((f) => ({
    label: f.label,
    active: f.key === activeFilter,
  }));

  const filteredTransactions =
    activeFilter === 'all'
      ? transactions
      : transactions.filter((txn) => {
          if (activeFilter === 'payment') return txn.type === 'PAYMENT';
          if (activeFilter === 'topUp') return txn.type === 'TOP_UP';
          if (activeFilter === 'refund') return txn.type === 'REFUND';
          return true;
        });

  const groups = groupByDate(
    filteredTransactions,
    t('common.today'),
    t('transaction.yesterday', { defaultValue: 'Yesterday' }),
  );

  const payments = transactions.filter((tx) => tx.type === 'PAYMENT' && tx.status === 'APPROVED');
  const totalSpent = payments.reduce((sum, tx) => sum + tx.amountVnd, 0);
  const companySpent = payments.reduce((sum, tx) => sum + tx.companyShareVnd, 0);
  const personalSpent = payments.reduce((sum, tx) => sum + tx.employeeShareVnd, 0);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg, paddingHorizontal: spacing.screenHorizontal, paddingTop: 8, paddingBottom: 24 }}
    >
      <Text style={{ ...typography.screenTitle, paddingVertical: 12 }}>{t('transaction.title')}</Text>

      <View style={{ gap: spacing.sectionGap }}>
        <MonthSelector
          month={formatMonth(monthIndex, year, i18n.language)}
          totalSpent={totalSpent}
          companySpent={companySpent}
          personalSpent={personalSpent}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <SourceFilter filters={filters} onFilterPress={handleFilterPress} />

        {groups.length === 0 ? (
          <View className="items-center" style={{ paddingVertical: spacing.sectionGap }}>
            <Text style={typography.body}>{t('transaction.empty', { defaultValue: 'No transactions yet' })}</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label} style={{ gap: spacing.sm }}>
              <Text style={{ ...typography.overline, textTransform: 'uppercase' }}>
                {group.label}
              </Text>
              <View style={{ gap: spacing.xs + 2 }}>
                {group.items.map((txn) => (
                  <TransactionCard
                    key={txn.id}
                    transaction={txn}
                    onPress={(t2) =>
                      navigation.navigate('TransactionDetailScreen', { transactionId: t2.id })
                    }
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
