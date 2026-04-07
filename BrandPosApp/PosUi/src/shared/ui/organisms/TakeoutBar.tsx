'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

interface TakeoutBarProps {
  activeTab: string;
  onTabSelect: (id: string) => void;
  counts?: { takeout?: number; delivery?: number };
}

export default function TakeoutBar({ activeTab, onTabSelect, counts = {} }: TakeoutBarProps) {
  const { t } = usePosI18n();
  const tabs = [
    { id: 'hall', label: t('order.hall') },
    { id: 'takeout', label: t('order.packing'), count: counts.takeout },
    { id: 'delivery', label: t('order.delivery'), count: counts.delivery },
  ];

  return (
    <div className="w-full h-footer bg-pos-bg border-t border-pos-border flex items-center px-5 gap-3 shrink-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabSelect(tab.id)}
            className={`
              flex items-center justify-center gap-2 h-touch-nav px-5 rounded-pos-lg
              text-md font-semibold transition-transform duration-normal cursor-pointer select-none
              active:scale-[0.97]
              ${isActive
                ? 'bg-primary-500 text-pos-text-inverse shadow-pos-soft'
                : 'bg-pos-surface text-pos-text-secondary'}
            `}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className={`text-2xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-pos-full px-1.5 ${isActive ? 'bg-white/20 text-pos-text-inverse' : 'bg-pos-border text-pos-text'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
