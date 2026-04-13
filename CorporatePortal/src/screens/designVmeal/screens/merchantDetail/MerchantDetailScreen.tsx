'use client';

import { Navigation, ShoppingBag } from 'lucide-react';
import { MOCK_MERCHANTS, MOCK_MENU_PHO24, MOCK_POLICIES } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { PhotoHeader } from './PhotoHeader';
import { InfoSection } from './InfoSection';
import { PolicySection } from './PolicySection';
import { MenuHighlights } from './MenuHighlights';

/* Congestion data (fake) */
const CONGESTION = [
  { hour: '11:00', pct: 30, peak: false },
  { hour: '12:00', pct: 85, peak: true },
  { hour: '13:00', pct: 60, peak: false },
  { hour: '14:00', pct: 20, peak: false },
];

export default function MerchantDetailScreen() {
  const { t } = useVmealT();
  const merchant = MOCK_MERCHANTS[0]; // Pho 24
  const policy = MOCK_POLICIES[0]; // Lunch policy

  return (
    <div className="bg-[#F8FAFC] pb-[100px]">
      {/* Photo */}
      <PhotoHeader merchant={merchant} />

      {/* Info */}
      <InfoSection merchant={merchant} />

      {/* Divider */}
      <div className="my-4 h-2 bg-gray-50" />

      {/* Policy */}
      <PolicySection policy={policy} />

      {/* Divider */}
      <div className="my-4 h-2 bg-gray-50" />

      {/* Menu highlights */}
      <MenuHighlights items={MOCK_MENU_PHO24} />

      {/* Divider */}
      <div className="my-4 h-2 bg-gray-50" />

      {/* Congestion */}
      <div className="px-5 space-y-3">
        <p className="text-base font-semibold text-gray-900">{t('merchant.congestion')}</p>

        <div className="flex items-end justify-between gap-3 h-[100px] px-2">
          {CONGESTION.map((c) => (
            <div key={c.hour} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative w-full flex flex-col items-center justify-end h-[72px]">
                {c.peak && (
                  <span className="mb-1 text-[9px] font-medium text-[#EF4444]">
                    {t('merchant.busiest')}
                  </span>
                )}
                <div
                  className={`w-full max-w-[40px] rounded-t-md ${
                    c.peak ? 'bg-[#EF4444]' : 'bg-[#3B82F6]/60'
                  }`}
                  style={{ height: `${c.pct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{c.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom action bar (sticky) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
        <div className="w-[406px] pointer-events-auto bg-white border-t border-gray-100 px-5 py-3 flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 h-[48px] rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700">
            <Navigation size={16} />
            {t('merchant.navigate')}
          </button>
          <button className="flex flex-[2] items-center justify-center gap-2 h-[48px] rounded-xl bg-[#3B82F6] text-sm font-semibold text-white">
            <ShoppingBag size={16} />
            {t('order.orderBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
