'use client';

import { useVmealT } from '../../i18n/useVmealT';

interface MealTypeTabProps {
  active: string;
}

export function MealTypeTab({ active }: MealTypeTabProps) {
  const { t } = useVmealT();

  const MEAL_TYPES = [
    { key: 'morning', label: t('dailyMenu.morning') },
    { key: 'lunch', label: t('dailyMenu.lunch') },
    { key: 'dinner', label: t('dailyMenu.dinner') },
  ];
  return (
    <div className="flex gap-0 border-b border-gray-100">
      {MEAL_TYPES.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              isActive
                ? 'border-b-2 border-[#3B82F6] text-[#3B82F6]'
                : 'text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
