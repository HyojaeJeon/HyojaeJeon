'use client';

import { Minus, Plus } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMenuItem } from '../../types';

interface MenuItemCardProps {
  item: MockMenuItem;
  quantity: number;
}

export function MenuItemCard({ item, quantity }: MenuItemCardProps) {
  const { t } = useVmealT();
  const isDisabled = !item.isAvailable;

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ${
        isDisabled ? 'opacity-50' : ''
      }`}
    >
      {/* Left: info */}
      <div className="flex-1 pr-3">
        <div className="flex items-center gap-2">
          <p className={`text-[15px] font-semibold ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {item.nameVi}
          </p>
          {item.isPopular && !isDisabled && (
            <span className="rounded-full bg-[#F59E0B]/10 px-2 py-0.5 text-[10px] font-medium text-[#F59E0B]">
              {t('order.popular')}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{item.descriptionVi}</p>
        <p className="mt-1 text-[14px] font-medium text-gray-900">
          {item.priceVnd === 0 ? 'Miễn phí' : formatVnd(item.priceVnd)}
        </p>
      </div>

      {/* Right: quantity controls */}
      <div className="flex items-center gap-2">
        {quantity > 0 ? (
          <>
            <button
              className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600"
              disabled={isDisabled}
            >
              <Minus size={16} />
            </button>
            <span className="w-[24px] text-center text-[15px] font-semibold text-gray-900">
              {quantity}
            </span>
            <button
              className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#3B82F6] text-white"
              disabled={isDisabled}
            >
              <Plus size={16} />
            </button>
          </>
        ) : (
          <button
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-lg ${
              isDisabled
                ? 'border border-gray-100 bg-gray-50 text-gray-300'
                : 'border border-gray-200 bg-white text-gray-600'
            }`}
            disabled={isDisabled}
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
