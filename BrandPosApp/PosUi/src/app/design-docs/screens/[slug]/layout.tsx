'use client';

import type { ReactNode } from 'react';
import { PosShellProvider } from '@shared/layout/PosShellContext';
import PosShellFrame from '@shared/layout/PosShellFrame';

/**
 * /design-docs/screens/[slug] 전용 레이아웃.
 *
 * 실제 POS 스크린을 1024x768 프레임으로 프리뷰할 때 공용 AppHeader를
 * 여기서 렌더한다. 각 스크린은 useSetPosShell()로 domain/screen/onClose를
 * 선언하기만 하면 된다.
 */
export default function ScreenPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <PosShellProvider>
      <PosShellFrame>{children}</PosShellFrame>
    </PosShellProvider>
  );
}
