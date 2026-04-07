'use client';

import { useEffect, type ReactNode } from 'react';
import { usePosShell } from '@shared/layout/PosShellContext';

interface FullScreenPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 세부 스크린명 (공용 AppHeader에 도메인 옆에 표시) */
  subtitle?: string;
  /** 공용 AppHeader 도메인명 (기본: 설정) */
  domain?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** body 패딩 제거 (커스텀 레이아웃용) */
  noPadding?: boolean;
}

/**
 * FullScreenPanel — POS 전체 화면 패널.
 *
 * - 자체 헤더를 렌더하지 않는다. 공용 `AppHeader`(PosShellFrame)가 담당한다.
 * - 마운트 시 `usePosShell().setConfig`로 도메인/스크린명/onClose를 등록한다.
 * - Body/Footer만 자체적으로 렌더.
 */
export default function FullScreenPanel({
  open,
  onClose,
  title,
  subtitle,
  domain = '설정',
  children,
  footer,
  noPadding = false,
}: FullScreenPanelProps) {
  const { setConfig } = usePosShell();

  useEffect(() => {
    if (!open) return;
    setConfig({
      domain,
      screen: subtitle ? `${title} · ${subtitle}` : title,
      showHeader: true,
      onClose,
    });
    return () => {
      setConfig({ domain: undefined, screen: undefined, showHeader: true, onClose: undefined });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title, subtitle, domain]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 flex flex-col bg-pos-surface" style={{ zIndex: 9998 }}>
      {/* Body */}
      <div className={`flex-1 flex flex-col min-h-0 ${noPadding ? '' : 'px-5 py-4 gap-3'}`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-5 py-3 flex items-center justify-end gap-3 shrink-0 bg-pos-bg shadow-pos-card">
          {footer}
        </div>
      )}
    </div>
  );
}
