'use client';

import { Check } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { AppHeader } from '../../shared/AppHeader';
import { MealSelector } from './MealSelector';
import { PreOrderSummary } from './PreOrderSummary';

/* Menu items for tomorrow */
const MENU_ITEMS = [
  {
    id: 'po-1',
    name: 'Com suon nuong mat ong',
    price: 40_000,
    description: 'Com tam suon nuong mat ong, kem do chua',
    selected: false,
  },
  {
    id: 'po-2',
    name: 'Bun bo Hue dac biet',
    price: 45_000,
    description: 'Bun bo Hue truyen thong, gio heo, huyet',
    selected: true,
  },
  {
    id: 'po-3',
    name: 'Pho ga ta',
    price: 35_000,
    description: 'Pho ga ta tha vuon, nuoc dung trong',
    selected: false,
  },
];

const SIDE_DISHES = [
  { id: 'sd-1', name: 'Cha gio (2 cai)', price: 15_000, checked: true },
  { id: 'sd-2', name: 'Rau xao thap cam', price: 10_000, checked: false },
];

const DRINKS = [
  { id: 'dk-1', name: 'Tra da', price: 0, checked: true },
];

export default function PreOrderScreen() {
  const { t } = useVmealT();

  return (
    <div className="bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title={t('preOrder.title')} onBack={() => {}} />

      <div className="px-5 pt-3 pb-6 space-y-5">
        {/* Restaurant info */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
            CT
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Canteen TechCorp - Tang B1
            </p>
          </div>
          <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#3B82F6]">
            {t('common.tomorrow')}, 13/04
          </span>
        </div>

        {/* Meal selector */}
        <MealSelector />

        {/* Menu selection */}
        <div className="space-y-3">
          <p className="text-base font-semibold text-gray-900">
            {t('preOrder.menuDate', { date: '13/04' })}
          </p>

          {/* Main dishes (radio) */}
          <div className="space-y-2">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  item.selected
                    ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Radio */}
                <div
                  className={`mt-0.5 flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    item.selected
                      ? 'border-[#3B82F6]'
                      : 'border-gray-300'
                  }`}
                >
                  {item.selected && (
                    <div className="h-[10px] w-[10px] rounded-full bg-[#3B82F6]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.selected ? 'text-[#3B82F6]' : 'text-gray-900'
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{item.description}</p>
                </div>

                {/* Price */}
                <p className="flex-shrink-0 text-sm font-medium text-gray-900">
                  {formatVnd(item.price)}
                </p>
              </button>
            ))}
          </div>

          {/* Side dishes (checkbox) */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-500 mt-2">{t('preOrder.sideDishes')}</p>
            {SIDE_DISHES.map((side) => (
              <div
                key={side.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
              >
                {/* Checkbox */}
                <div
                  className={`flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded ${
                    side.checked
                      ? 'bg-[#3B82F6]'
                      : 'border-2 border-gray-300'
                  }`}
                >
                  {side.checked && <Check size={13} className="text-white" />}
                </div>
                <p className="flex-1 text-sm text-gray-700">{side.name}</p>
                <p className="text-sm text-gray-600">
                  + {formatVnd(side.price)}
                </p>
              </div>
            ))}
          </div>

          {/* Drinks (checkbox) */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-500 mt-2">{t('preOrder.drinks')}</p>
            {DRINKS.map((drink) => (
              <div
                key={drink.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
              >
                {/* Checkbox */}
                <div
                  className={`flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded ${
                    drink.checked
                      ? 'bg-[#3B82F6]'
                      : 'border-2 border-gray-300'
                  }`}
                >
                  {drink.checked && <Check size={13} className="text-white" />}
                </div>
                <p className="flex-1 text-sm text-gray-700">{drink.name}</p>
                <p className="text-sm text-gray-600">
                  + {drink.price === 0 ? '0\u20AB' : formatVnd(drink.price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <PreOrderSummary
          items={[
            { name: 'Bun bo Hue dac biet', price: 45_000 },
            { name: 'Cha gio (2 cai)', price: 15_000 },
            { name: 'Tra da', price: 0 },
          ]}
          total={60_000}
          pickupTime="12:00 - 13/04/2026"
        />
      </div>
    </div>
  );
}
