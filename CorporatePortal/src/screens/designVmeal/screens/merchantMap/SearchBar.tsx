'use client';

import { Search } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';

export function SearchBar() {
  const { t } = useVmealT();
  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        readOnly
        placeholder={t('merchant.searchPlaceholder')}
        className="h-[48px] w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
      />
    </div>
  );
}
