'use client';

import { ChevronRight, Star, MapPin, UtensilsCrossed } from 'lucide-react';
import { MOCK_MERCHANTS } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

/** Color palette for merchant card placeholders */
const CARD_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#6366F1'];

export function NearbyMerchants() {
  const { t } = useVmealT();
  const merchants = MOCK_MERCHANTS.slice(0, 4);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">
          {t('wallet.nearbyMerchants')}
        </h3>
        <button className="flex items-center gap-0.5 text-xs font-medium text-[#3B82F6]">
          {t('wallet.map')}
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="mt-3 -mx-5 px-5">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {merchants.map((m, i) => (
            <div
              key={m.id}
              className="w-[140px] flex-shrink-0 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
            >
              {/* Image placeholder */}
              <div
                className="flex h-[80px] items-center justify-center"
                style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] + '18' }}
              >
                <UtensilsCrossed
                  size={28}
                  style={{ color: CARD_COLORS[i % CARD_COLORS.length] }}
                  className="opacity-60"
                />
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {m.brandName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <MapPin size={10} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400">
                      {m.distanceKm === 0 ? 'Tại chỗ' : `${m.distanceKm}km`}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="text-[10px] text-gray-600 font-medium">
                      {m.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
