'use client';

import { List, Map } from 'lucide-react';
import { MOCK_MERCHANTS } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { MerchantListItem } from './MerchantListItem';

export default function MerchantMapScreen() {
  const { t } = useVmealT();

  return (
    <div className="bg-[#F8FAFC] px-5 pt-2 pb-6 space-y-4">
      {/* Greeting */}
      <div>
        <p className="text-lg font-semibold text-gray-900">Xin chao, Tuan</p>
        <p className="text-sm text-gray-400">{t('merchant.whatToEat')}</p>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Filter chips + view toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 overflow-hidden">
            <FilterChips />
          </div>
          {/* View toggle */}
          <div className="ml-3 flex flex-shrink-0 items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#3B82F6] text-white">
              <List size={12} />
              {t('merchant.listView')}
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-400">
              <Map size={12} />
              {t('merchant.mapView')}
            </button>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative h-[200px] w-full rounded-2xl bg-[#E8F4FD] overflow-hidden">
        {/* Fake street grid lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-[20%] top-0 h-full w-px bg-gray-400" />
          <div className="absolute left-[50%] top-0 h-full w-px bg-gray-400" />
          <div className="absolute left-[75%] top-0 h-full w-px bg-gray-400" />
          <div className="absolute top-[30%] left-0 w-full h-px bg-gray-400" />
          <div className="absolute top-[60%] left-0 w-full h-px bg-gray-400" />
        </div>
        {/* Pin markers */}
        <div className="absolute left-[30%] top-[25%] h-3 w-3 rounded-full bg-[#3B82F6] ring-4 ring-[#3B82F6]/20" />
        <div className="absolute left-[55%] top-[40%] h-3 w-3 rounded-full bg-[#10B981] ring-4 ring-[#10B981]/20" />
        <div className="absolute left-[40%] top-[65%] h-3 w-3 rounded-full bg-[#F59E0B] ring-4 ring-[#F59E0B]/20" />
        <div className="absolute left-[70%] top-[50%] h-3 w-3 rounded-full bg-[#EF4444] ring-4 ring-[#EF4444]/20" />
        {/* Current location marker */}
        <div className="absolute left-[45%] top-[45%] h-4 w-4 rounded-full bg-[#3B82F6] ring-4 ring-[#3B82F6]/30 border-2 border-white" />
        {/* Attribution */}
        <span className="absolute bottom-2 right-3 text-[9px] text-gray-400">
          Google Maps
        </span>
      </div>

      {/* Merchant list header */}
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-gray-900">{t('merchant.nearby')}</p>
        <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
          ({MOCK_MERCHANTS.length})
        </span>
      </div>

      {/* Merchant list */}
      <div className="space-y-3">
        {MOCK_MERCHANTS.map((merchant, i) => (
          <MerchantListItem key={merchant.id} merchant={merchant} index={i} />
        ))}
      </div>
    </div>
  );
}
