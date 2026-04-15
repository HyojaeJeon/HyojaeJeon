import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '@shared/ui/tokens';
import { formatVnd } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';
import type { MockMealPolicy } from '@shared/mock/types';

interface PolicyCardProps {
  policy: MockMealPolicy;
  defaultExpanded?: boolean;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={typography.caption}>{label}</Text>
      <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

export function PolicyCard({ policy, defaultExpanded = false }: PolicyCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const dayLabels = policy.allowedDays.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => policy.allowedDays.includes(d))
    ? t('policy.monFri')
    : policy.allowedDays.map((d) => {
        const DAY_LABELS: Record<number, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' };
        return DAY_LABELS[d] ?? `${d}`;
      }).join(' – ');

  const MEAL_TYPE_KEYS: Record<string, string> = {
    BREAKFAST: 'policy.breakfast',
    LUNCH: 'policy.lunch',
    DINNER: 'policy.dinner',
  };
  const mealLabels = policy.mealTypes.map((m) => t(MEAL_TYPE_KEYS[m] ?? m)).join(', ');

  const ChevronIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, overflow: 'hidden', ...shadows.card }}>
      {/* Header — always visible, tappable */}
      <Pressable
        className="active:bg-gray-50"
        style={{ padding: spacing.cardPadding }}
        onPress={() => setExpanded((v) => !v)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center" style={{ gap: spacing.sm }}>
              <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: colors.success }} />
              <Text style={{ ...typography.caption, fontWeight: '500', color: colors.success }}>{t('policy.active')}</Text>
            </View>
            <Text style={{ ...typography.cardTitle, fontSize: 16, marginTop: 6 }}>{policy.nameVi}</Text>
          </View>
          <ChevronIcon size={20} color={colors.textTertiary} />
        </View>
      </Pressable>

      {/* Detail grid — collapsible */}
      {expanded && (
        <View style={{ paddingHorizontal: spacing.cardPadding, paddingBottom: spacing.cardPadding }}>
          {/* Divider */}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginBottom: spacing.elementGap }} />

          {/* Grid info */}
          <View className="flex-row flex-wrap">
            <View style={{ width: '50%', marginBottom: spacing.elementGap, paddingRight: spacing.sm }}>
              <InfoItem label={t('policy.limitPerTxn')} value={formatVnd(policy.maxAmountPerTxnVnd)} />
            </View>
            <View style={{ width: '50%', marginBottom: spacing.elementGap, paddingLeft: spacing.sm }}>
              <InfoItem label={t('policy.dailyLimit')} value={formatVnd(policy.dailyLimitVnd)} />
            </View>
            <View style={{ width: '50%', marginBottom: spacing.elementGap, paddingRight: spacing.sm }}>
              <InfoItem label={t('policy.timeApplied')} value={`${policy.allowedTimeStart} – ${policy.allowedTimeEnd}`} />
            </View>
            <View style={{ width: '50%', marginBottom: spacing.elementGap, paddingLeft: spacing.sm }}>
              <InfoItem label={t('policy.daysApplied')} value={dayLabels} />
            </View>
            <View style={{ width: '50%', marginBottom: spacing.elementGap, paddingRight: spacing.sm }}>
              <InfoItem label={t('policy.mealType')} value={mealLabels} />
            </View>
            <View style={{ width: '50%', marginBottom: spacing.elementGap, paddingLeft: spacing.sm }}>
              <View>
                <Text style={typography.caption}>{t('policy.hybridPayment')}</Text>
                <View className="flex-row items-center" style={{ gap: spacing.xs, marginTop: 2 }}>
                  {policy.hybridPaymentAllowed ? (
                    <>
                      <Check size={14} color={colors.success} />
                      <Text style={{ ...typography.body, fontWeight: '500', color: colors.success }}>{t('common.yes')}</Text>
                    </>
                  ) : (
                    <>
                      <X size={14} color={colors.danger} />
                      <Text style={{ ...typography.body, fontWeight: '500', color: colors.danger }}>{t('common.no')}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Merchant categories */}
          <Text style={{ ...typography.caption, marginTop: spacing.elementGap }}>
            {t('policy.merchantCategories')}: {policy.merchantCategories.join(', ')}
          </Text>

          {/* Validity */}
          <Text style={{ ...typography.caption, marginTop: spacing.xs }}>
            {t('policy.validity')}: {policy.validFrom.split('-').reverse().join('/')} – {policy.validTo.split('-').reverse().join('/')}
          </Text>
        </View>
      )}
    </View>
  );
}
