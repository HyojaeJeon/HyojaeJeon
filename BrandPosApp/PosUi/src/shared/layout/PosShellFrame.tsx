'use client';

import type { ReactNode } from 'react';
import AppHeader, { type AppLocale } from '@shared/ui/organisms/AppHeader';
import { usePosShell } from '@shared/layout/PosShellContext';
import { usePosI18n } from '@i18n/PosI18nProvider';

/**
 * 루트 레이아웃에서 전역으로 렌더되는 POS Shell 프레임.
 * - `useSetPosShell`로 domain을 선언한 스크린에만 AppHeader가 노출된다.
 * - domain 미선언 화면(예: design-docs 인덱스)은 헤더 없이 children만 렌더.
 */
export default function PosShellFrame({ children }: { children: ReactNode }) {
  const { domain, screen, showHeader, onMenu, onClose } = usePosShell();
  const { locale, setLocale } = usePosI18n();

  const visible = !!domain && showHeader !== false;

  if (!visible) {
    return <>{children}</>;
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-pos-surface">
      <AppHeader
        domain={domain ?? ''}
        screen={screen}
        locale={locale as AppLocale}
        onLocaleChange={(lng) => setLocale(lng as AppLocale)}
        onMenu={onMenu}
        onClose={onClose}
      />
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
}
