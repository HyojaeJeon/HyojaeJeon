'use client';

import { Check } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

interface DailyMenuItem {
  name: string;
  price: number;
  originalPrice?: number;
}

interface DailyMenuCardProps {
  brandInitial: string;
  brandColor: string;
  brandName: string;
  distance: string;
  badge?: string;
  items: DailyMenuItem[];
  subscribed: boolean;
}

export function DailyMenuCard({
  brandInitial,
  brandColor,
  brandName,
  distance,
  badge,
  items,
  subscribed,
}: DailyMenuCardProps) {
  const { t } = useVmealT();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${brandColor}`}
        >
          {brandInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{brandName}</p>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{distance}</span>
      </div>

      {/* Special badge */}
      {badge && (
        <span className="inline-block rounded-full bg-[#F59E0B]/10 px-3 py-1 text-xs font-medium text-[#F59E0B]">
          {badge}
        </span>
      )}

      {/* Menu items */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <p className="text-sm text-gray-700">{item.name}</p>
            <div className="flex items-center gap-2">
              {item.originalPrice && (
                <span className="text-xs text-gray-300 line-through">
                  {formatVnd(item.originalPrice)}
                </span>
              )}
              <span className="text-sm font-medium text-gray-900">
                {formatVnd(item.price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe / Subscribed */}
      <div className="pt-1">
        {subscribed ? (
          <div className="flex items-center gap-1.5">
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#10B981]">
              <Check size={11} className="text-white" />
            </div>
            <span className="text-xs font-medium text-[#10B981]">{t('dailyMenu.subscribed')}</span>
          </div>
        ) : (
          <button className="text-xs font-medium text-[#3B82F6]">
            {t('dailyMenu.subscribe')}
          </button>
        )}
      </div>
    </div>
  );
}
