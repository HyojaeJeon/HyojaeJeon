'use client';

import type { ReactNode } from 'react';
import { PosShellProvider } from '@shared/layout/PosShellContext';
import PosShellFrame from '@shared/layout/PosShellFrame';

/**
 * /pos/* 전용 레이아웃.
 * 공용 AppHeader는 PosShellFrame이 렌더하며,
 * 각 스크린은 useSetPosShell()로 domain/screen/onClose를 선언한다.
 */
export default function PosLayout({ children }: { children: ReactNode }) {
  return (
    <PosShellProvider>
      <PosShellFrame>{children}</PosShellFrame>
    </PosShellProvider>
  );
}
