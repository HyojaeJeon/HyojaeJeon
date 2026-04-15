import { View, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { formatVnd, formatDateTime } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';
import type { MockMealTransaction } from '@shared/mock/types';

interface ReceiptCardProps {
  transaction: MockMealTransaction;
  merchantAddress: string;
}

function DetailRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <View className="flex-row items-center justify-between" style={{ paddingVertical: spacing.sm }}>
      <Text style={typography.body}>{label}</Text>
      <Text className={valueClassName} style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>{value}</Text>
    </View>
  );
}

export function ReceiptCard({ transaction, merchantAddress }: ReceiptCardProps) {
  const { t } = useTranslation();

  return (
    <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, overflow: 'hidden', ...shadows.card }}>
      {/* Top - Success section */}
      <View className="flex-col items-center" style={{ paddingHorizontal: spacing.cardPadding, paddingTop: spacing.xxl, paddingBottom: spacing.cardPadding }}>
        <View className="flex items-center justify-center" style={{ height: 56, width: 56, borderRadius: 28, backgroundColor: colors.successLight }}>
          <CheckCircle size={28} color={colors.success} />
        </View>
        <Text style={{ ...typography.sectionTitle, marginTop: spacing.elementGap }}>{t('transaction.detail.success')}</Text>
        <Text style={{ ...typography.displayLarge, marginTop: spacing.xs }}>{formatVnd(transaction.amountVnd)}</Text>
        <Text style={{ ...typography.caption, marginTop: spacing.xs }}>{formatDateTime(transaction.createdAt)}</Text>
      </View>

      {/* Dashed divider */}
      <View style={{ marginHorizontal: spacing.cardPadding, borderTopWidth: 1, borderTopColor: colors.divider, borderStyle: 'dashed' }} />

      {/* Detail rows */}
      <View style={{ paddingHorizontal: spacing.cardPadding, paddingVertical: spacing.elementGap }}>
        <DetailRow label={t('transaction.detail.restaurant')} value={transaction.branchName || transaction.merchantName} />
        <DetailRow label={t('transaction.detail.address')} value={merchantAddress} />
        <DetailRow label={t('transaction.detail.type')} value={t('transaction.payment')} />
        <View className="flex-row items-center justify-between" style={{ paddingVertical: spacing.sm }}>
          <Text style={typography.body}>{t('transaction.detail.status')}</Text>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: colors.success }} />
            <Text style={{ ...typography.body, fontWeight: '500', color: colors.success }}>
              {t('transaction.detail.approved')}
            </Text>
          </View>
        </View>
      </View>

      {/* Dashed divider */}
      <View style={{ marginHorizontal: spacing.cardPadding, borderTopWidth: 1, borderTopColor: colors.divider, borderStyle: 'dashed' }} />

      {/* Payment breakdown */}
      <View style={{ paddingHorizontal: spacing.cardPadding, paddingVertical: spacing.elementGap }}>
        <DetailRow label={t('common.total')} value={formatVnd(transaction.amountVnd)} valueClassName="font-bold" />
        <View className="flex-row items-center justify-between" style={{ paddingVertical: spacing.sm }}>
          <Text style={typography.body}>{t('transaction.company')}</Text>
          <View className="flex-row items-center">
            <Text style={{ ...typography.body, fontWeight: '500', color: colors.primary }}>
              {formatVnd(transaction.companyShareVnd)}{' '}
            </Text>
            <Text style={typography.body}>
              ({Math.round((transaction.companyShareVnd / transaction.amountVnd) * 100)}%)
            </Text>
          </View>
        </View>
        <DetailRow label={t('transaction.personal')} value={formatVnd(transaction.employeeShareVnd)} />
      </View>

      {/* Dashed divider */}
      <View style={{ marginHorizontal: spacing.cardPadding, borderTopWidth: 1, borderTopColor: colors.divider, borderStyle: 'dashed' }} />

      {/* Reference info */}
      <View style={{ paddingHorizontal: spacing.cardPadding, paddingVertical: spacing.elementGap }}>
        <View className="flex-row items-center justify-between" style={{ paddingVertical: spacing.sm }}>
          <Text style={typography.caption}>{t('transaction.detail.policy')}</Text>
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>{transaction.policyName ?? '—'}</Text>
        </View>
        <View className="flex-row items-center justify-between" style={{ paddingVertical: spacing.sm }}>
          <Text style={typography.caption}>{t('transaction.detail.transactionId')}</Text>
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>{transaction.id}</Text>
        </View>
        <View className="flex-row items-center justify-between" style={{ paddingVertical: spacing.sm }}>
          <Text style={typography.caption}>{t('transaction.detail.orderId')}</Text>
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>{transaction.orderId ?? '—'}</Text>
        </View>
      </View>
    </View>
  );
}
