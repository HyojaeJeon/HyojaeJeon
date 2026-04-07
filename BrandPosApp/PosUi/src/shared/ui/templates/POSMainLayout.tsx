'use client';

import type { ReactNode } from 'react';

interface POSMainLayoutProps {
  header?: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

/**
 * POSMainLayout -- POS 메인 페이지 레이아웃
 *
 * 고정 1024x768. 상단 header, 중단 content+sidebar, 하단 footer.
 */
export default function POSMainLayout({
  header,
  content,
  sidebar,
  footer,
}: POSMainLayoutProps) {
  return (
    <div className="w-screen-w h-screen-h flex flex-col overflow-hidden bg-pos-bg">
      {/* 상단 헤더 */}
      {header && (
        <div className="shrink-0">
          {header}
        </div>
      )}

      {/* 중단: 콘텐츠 + 사이드바 */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {content}
        </main>

        {/* 사이드바 */}
        {sidebar && (
          <div className="shrink-0">
            {sidebar}
          </div>
        )}
      </div>

      {/* 하단 푸터 */}
      {footer && (
        <div className="shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
