import { View, Text, Pressable } from 'react-native';
import { Eye } from 'lucide-react-native';
import { formatVnd } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';
import type { MockMealWallet } from '@shared/mock/types';
import { Card } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';

interface BalanceCardProps {
  wallet: MockMealWallet | null;
}

export function BalanceCard({ wallet }: BalanceCardProps) {
  const { t } = useTranslation();

  if (!wallet) return null;

  const {
    balanceVnd,
    companyAllowanceVnd,
    personalTopUpVnd,
    dailySpentVnd,
    dailyLimitVnd,
  } = wallet;

  const spentRatio = Math.min(dailySpentVnd / dailyLimitVnd, 1);

  return (
    <Card variant="balance" style={{ padding: spacing.cardPadding }}>
      {/* Top row: label + eye */}
      <View className="flex flex-row items-center justify-between">
        <Text style={[typography.overline, { color: colors.textTertiary }]}>
          {t('wallet.balance')}
        </Text>
        <Pressable
          className="items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.full,
            backgroundColor: colors.primaryLight,
          }}
        >
          <Eye size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Main balance */}
      <Text style={[typography.displayLarge, { color: colors.primary, marginTop: spacing.sm }]}>
        {formatVnd(balanceVnd)}
      </Text>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.border, marginTop: spacing.lg, marginBottom: spacing.md }} />

      {/* Company / Personal split */}
      <View style={{ gap: spacing.sm }}>
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center" style={{ gap: spacing.sm }}>
            <View style={{ width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.primary }} />
            <Text style={typography.body}>{t('wallet.companyFund')}</Text>
          </View>
          <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>
            {formatVnd(companyAllowanceVnd)}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center" style={{ gap: spacing.sm }}>
            <View style={{ width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.success }} />
            <Text style={typography.body}>{t('wallet.personalFund')}</Text>
          </View>
          <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>
            {formatVnd(personalTopUpVnd)}
          </Text>
        </View>
      </View>

      {/* Daily progress */}
      <View style={{ marginTop: spacing.lg }}>
        <View className="flex flex-row items-center justify-between">
          <Text style={typography.caption}>{t('wallet.todaySpent')}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
            {formatVnd(dailySpentVnd)} / {formatVnd(dailyLimitVnd)}
          </Text>
        </View>
        <View
          style={{
            marginTop: spacing.sm,
            height: 6,
            borderRadius: radius.full,
            backgroundColor: colors.primaryLight,
          }}
        >
          <View
            style={{
              height: 6,
              borderRadius: radius.full,
              backgroundColor: colors.primary,
              width: `${spentRatio * 100}%`,
            }}
          />
        </View>
      </View>
    </Card>
  );
}
