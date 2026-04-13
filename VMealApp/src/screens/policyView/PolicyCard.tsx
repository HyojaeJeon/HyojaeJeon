import { View, Text } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import type { MockMealPolicy } from '@shared/mock/types';

interface PolicyCardProps {
  policy: MockMealPolicy;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs text-gray-400">{label}</Text>
      <Text className="text-sm font-medium text-gray-900 mt-0.5">{value}</Text>
    </View>
  );
}

export function PolicyCard({ policy }: PolicyCardProps) {
  const { t } = useTranslation();

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

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Top row */}
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full bg-[#10B981]" />
        <Text className="text-xs font-medium text-[#10B981]">{t('policy.active')}</Text>
      </View>
      <Text className="text-[16px] font-semibold text-gray-900 mt-1.5">{policy.nameVi}</Text>

      {/* Divider */}
      <View className="border-t border-gray-100 my-3" />

      {/* Grid info */}
      <View className="flex-row flex-wrap">
        <View className="w-1/2 mb-3 pr-2">
          <InfoItem label={t('policy.limitPerTxn')} value={formatVnd(policy.maxAmountPerTxnVnd)} />
        </View>
        <View className="w-1/2 mb-3 pl-2">
          <InfoItem label={t('policy.dailyLimit')} value={formatVnd(policy.dailyLimitVnd)} />
        </View>
        <View className="w-1/2 mb-3 pr-2">
          <InfoItem label={t('policy.timeApplied')} value={`${policy.allowedTimeStart} – ${policy.allowedTimeEnd}`} />
        </View>
        <View className="w-1/2 mb-3 pl-2">
          <InfoItem label={t('policy.daysApplied')} value={dayLabels} />
        </View>
        <View className="w-1/2 mb-3 pr-2">
          <InfoItem label={t('policy.mealType')} value={mealLabels} />
        </View>
        <View className="w-1/2 mb-3 pl-2">
          <View>
            <Text className="text-xs text-gray-400">{t('policy.hybridPayment')}</Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              {policy.hybridPaymentAllowed ? (
                <>
                  <Check size={14} color="#10B981" />
                  <Text className="text-sm font-medium text-[#10B981]">{t('common.yes')}</Text>
                </>
              ) : (
                <>
                  <X size={14} color="#EF4444" />
                  <Text className="text-sm font-medium text-[#EF4444]">{t('common.no')}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Merchant categories */}
      <Text className="text-xs text-gray-400 mt-3">
        {t('policy.merchantCategories')}: {policy.merchantCategories.join(', ')}
      </Text>

      {/* Validity */}
      <Text className="text-xs text-gray-400 mt-1">
        {t('policy.validity')}: {policy.validFrom.split('-').reverse().join('/')} – {policy.validTo.split('-').reverse().join('/')}
      </Text>
    </View>
  );
}
