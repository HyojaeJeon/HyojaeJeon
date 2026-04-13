'use client';

import { Bell } from 'lucide-react';
import { MOCK_MENU_COMTAM } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { AppHeader } from '../../shared/AppHeader';
import { MealTypeTab } from './MealTypeTab';
import { DailyMenuCard } from './DailyMenuCard';

export default function DailyMenuListScreen() {
  const { t } = useVmealT();
  const comtamItems = MOCK_MENU_COMTAM.slice(0, 3);

  return (
    <div className="bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader
        title={t('dailyMenu.title')}
        onBack={() => {}}
        right={
          <button className="flex h-[44px] w-[44px] items-center justify-center rounded-full active:bg-gray-100">
            <Bell size={20} className="text-gray-900" />
          </button>
        }
      />

      {/* Date display */}
      <div className="flex items-center gap-2 px-5 pt-3">
        <p className="text-sm text-gray-400">Thu Bay, 12/04/2026</p>
        <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#3B82F6]">
          {t('common.today')}
        </span>
      </div>

      {/* Meal type tabs */}
      <div className="mt-3 px-5">
        <MealTypeTab active="lunch" />
      </div>

      {/* Daily menu cards */}
      <div className="px-5 pt-4 pb-6 space-y-4">
        {/* Card 1: Canteen TechCorp */}
        <DailyMenuCard
          brandInitial="CT"
          brandColor="bg-blue-500"
          brandName="Canteen TechCorp"
          distance="0 km"
          items={[
            { name: 'Com suon nuong', price: 35_000 },
            { name: 'Pho ga', price: 30_000 },
            { name: 'Bun bo Hue', price: 35_000 },
          ]}
          subscribed={false}
        />

        {/* Card 2: Pho 24 */}
        <DailyMenuCard
          brandInitial="P"
          brandColor="bg-amber-500"
          brandName="Pho 24 - Nguyen Hue"
          distance="0.3 km"
          badge={t('dailyMenu.dailySpecial')}
          items={[
            { name: 'Pho Bo Dac Biet', price: 75_000, originalPrice: 85_000 },
            { name: 'Combo Pho + Goi Cuon', price: 85_000 },
          ]}
          subscribed={true}
        />

        {/* Card 3: Com Tam Ba Nam */}
        <DailyMenuCard
          brandInitial="C"
          brandColor="bg-emerald-500"
          brandName="Com Tam Ba Nam"
          distance="0.5 km"
          items={comtamItems.map((item) => ({
            name: item.nameVi,
            price: item.priceVnd,
          }))}
          subscribed={false}
        />
      </div>
    </div>
  );
}
