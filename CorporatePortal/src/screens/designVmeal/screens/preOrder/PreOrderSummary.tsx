'use client';

import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

interface SummaryItem {
  name: string;
  price: number;
}

interface PreOrderSummaryProps {
  items: SummaryItem[];
  total: number;
  pickupTime: string;
}

export function PreOrderSummary({ items, total, pickupTime }: PreOrderSummaryProps) {
  const { t } = useVmealT();
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <p className="text-sm font-semibold text-gray-900">{t('preOrder.summary')}</p>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <p className="text-sm text-gray-700">{item.name}</p>
            <p className="text-sm text-gray-700">{formatVnd(item.price)}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">{t('common.total')}:</p>
        <p className="text-base font-bold text-gray-900">{formatVnd(total)}</p>
      </div>

      {/* Pickup time */}
      <p className="text-xs text-gray-400">{t('preOrder.pickupAt')} {pickupTime}</p>

      {/* CTA */}
      <button className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
        {t('preOrder.preOrderBtn')}
      </button>
    </div>
  );
}
