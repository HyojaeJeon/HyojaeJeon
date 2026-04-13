'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

interface MonthSelectorProps {
  month: string;
  totalSpent: number;
  companySpent: number;
  personalSpent: number;
}

export function MonthSelector({ month, totalSpent, companySpent, personalSpent }: MonthSelectorProps) {
  const { t } = useVmealT();

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200">
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <span className="text-[15px] font-semibold text-gray-900">{month}</span>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200">
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-400">{t('transaction.monthlyTotal')}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{formatVnd(totalSpent)}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#3B82F6]">
            {t('transaction.company')}: {formatVnd(companySpent)}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {t('transaction.personal')}: {formatVnd(personalSpent)}
          </span>
        </div>
      </div>
    </div>
  );
}
