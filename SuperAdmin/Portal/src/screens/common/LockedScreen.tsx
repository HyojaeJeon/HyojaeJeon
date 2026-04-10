'use client';

import { ShieldAlert } from 'lucide-react';
import { useI18n } from '@i18n/I18nProvider';

export function LockedScreen() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <ShieldAlert size={22} />
        </div>
        <div className="text-base font-semibold text-fg">{t('locked.title')}</div>
        <div className="text-[12.5px] text-fg-muted">{t('locked.description')}</div>
      </div>
    </div>
  );
}
