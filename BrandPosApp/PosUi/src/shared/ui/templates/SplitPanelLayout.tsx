'use client';

import type { ReactNode } from 'react';

interface SplitPanelLayoutProps {
  left: ReactNode;
  right: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
}

/**
 * SplitPanelLayout -- 좌우 분할 레이아웃
 *
 * 왼쪽과 오른쪽 패널을 CSS Grid로 분할한다.
 */
export default function SplitPanelLayout({
  left,
  right,
  leftWidth = '1fr',
  rightWidth = '300px',
}: SplitPanelLayoutProps) {
  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `${leftWidth} ${rightWidth}`,
      }}
    >
      <div className="min-w-0 overflow-hidden">
        {left}
      </div>
      <div className="min-w-0 overflow-hidden border-l border-pos-border">
        {right}
      </div>
    </div>
  );
}
