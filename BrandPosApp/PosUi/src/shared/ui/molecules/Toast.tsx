'use client';

import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onClose?: () => void;
  autoDismissMs?: number;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-pos-success text-white',
  error:   'bg-pos-error text-white',
  warning: 'bg-warn-500 text-pos-text',
  info:    'bg-pos-info text-white',
};

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 6v4M10 13v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="1" fill="currentColor" />
      <path d="M10 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * Toast -- 토스트 알림
 *
 * 하단에서 슬라이드 업 애니메이션. 자동 숨김 지원.
 */
export default function Toast({
  message,
  type,
  visible,
  onClose,
  autoDismissMs,
}: ToastProps) {
  useEffect(() => {
    if (!visible || !autoDismissMs || !onClose) return;
    const timer = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible, autoDismissMs, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2
        z-[var(--z-toast)]
        flex items-center gap-2.5
        px-5 py-3 rounded-pos-lg
        shadow-pos-card
        animate-pos-slide-up
        select-none
        ${typeStyles[type]}
      `}
    >
      <span className="shrink-0">{icons[type]}</span>
      <span className="text-md font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 shrink-0 active:scale-[0.9] transition-transform duration-fast cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
