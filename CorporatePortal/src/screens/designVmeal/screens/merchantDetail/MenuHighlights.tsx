'use client';

import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMenuItem } from '../../types';

const ITEM_COLORS = [
  'bg-amber-100',
  'bg-rose-100',
  'bg-emerald-100',
  'bg-violet-100',
  'bg-blue-100',
];

interface MenuHighlightsProps {
  items: MockMenuItem[];
}

export function MenuHighlights({ items }: MenuHighlightsProps) {
  const { t } = useVmealT();
  const popular = items.filter((item) => item.isPopular);

  return (
    <div className="px-5 space-y-3">
      <p className="text-base font-semibold text-gray-900">{t('merchant.popularItems')}</p>

      <div className="space-y-2">
        {popular.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3 border border-gray-100 shadow-sm"
          >
            {/* Color placeholder */}
            <div
              className={`flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center rounded-lg ${ITEM_COLORS[i % ITEM_COLORS.length]}`}
            >
              <span className="text-lg">
                {item.category === 'Khai vi' ? '\u{1F960}' : '\u{1F35C}'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.nameVi}
              </p>
              <p className="mt-0.5 text-xs text-gray-400 truncate">
                {item.descriptionVi}
              </p>
            </div>

            {/* Price */}
            <p className="flex-shrink-0 text-sm font-semibold text-gray-900">
              {formatVnd(item.priceVnd)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
