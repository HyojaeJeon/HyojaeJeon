'use client';

import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  rightContent?: ReactNode;
  badge?: string;
  badgeColor?: 'green' | 'gray' | 'blue';
  toggle?: boolean;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

function BadgeLabel({ text, color = 'gray' }: { text: string; color?: 'green' | 'gray' | 'blue' }) {
  const colorMap = {
    green: 'text-[#10B981]',
    gray: 'text-gray-400',
    blue: 'text-[#3B82F6]',
  };
  return <span className={`text-xs ${colorMap[color]}`}>{text}</span>;
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <div
      className={`relative h-[26px] w-[46px] rounded-full transition-colors ${
        on ? 'bg-[#3B82F6]' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform ${
          on ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </div>
  );
}

export function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide px-1">{title}</p>
      <div className="rounded-2xl overflow-hidden border border-gray-100">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.label}>
              {idx > 0 && <div className="border-t border-gray-100 mx-4" />}
              <div className="flex items-center gap-3 bg-white px-4 py-3.5">
                <Icon size={20} className="shrink-0 text-gray-400" />
                <span className="flex-1 text-[15px] text-gray-900">{item.label}</span>
                {item.rightContent}
                {item.badge && (
                  <BadgeLabel text={item.badge} color={item.badgeColor} />
                )}
                {item.toggle !== undefined && <ToggleSwitch on={item.toggle} />}
                {item.toggle === undefined && (
                  <ChevronRight size={18} className="shrink-0 text-gray-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
