'use client';

import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightActions?: ReactNode;
}

export default function Header({ title, subtitle, onBack, rightActions }: HeaderProps) {
  return (
    <header className="h-header w-full bg-pos-bg border-b border-pos-border flex items-center px-4 shrink-0">
      {/* Left: Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-touch-nav h-touch-nav flex items-center justify-center rounded-pos-btn text-pos-text-secondary active:bg-gray-100 active:scale-[0.95] transition-transform duration-fast cursor-pointer shrink-0 mr-1"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Center-left: Title + subtitle */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h1 className="text-md font-bold text-pos-text leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-2xs text-pos-text-muted leading-2xs truncate">{subtitle}</p>
        )}
      </div>

      {/* Right: Action buttons */}
      {rightActions && (
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {rightActions}
        </div>
      )}
    </header>
  );
}
