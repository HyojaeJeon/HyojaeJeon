'use client';

import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

interface PresetAmountsProps {
  amounts: number[];
  selected: number | null;
}

export function PresetAmounts({ amounts, selected }: PresetAmountsProps) {
  const { t } = useVmealT();

  return (
    <div className="space-y-3">
      <p className="text-[15px] font-semibold text-gray-900">{t('topUp.selectAmount')}</p>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {amounts.map((amount) => {
          const isSelected = amount === selected;
          return (
            <button
              key={amount}
              className={`flex h-[56px] items-center justify-center rounded-xl border text-[15px] font-medium transition-colors ${
                isSelected
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              {formatVnd(amount)}
            </button>
          );
        })}
      </div>

      {/* Custom amount input */}
      <p className="text-center text-[13px] text-gray-400">{t('topUp.orEnterCustom')}</p>
      <div className="flex h-[52px] items-center rounded-xl border border-gray-200 bg-white px-4">
        <input
          type="text"
          placeholder="Nhập số tiền"
          className="flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-300"
          readOnly
        />
        <span className="text-[15px] font-medium text-gray-400">₫</span>
      </div>
    </div>
  );
}
