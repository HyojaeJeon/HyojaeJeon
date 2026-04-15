import { View, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { PrimaryButton } from '@shared/ui';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';

interface CompanyBindStepProps {
  onNext: () => void;
  /** Employee info retrieved from server after phone verification */
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  corporateName?: string;
}

export function CompanyBindStep({ onNext, employeeName = '', employeeCode = '', department = '', corporateName = '' }: CompanyBindStepProps) {
  const { t } = useTranslation();

  // TODO: Replace prop defaults with real data from auth verify mutation
  const INFO_ROWS = [
    { label: t('auth.companyBind.name'), value: employeeName },
    { label: t('auth.companyBind.employeeCode'), value: employeeCode },
    { label: t('auth.companyBind.department'), value: department },
    { label: t('auth.companyBind.company'), value: corporateName },
  ];

  return (
    <View className="flex flex-col" style={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xxl }}>
      {/* Step indicator */}
      <View className="flex flex-row items-center" style={{ gap: spacing.sm }}>
        <Text style={{ ...typography.caption, fontWeight: '500', color: colors.primary }}>{t('auth.step', { current: 2, total: 4 })}</Text>
      </View>
      <View style={{ marginTop: spacing.sm, height: 4, width: '100%', borderRadius: radius.full, backgroundColor: colors.border }}>
        <View style={{ height: 4, width: '50%', borderRadius: radius.full, backgroundColor: colors.primary }} />
      </View>

      {/* Title */}
      <Text style={{ ...typography.sectionTitle, fontSize: 20, fontWeight: '700', marginTop: spacing.xxl }}>
        {t('auth.companyBind.title')}
      </Text>
      <Text style={{ ...typography.body, marginTop: spacing.sm }}>
        Ki{'\u1EC3'}m tra th{'\u00F4'}ng tin nh{'\u00E2'}n vi{'\u00EA'}n {'\u0111'}{'\u01B0'}{'\u1EE3'}c li{'\u00EA'}n k{'\u1EBF'}t
      </Text>

      {/* Info card */}
      <View style={{ marginTop: spacing.xxl, borderRadius: radius.xl, backgroundColor: colors.bgCard, padding: spacing.cardPaddingCompact, ...shadows.card }}>
        <View style={{ gap: spacing.lg }}>
          {INFO_ROWS.map((row) => (
            <View key={row.label}>
              <Text style={typography.caption}>{row.label}</Text>
              <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary, marginTop: 2 }}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Success badge */}
      <View className="flex flex-row items-center" style={{ marginTop: spacing.cardPadding, gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.successLight, paddingHorizontal: spacing.lg, paddingVertical: spacing.elementGap }}>
        <CheckCircle size={18} color={colors.success} />
        <Text style={{ ...typography.body, fontWeight: '500', color: colors.success }}>
          {t('auth.companyBind.matchSuccess')}
        </Text>
      </View>

      {/* Continue button */}
      <View style={{ marginTop: spacing.sectionGap }}>
        <PrimaryButton
          title={t('common.continue')}
          onPress={onNext}
          size="lg"
          className="w-full"
        />
      </View>
    </View>
  );
}
