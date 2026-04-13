'use client';

import { Check } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';

export function FilterChips() {
  const { t } = useVmealT();

  const FILTERS = [
    { label: t('merchant.open'), active: true },
    { label: '< 1km', active: false },
    { label: 'Viet Nam', active: false },
    { label: 'Han Quoc', active: false },
    { label: 'Nhat Ban', active: false },
    { label: 'Canteen', active: false },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            f.active
              ? 'bg-[#3B82F6] text-white'
              : 'border border-gray-200 bg-white text-gray-600'
          }`}
        >
          {f.active && <Check size={14} />}
          {f.label}
        </button>
      ))}
    </div>
  );
}
