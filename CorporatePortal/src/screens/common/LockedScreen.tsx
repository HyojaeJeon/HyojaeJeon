'use client';

import { Lock } from 'lucide-react';
import { useI18n } from '@i18n/I18nProvider';

export function LockedScreen() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft">
        <Lock size={28} className="text-danger" />
      </div>
      <h2 className="text-lg font-bold text-fg">{t('common.error')}</h2>
      <p className="max-w-md text-center text-sm text-fg-muted">
        이 페이지에 접근할 권한이 없습니다.
      </p>
    </div>
  );
}
