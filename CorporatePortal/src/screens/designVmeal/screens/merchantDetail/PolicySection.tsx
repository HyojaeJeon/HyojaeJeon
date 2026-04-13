'use client';

import { Shield } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMealPolicy } from '../../types';

interface PolicySectionProps {
  policy: MockMealPolicy;
}

export function PolicySection({ policy }: PolicySectionProps) {
  const { t } = useVmealT();
  return (
    <div className="mx-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={18} className="text-[#3B82F6]" />
        <p className="text-sm font-semibold text-gray-900">{t('merchant.companyPolicy')}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[#3B82F6]" />
          <p className="text-sm text-gray-700">
            {t('merchant.limit')} {formatVnd(policy.maxAmountPerTxnVnd)}/{t('merchant.perTransaction')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[#3B82F6]" />
          <p className="text-sm text-gray-700">
            {t('merchant.timeApplied')} {policy.allowedTimeStart} – {policy.allowedTimeEnd}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[#3B82F6]" />
          <p className="text-sm text-gray-700">
            {t('merchant.hybridPayment')} {policy.hybridPaymentAllowed ? t('common.yes') : t('common.no')}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {t('merchant.appliedPolicy', { name: policy.nameVi })}
      </p>
    </div>
  );
}
