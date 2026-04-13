'use client';

import { Check, X } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMealPolicy } from '../../types';

interface PolicyCardProps {
  policy: MockMealPolicy;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

export function PolicyCard({ policy }: PolicyCardProps) {
  const { t } = useVmealT();

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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Top row */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#10B981]" />
        <span className="text-xs font-medium text-[#10B981]">{t('policy.active')}</span>
      </div>
      <p className="text-[16px] font-semibold text-gray-900 mt-1.5">{policy.nameVi}</p>

      {/* Divider */}
      <div className="border-t border-gray-100 my-3" />

      {/* Grid info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <InfoItem label={t('policy.limitPerTxn')} value={formatVnd(policy.maxAmountPerTxnVnd)} />
        <InfoItem label={t('policy.dailyLimit')} value={formatVnd(policy.dailyLimitVnd)} />
        <InfoItem label={t('policy.timeApplied')} value={`${policy.allowedTimeStart} – ${policy.allowedTimeEnd}`} />
        <InfoItem label={t('policy.daysApplied')} value={dayLabels} />
        <InfoItem label={t('policy.mealType')} value={mealLabels} />
        <div>
          <p className="text-xs text-gray-400">{t('policy.hybridPayment')}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {policy.hybridPaymentAllowed ? (
              <>
                <Check size={14} className="text-[#10B981]" />
                <span className="text-sm font-medium text-[#10B981]">{t('common.yes')}</span>
              </>
            ) : (
              <>
                <X size={14} className="text-[#EF4444]" />
                <span className="text-sm font-medium text-[#EF4444]">{t('common.no')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Merchant categories */}
      <p className="text-xs text-gray-400 mt-3">
        {t('policy.merchantCategories')}: {policy.merchantCategories.join(', ')}
      </p>

      {/* Validity */}
      <p className="text-xs text-gray-400 mt-1">
        {t('policy.validity')}: {policy.validFrom.split('-').reverse().join('/')} – {policy.validTo.split('-').reverse().join('/')}
      </p>
    </div>
  );
}
