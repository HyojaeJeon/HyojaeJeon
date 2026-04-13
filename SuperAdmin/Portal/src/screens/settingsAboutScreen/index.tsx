'use client';

import { useQuery } from '@apollo/client';
import { RefreshCw } from 'lucide-react';
import { ListPageTemplate, SectionCard, Badge, Skeleton } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { PLATFORM_INFO_QUERY, type PlatformInfoData } from '@graphql/queries/settings';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function SettingsAboutScreen() {
  const { t } = useI18n();
  const { data, loading, refetch } = useQuery<PlatformInfoData>(PLATFORM_INFO_QUERY, {
    pollInterval: 15_000,
  });

  const info = data?.platformInfo?.success?.data;

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.settings') }, { label: t('nav.settings.about') }],
        title: t('nav.settings.about'),
        description: t('settings.about.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SET-ABOUT</code>,
        actions: (
          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-10 items-center gap-1.5 rounded-[10px] border bg-surface-1 px-4 text-[13.5px] font-semibold text-fg transition-colors hover:bg-surface-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <RefreshCw size={13} />
            {t('action.refresh')}
          </button>
        ),
      }}
    >
      {loading && !info ? (
        <div className="space-y-3 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={60} />)}</div>
      ) : (
        <>
          <SectionCard title={t('settings.about.server')} description={t('settings.about.serverDesc')}>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoRow label={t('settings.about.version')} value={info?.version ?? '—'} />
              <InfoRow label={t('settings.about.nodeVersion')} value={info?.nodeVersion ?? '—'} mono />
              <InfoRow label={t('settings.about.uptime')} value={info ? formatUptime(info.uptimeSeconds) : '—'} />
              <InfoRow label={t('settings.about.environment')} value={info?.environment ?? '—'} />
            </div>
          </SectionCard>

          <SectionCard title={t('settings.about.services')} description={t('settings.about.servicesDesc')}>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <ServiceCard name="PostgreSQL" status={info?.services.database ?? 'unknown'} />
              <ServiceCard name="Redis" status={info?.services.redis ?? 'unknown'} />
              <ServiceCard name="GraphQL API" status="ok" />
            </div>
          </SectionCard>

          <SectionCard title={t('settings.about.client')} description={t('settings.about.clientDesc')}>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoRow label={t('settings.about.appName')} value={t('app.name')} />
              <InfoRow label={t('settings.about.portalVersion')} value="0.1.0" />
              <InfoRow label={t('settings.about.browser')} value={typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').pop() ?? '—' : '—'} />
              <InfoRow label={t('settings.about.locale')} value={typeof navigator !== 'undefined' ? navigator.language : '—'} />
            </div>
          </SectionCard>
        </>
      )}
    </ListPageTemplate>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">{label}</span>
      <span className={`text-[13px] font-medium text-fg ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</span>
    </div>
  );
}

function ServiceCard({ name, status }: { name: string; status: string }) {
  const { t } = useI18n();
  const isOk = status === 'ok';
  return (
    <div className="flex items-center justify-between rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
      <span className="text-[13px] font-semibold text-fg">{name}</span>
      <Badge tone={isOk ? 'success' : 'danger'} startDot>
        {isOk ? t('settings.about.healthy') : t(`settings.about.serviceStatus.${status}`)}
      </Badge>
    </div>
  );
}
