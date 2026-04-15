import { View, Text } from 'react-native';
import { Card, PrimaryButton } from '@shared/ui';
import { formatVnd } from '@shared/utils/format';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';

interface PaymentSummaryProps {
  totalVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  gpsVerified: boolean;
  onOrder?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PaymentSummary({
  totalVnd,
  companyShareVnd,
  employeeShareVnd,
  gpsVerified,
  onOrder,
  loading = false,
  disabled = false,
}: PaymentSummaryProps) {
  const { t } = useTranslation();
  const companyPercent = totalVnd > 0 ? Math.round((companyShareVnd / totalVnd) * 100) : 0;

  return (
    <Card
      className="rounded-b-none rounded-t-3xl border-t border-gray-100"
      style={{ paddingHorizontal: spacing.screenHorizontal, paddingBottom: 24, paddingTop: spacing.lg }}
    >
      <Text style={typography.cardTitle}>{t('order.paymentDetails')}</Text>

      <View style={{ marginTop: spacing.elementGap, gap: spacing.sm }}>
        {/* Total */}
        <View className="flex-row items-center justify-between">
          <Text style={typography.body}>{t('common.total')}</Text>
          <Text style={{ ...typography.body, fontWeight: '600', color: colors.textPrimary }}>{formatVnd(totalVnd)}</Text>
        </View>

        {/* Company share */}
        <View className="flex-row items-center justify-between">
          <Text style={typography.body}>{t('order.companyPay')}</Text>
          <Text style={{ ...typography.body, fontWeight: '500', color: colors.primary }}>
            {formatVnd(companyShareVnd)}{' '}
            <Text style={typography.caption}>({companyPercent}%)</Text>
          </Text>
        </View>

        {/* Employee share */}
        <View className="flex-row items-center justify-between">
          <Text style={typography.body}>{t('order.personalPay')}</Text>
          <Text style={{ ...typography.body, color: colors.textTertiary }}>{formatVnd(employeeShareVnd)}</Text>
        </View>
      </View>

      {/* GPS status */}
      {gpsVerified && (
        <View className="flex-row items-center" style={{ marginTop: spacing.elementGap, gap: 6 }}>
          <View style={{ height: 8, width: 8, borderRadius: radius.full, backgroundColor: colors.success }} />
          <Text style={{ ...typography.caption, color: colors.success }}>{t('order.gpsVerified')}</Text>
        </View>
      )}

      {/* CTA */}
      <View style={{ marginTop: spacing.lg }}>
        <PrimaryButton
          title={loading ? '' : `${t('order.orderBtn')} · ${formatVnd(totalVnd)}`}
          onPress={onOrder ?? (() => {})}
          variant="primary"
          size="lg"
          loading={loading}
          disabled={disabled}
          className="w-full"
        />
      </View>
    </Card>
  );
}
