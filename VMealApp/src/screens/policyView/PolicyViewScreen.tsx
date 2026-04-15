import { View, Text, ScrollView } from 'react-native';
import { Info } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { usePolicyViewData } from './usePolicyViewData';
import { PolicyCard } from './PolicyCard';

export default function PolicyViewScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { policies, employee, loading } = usePolicyViewData();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('policy.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ gap: spacing.lg }}>
          {/* Info banner */}
          <View className="flex-row" style={{ gap: spacing.elementGap, borderRadius: radius.md, borderWidth: 1, borderColor: `${colors.primary}1A`, backgroundColor: colors.primaryLight, padding: spacing.cardPaddingCompact }}>
            <Info size={18} color={colors.primary} />
            <Text style={{ ...typography.caption, color: colors.textSecondary, lineHeight: 18, flex: 1 }}>
              {t('policy.banner', { company: employee?.corporateName ?? '' })}
            </Text>
          </View>

          {/* Policy cards — first one expanded by default */}
          {policies.length === 0 && !loading && (
            <Text style={{ ...typography.body, textAlign: 'center', color: colors.textTertiary, paddingVertical: spacing.xxl }}>
              {t('policy.noPolicies')}
            </Text>
          )}
          {policies.map((policy, idx) => (
            <PolicyCard key={policy.id} policy={policy} defaultExpanded={idx === 0} />
          ))}

          {/* Footer note */}
          <Text style={{ ...typography.caption, textAlign: 'center', paddingTop: spacing.sm }}>
            {t('policy.contactAdmin')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
