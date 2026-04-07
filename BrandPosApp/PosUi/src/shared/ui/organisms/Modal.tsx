'use client';

import { useRef, useEffect, type ReactNode, type MouseEvent } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

/**
 * Modal — POS 전용 모달 다이얼로그
 *
 * 한국어:
 *   - POS 화면(1024x768) 내부 정중앙에 표시.
 *   - useEffect로 가장 가까운 positioned ancestor를 찾아 그 영역 내에 배치.
 *   - positioned ancestor가 없으면 뷰포트 전체 기준 (fallback).
 *   - X 닫기 버튼 + 배경 클릭으로 닫기. ESC 키로도 닫기.
 *
 * Tiếng Việt:
 *   - Hiển thị ở chính giữa bên trong màn hình POS (1024x768).
 *   - Dùng useEffect tìm positioned ancestor gần nhất để căn giữa trong vùng đó.
 *   - Nếu không có positioned ancestor, căn giữa theo viewport (fallback).
 *   - Đóng bằng nút X + click nền. Đóng bằng phím ESC.
 */

const sizeStyles: Record<ModalSize, string> = {
  sm: 'w-[26rem]',
  md: 'w-[34rem]',
  lg: 'w-[44rem]',
  xl: 'w-[56rem]',
  full: 'w-[calc(100%-2rem)]',
};

export type { ModalProps, ModalSize };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // 배경 클릭 시 닫기 (모달 본체 클릭은 전파 차단)
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40"
      />

      {/* 모달 본체 — 정중앙 */}
      <div
        className={`
          relative bg-pos-bg rounded-pos-2xl shadow-pos-modal
          flex flex-col max-h-[90vh] animate-pos-slide-up
          ${sizeStyles[size]}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + 닫기 버튼 */}
        <div className="h-16 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-[18px] font-extrabold text-pos-text truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full text-pos-text-muted hover:bg-pos-surface active:bg-pos-border active:text-pos-text active:scale-[0.9] transition-all duration-100 cursor-pointer"
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body — flex-col로 children이 꽉 채울 수 있게 */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-6 py-6 text-[15px]" style={{ scrollbarWidth: 'none' }}>
          {children}
        </div>

        {/* Footer — 자식 버튼이 2개면 50:50 full width */}
        {footer && (
          <div className="px-6 py-4 flex items-stretch gap-3 shrink-0 [&>*]:flex-1 [&>*]:min-h-[48px] [&>*]:text-[15px] [&>*]:font-bold">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
