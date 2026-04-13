'use client';

import { Info } from 'lucide-react';
import { AppHeader } from '../../shared/AppHeader';
import { MOCK_POLICIES, MOCK_EMPLOYEE } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { PolicyCard } from './PolicyCard';

export default function PolicyViewScreen() {
  const { t } = useVmealT();

  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-full">
      <AppHeader title={t('policy.title')} onBack={() => {}} />

      <div className="flex-1 px-5 pt-4 pb-6 space-y-4">
        {/* Info banner */}
        <div className="flex gap-3 rounded-xl border border-[#3B82F6]/10 bg-[#3B82F6]/5 p-4">
          <Info size={18} className="shrink-0 text-[#3B82F6] mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('policy.banner', { company: MOCK_EMPLOYEE.corporateName })}
          </p>
        </div>

        {/* Policy cards */}
        {MOCK_POLICIES.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center pt-2">
          {t('policy.contactAdmin')}
        </p>
      </div>
    </div>
  );
}
