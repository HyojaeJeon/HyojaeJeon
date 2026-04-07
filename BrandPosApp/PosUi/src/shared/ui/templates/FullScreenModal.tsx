'use client';

import type { ReactNode } from 'react';

interface FullScreenModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * FullScreenModal -- 전체 화면 모달 오버레이
 *
 * 1024x768 전체를 덮는 모달. 배경 클릭으로 닫기 가능.
 */
export default function FullScreenModal({
  open,
  onClose,
  children,
}: FullScreenModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 w-screen-w h-screen-h flex items-center justify-center animate-pos-fade-in"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: 'var(--opacity-overlay-dark)' }}
        onClick={onClose}
      />

      {/* 콘텐츠 */}
      <div className="relative w-full h-full bg-pos-bg animate-pos-slide-up overflow-hidden">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-touch-nav h-touch-nav flex items-center justify-center rounded-pos-full bg-pos-surface text-pos-text-secondary active:bg-pos-border active:scale-[0.95] transition-transform duration-fast cursor-pointer select-none"
          style={{ zIndex: 1 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {children}
      </div>
    </div>
  );
}
