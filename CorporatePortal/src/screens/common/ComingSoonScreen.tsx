'use client';

import { Construction } from 'lucide-react';
import { useI18n } from '@i18n/I18nProvider';

export function ComingSoonScreen() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
        <Construction size={28} className="text-primary" />
      </div>
      <h2 className="text-lg font-bold text-fg">{t('common.comingSoon')}</h2>
      <p className="max-w-md text-center text-sm text-fg-muted">
        {t('common.comingSoonDescription')}
      </p>
    </div>
  );
}
