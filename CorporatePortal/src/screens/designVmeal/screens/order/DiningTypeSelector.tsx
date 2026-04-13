'use client';

import { useVmealT } from '../../i18n/useVmealT';

interface DiningTypeSelectorProps {
  selected: 'DINE_IN' | 'TAKEOUT';
  tableNo: string;
  scheduledTime: string;
}

export function DiningTypeSelector({ selected, tableNo, scheduledTime }: DiningTypeSelectorProps) {
  const { t } = useVmealT();
  return (
    <div className="space-y-3">
      {/* Toggle buttons */}
      <div className="flex gap-2">
        <button
          className={`flex h-[40px] flex-1 items-center justify-center rounded-xl text-[14px] font-medium transition-colors ${
            selected === 'DINE_IN'
              ? 'bg-[#3B82F6] text-white'
              : 'border border-gray-200 bg-white text-gray-600'
          }`}
        >
          {t('order.dineIn')}
        </button>
        <button
          className={`flex h-[40px] flex-1 items-center justify-center rounded-xl text-[14px] font-medium transition-colors ${
            selected === 'TAKEOUT'
              ? 'bg-[#3B82F6] text-white'
              : 'border border-gray-200 bg-white text-gray-600'
          }`}
        >
          {t('order.takeout')}
        </button>
      </div>

      {/* Table + time info */}
      {selected === 'DINE_IN' && tableNo && (
        <p className="text-center text-[13px] text-gray-400">
          {t('order.table')} {tableNo} · {t('order.scheduledAt')} {scheduledTime}
        </p>
      )}
    </div>
  );
}
