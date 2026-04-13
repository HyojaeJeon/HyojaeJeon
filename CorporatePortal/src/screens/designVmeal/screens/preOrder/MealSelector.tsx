'use client';

import { Clock } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';

export function MealSelector() {
  const { t } = useVmealT();

  const MEAL_SLOTS = [
    { key: 'morning', label: t('preOrder.morningSlot'), time: '06:00-09:00', selected: false },
    { key: 'lunch', label: t('preOrder.lunchSlot'), time: '11:00-14:00', selected: true },
    { key: 'dinner', label: t('preOrder.dinnerSlot'), time: '17:00-21:00', selected: false },
  ];
  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-gray-900">{t('preOrder.selectMeal')}</p>

      <div className="space-y-2">
        {MEAL_SLOTS.map((slot) => (
          <button
            key={slot.key}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 transition-colors ${
              slot.selected
                ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Radio circle */}
            <div
              className={`flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 ${
                slot.selected
                  ? 'border-[#3B82F6]'
                  : 'border-gray-300'
              }`}
            >
              {slot.selected && (
                <div className="h-[10px] w-[10px] rounded-full bg-[#3B82F6]" />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 text-left">
              <p
                className={`text-sm font-medium ${
                  slot.selected ? 'text-[#3B82F6]' : 'text-gray-900'
                }`}
              >
                {slot.label}
              </p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              <span>{slot.time}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
