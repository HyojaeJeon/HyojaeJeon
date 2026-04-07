'use client';

import type { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface NavigationBarProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  direction?: 'horizontal' | 'vertical';
}

export default function NavigationBar({ items, activeId, onSelect, direction = 'horizontal' }: NavigationBarProps) {
  const isVertical = direction === 'vertical';

  return (
    <nav
      className={`
        bg-pos-bg shrink-0
        ${isVertical
          ? 'w-nav-col h-full flex flex-col items-center py-2 gap-1 border-r border-pos-border'
          : 'w-full flex items-center px-2 gap-1 border-b border-pos-border'}
      `}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`
              flex items-center justify-center gap-1.5
              h-touch-nav rounded-pos-btn text-xs font-semibold
              transition-transform duration-fast cursor-pointer select-none
              active:scale-[0.95]
              ${isVertical ? 'w-11 flex-col' : 'px-4'}
              ${isActive
                ? 'bg-primary-500 text-pos-text-inverse shadow-pos-soft'
                : 'bg-transparent text-pos-text-secondary'}
            `}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className={`${isVertical ? 'text-2xs' : 'text-xs'} leading-none truncate`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
