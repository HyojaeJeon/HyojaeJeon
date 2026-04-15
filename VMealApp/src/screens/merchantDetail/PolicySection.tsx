import { View, Text } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { formatVnd } from '@shared/utils/format';
import type { MockMealPolicy } from '@shared/mock/types';

interface PolicySectionProps {
  policy: MockMealPolicy;
}

export function PolicySection({ policy }: PolicySectionProps) {
  const { t } = useTranslation();
  return (
    <View style={{ marginHorizontal: spacing.screenHorizontal, borderRadius: radius.xl, backgroundColor: colors.primaryLight, padding: spacing.cardPaddingCompact }}>
      <View className="flex-row items-center" style={{ gap: spacing.sm, marginBottom: spacing.elementGap }}>
        <Shield size={18} color={colors.primary} />
        <Text style={typography.cardTitle}>{t('merchant.companyPolicy')}</Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: colors.primary }} />
          <Text style={typography.body}>
            {t('merchant.limit')} {formatVnd(policy.maxAmountPerTxnVnd)}/{t('merchant.perTransaction')}
          </Text>
        </View>
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: colors.primary }} />
          <Text style={typography.body}>
            {t('merchant.timeApplied')} {policy.allowedTimeStart} – {policy.allowedTimeEnd}
          </Text>
        </View>
        <View className="flex-row items-center" style={{ gap: spacing.sm }}>
          <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: colors.primary }} />
          <Text style={typography.body}>
            {t('merchant.hybridPayment')} {policy.hybridPaymentAllowed ? t('common.yes') : t('common.no')}
          </Text>
        </View>
      </View>

      <Text style={{ ...typography.caption, marginTop: spacing.elementGap }}>
        {t('merchant.appliedPolicy', { name: policy.nameVi })}
      </Text>
    </View>
  );
}
