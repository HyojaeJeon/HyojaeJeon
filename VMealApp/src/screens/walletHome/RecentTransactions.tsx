import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Receipt } from 'lucide-react-native';
import { formatVnd, formatTime } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { Card } from '@shared/ui';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';
import type { MockMealTransaction } from '@shared/mock/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** First-letter circle avatar for merchant */
function MerchantAvatar({ name, type }: { name: string; type: string }) {
  const isTopUp = type === 'TOP_UP';
  const letter = isTopUp ? '+' : name.charAt(0).toUpperCase();
  const bgColor = isTopUp ? colors.successLight : colors.primaryLight;
  const textColor = isTopUp ? colors.success : colors.primary;

  return (
    <View
      className="flex-shrink-0 items-center justify-center"
      style={{
        width: components.avatar.md.size,
        height: components.avatar.md.size,
        borderRadius: radius.full,
        backgroundColor: bgColor,
      }}
    >
      <Text style={{ fontSize: components.avatar.md.fontSize, fontWeight: '700', color: textColor }}>
        {letter}
      </Text>
    </View>
  );
}

interface RecentTransactionsProps {
  transactions: MockMealTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View>
      {/* Section header */}
      <View className="flex flex-row items-center justify-between">
        <Text style={typography.sectionTitle}>
          {t('wallet.recentTxn')}
        </Text>
        <Pressable
          className="flex flex-row items-center"
          style={{ gap: spacing.xs }}
          onPress={() => navigation.navigate('Main', { screen: 'TransactionList' } as never)}
        >
          <Text style={[typography.body, { color: colors.primary, fontWeight: '500' }]}>
            {t('common.viewAll')}
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Transaction rows */}
      {transactions.length === 0 ? (
        <View style={{ marginTop: spacing.lg, alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg }}>
          <Receipt size={32} color={colors.textTertiary} />
          <Text style={[typography.body, { color: colors.textTertiary }]}>
            {t('wallet.noRecentTxn')}
          </Text>
        </View>
      ) : (
      <View style={{ marginTop: spacing.md, gap: spacing.itemGap }}>
        {transactions.map((txn) => {
          const isTopUp = txn.type === 'TOP_UP';
          const displayName = isTopUp ? t('wallet.personalTopUp') : txn.merchantName;
          const amountPrefix = isTopUp ? '+' : '\u2212';
          const amountColor = isTopUp ? colors.success : colors.textPrimary;

          return (
            <Pressable
              key={txn.id}
              onPress={() =>
                navigation.navigate('TransactionDetailScreen', {
                  transactionId: txn.id,
                })
              }
            >
              <Card style={{ padding: spacing.cardPaddingCompact }}>
                <View className="flex flex-row items-center" style={{ gap: spacing.md }}>
                  <MerchantAvatar name={txn.merchantName} type={txn.type} />

                  {/* Info */}
                  <View className="flex-1 min-w-0" style={{ gap: spacing.xs }}>
                    <Text style={typography.cardTitle} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text style={typography.caption}>{formatTime(txn.createdAt)}</Text>
                  </View>

                  {/* Amount + split badge */}
                  <View className="flex flex-col items-end flex-shrink-0" style={{ gap: spacing.xs }}>
                    <Text style={[typography.cardTitle, { color: amountColor }]}>
                      {amountPrefix}{formatVnd(txn.amountVnd)}
                    </Text>
                    {!isTopUp && txn.employeeShareVnd > 0 && (
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '500',
                          color: colors.warning,
                          backgroundColor: colors.warningLight,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: radius.sm,
                          overflow: 'hidden',
                        }}
                      >
                        {t('transaction.personal')}: {formatVnd(txn.employeeShareVnd)}
                      </Text>
                    )}
                    {!isTopUp && txn.employeeShareVnd === 0 && (
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '500',
                          color: colors.primary,
                          backgroundColor: colors.primaryLight,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: radius.sm,
                          overflow: 'hidden',
                        }}
                      >
                        {t('transaction.companyFull')}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
      )}
    </View>
  );
}
