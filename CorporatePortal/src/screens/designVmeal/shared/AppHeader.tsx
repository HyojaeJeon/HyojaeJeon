'use client';

import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  transparent?: boolean;
}

export function AppHeader({ title, onBack, right, transparent = false }: AppHeaderProps) {
  return (
    <div
      className={`flex h-[56px] items-center justify-between px-4 ${
        transparent ? '' : 'border-b border-gray-100 bg-white'
      }`}
    >
      {/* Left */}
      <div className="flex w-[44px] items-center justify-start">
        {onBack && (
          <button className="flex h-[44px] w-[44px] items-center justify-center rounded-full active:bg-gray-100">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
        )}
      </div>

      {/* Center */}
      <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900 line-clamp-1">
        {title}
      </h1>

      {/* Right */}
      <div className="flex w-[44px] items-center justify-end">{right}</div>
    </div>
  );
}
