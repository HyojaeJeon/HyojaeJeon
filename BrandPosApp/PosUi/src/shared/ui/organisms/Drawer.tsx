'use client';

import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

/**
 * Drawer -- 오른쪽 슬라이드 패널
 *
 * overlay + 오른쪽에서 슬라이드되는 패널.
 * z-overlay 사용, 닫기 버튼 포함.
 */
export default function Drawer({
  open,
  onClose,
  title,
  children,
  width = 320,
}: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 'var(--z-overlay)' }}>
      {/* 오버레이 배경 */}
      <div
        className="absolute inset-0 bg-black animate-pos-fade-in"
        style={{ opacity: 'var(--opacity-overlay)' }}
        onClick={onClose}
      />

      {/* 슬라이드 패널 */}
      <aside
        className="absolute top-0 right-0 h-full bg-pos-bg shadow-pos-modal flex flex-col"
        style={{
          width: `${width}px`,
          animation: 'slide-in-right var(--duration-slow) var(--ease-out) forwards',
        }}
      >
        {/* 헤더 */}
        <div className="h-header border-b border-pos-border flex items-center justify-between px-4 shrink-0">
          <h2 className="text-md font-bold text-pos-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-touch-nav h-touch-nav flex items-center justify-center rounded-pos-btn text-pos-text-secondary active:bg-gray-100 active:scale-[0.95] transition-transform duration-fast cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </aside>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
