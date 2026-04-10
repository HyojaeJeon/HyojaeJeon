'use client';

import { Construction } from 'lucide-react';
import { PageHeader } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';

interface ComingSoonScreenProps {
  titleKey: string;
  descriptionKey?: string;
  screenId?: string;
}

export function ComingSoonScreen({ titleKey, descriptionKey, screenId }: ComingSoonScreenProps) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[1600px] px-6 pb-10">
      <PageHeader
        title={t(titleKey)}
        description={descriptionKey ? t(descriptionKey) : t('comingSoon.title')}
        meta={screenId ? <code className="text-[11px] text-fg-subtle">{screenId}</code> : undefined}
      />
      <div
        className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-surface-1 p-10 text-fg-muted"
        style={{ borderColor: 'var(--border)' }}
      >
        <Construction size={28} className="text-primary" />
        <div className="text-[15px] font-semibold text-fg">{t('comingSoon.title')}</div>
        <div className="max-w-[460px] text-center text-[12.5px]">
          {t('comingSoon.description')}
        </div>
      </div>
    </div>
  );
}
