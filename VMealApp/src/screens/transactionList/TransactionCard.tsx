import { View, Text, Pressable } from 'react-native';
import { formatVnd, formatTime } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';
import type { MockMealTransaction } from '@shared/mock/types';
import { colors, typography, spacing, shadows, radius } from '@shared/ui/tokens';

interface TransactionCardProps {
  transaction: MockMealTransaction;
  onPress?: (transaction: MockMealTransaction) => void;
}

function getAvatarColor(type: MockMealTransaction['type'], status: MockMealTransaction['status']): string {
  if (status === 'DECLINED') return 'bg-[#EF4444]';
  if (type === 'TOP_UP') return 'bg-[#10B981]';
  if (type === 'REFUND') return 'bg-[#F59E0B]';
  return 'bg-[#3B82F6]';
}

function getInitial(transaction: MockMealTransaction): string {
  if (transaction.type === 'TOP_UP') return '\u20AB';
  if (transaction.type === 'REFUND') return 'H';
  return transaction.merchantName.charAt(0);
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
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
      text: `\u2212${formatVnd(txn.amountVnd)}`,
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
    <Pressable
      onPress={() => onPress?.(transaction)}
      className="flex-row items-center active:opacity-80"
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: radius.md,
        padding: spacing.cardPaddingCompact,
        gap: spacing.md,
        ...shadows.card,
      }}
    >
      {/* Avatar */}
      <View className={`flex shrink-0 items-center justify-center rounded-full ${avatarColor}`} style={{ height: 40, width: 40 }}>
        <Text style={{ color: colors.textInverse, fontSize: 14, fontWeight: '600' }}>{initial}</Text>
      </View>

      {/* Center */}
      <View className="flex-1 min-w-0">
        <Text style={typography.cardTitle} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={{ ...typography.caption, marginTop: 2 }}>{formatTime(transaction.createdAt)}</Text>
      </View>

      {/* Right */}
      <View className="flex-col items-end shrink-0">
        <Text className={`text-sm ${amount.className}`}>{amount.text}</Text>
        {isDeclined ? (
          <View
            className="flex-row items-center"
            style={{ marginTop: 2, borderRadius: radius.full, backgroundColor: colors.dangerLight, paddingHorizontal: 8, paddingVertical: 2 }}
          >
            <Text style={{ fontSize: 10, fontWeight: '500', color: colors.danger }}>
              {t('transaction.declined')}
            </Text>
          </View>
        ) : sourceLabel ? (
          <Text style={{ fontSize: 10, color: colors.textTertiary, marginTop: 2 }}>{sourceLabel}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
