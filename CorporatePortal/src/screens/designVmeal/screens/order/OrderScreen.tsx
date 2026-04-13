'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { AppHeader } from '../../shared/AppHeader';
import { MOCK_MENU_PHO24 } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { DiningTypeSelector } from './DiningTypeSelector';
import { MenuItemCard } from './MenuItemCard';
import { PaymentSummary } from './PaymentSummary';

const FOOD_CATEGORIES = ['Phở', 'Khai vị', 'Đồ uống'];

const TIME_SLOTS = ['11:30', '12:00', '12:30', '13:00', '13:30'];

const ITEM_QUANTITIES: Record<string, number> = {
  'mi-001': 1, // Phở Bò Tái
  'mi-004': 1, // Gỏi Cuốn
};

export default function OrderScreen() {
  const { t } = useVmealT();
  const [selectedCategory, setSelectedCategory] = useState('Phở');
  const [selectedTime, setSelectedTime] = useState('12:00');

  const allCategoryLabel = t('order.allCategories');
  const CATEGORIES = [allCategoryLabel, ...FOOD_CATEGORIES];

  const filteredItems =
    selectedCategory === allCategoryLabel
      ? MOCK_MENU_PHO24
      : MOCK_MENU_PHO24.filter((item) => item.category === selectedCategory);

  return (
    <div className="flex h-full min-h-[700px] flex-col bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title="Phở 24 - Nguyễn Huệ" onBack={() => {}} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-[220px]">
        {/* Dining type selector */}
        <div className="mt-2">
          <DiningTypeSelector selected="DINE_IN" tableNo="A-05" scheduledTime="12:00" />
        </div>

        {/* Menu section */}
        <div className="mt-6 space-y-3">
          <p className="text-[15px] font-semibold text-gray-900">{t('order.menu')}</p>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#3B82F6] text-white'
                    : 'border border-gray-200 bg-white text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu items */}
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={ITEM_QUANTITIES[item.id] ?? 0}
              />
            ))}
          </div>
        </div>

        {/* Time slot picker */}
        <div className="mt-6 space-y-3">
          <p className="text-[15px] font-semibold text-gray-900">{t('order.timeSlot')}</p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {TIME_SLOTS.map((slot) => {
              const isSelected = slot === selectedTime;
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#3B82F6] text-white'
                      : 'border border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {slot}
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky bottom payment summary */}
      <div className="absolute bottom-0 left-0 right-0">
        <PaymentSummary
          totalVnd={100_000}
          companyShareVnd={100_000}
          employeeShareVnd={0}
          gpsVerified
        />
      </div>
    </div>
  );
}
