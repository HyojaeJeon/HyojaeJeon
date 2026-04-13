'use client';

import { Star } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMerchant } from '../../types';

const BRAND_COLORS = [
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

interface MerchantListItemProps {
  merchant: MockMerchant;
  index: number;
}

export function MerchantListItem({ merchant, index }: MerchantListItemProps) {
  const { t } = useVmealT();
  const initial = merchant.brandName.charAt(0);
  const colorClass = BRAND_COLORS[index % BRAND_COLORS.length];

  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-white p-3 border border-gray-100 shadow-sm ${
        !merchant.isOpen ? 'opacity-60' : ''
      }`}
    >
      {/* Brand circle */}
      <div
        className={`flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full ${colorClass} text-white font-bold text-lg`}
      >
        {initial}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {merchant.brandName}
        </p>
        <p className="mt-0.5 text-xs text-gray-400 truncate">{merchant.address}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
          <span>{merchant.rating}</span>
          <span className="text-gray-300">({merchant.reviewCount})</span>
          <span className="text-gray-300">&middot;</span>
          <span>{merchant.distanceKm} km</span>
          <span className="text-gray-300">&middot;</span>
          <span>{formatVnd(merchant.avgPriceVnd)}</span>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0">
        {merchant.isOpen ? (
          <span className="rounded-full bg-[#10B981]/10 px-2.5 py-1 text-[11px] font-medium text-[#10B981]">
            {t('merchant.open')}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-400">
            {t('merchant.closed')}
          </span>
        )}
      </div>
    </div>
  );
}
