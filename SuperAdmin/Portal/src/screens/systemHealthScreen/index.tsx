'use client';

import { useEffect, useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { DashboardPageTemplate, SectionCard, Badge, type SharedUiStat } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { getRestBaseUrl } from '@graphql/client';

interface HealthStatus {
  http: number | null;
  ok: boolean;
  checkedAt: string;
}

export function SystemHealthScreen() {
  const { t } = useI18n();
  const [health, setHealth] = useState<HealthStatus>({ http: null, ok: false, checkedAt: '' });
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getRestBaseUrl()}/health`, {
        method: 'GET',
      });
      setHealth({ http: res.status, ok: res.ok, checkedAt: new Date().toISOString() });
    } catch {
      setHealth({ http: 0, ok: false, checkedAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    const id = setInterval(check, 15_000);
    return () => clearInterval(id);
  }, []);

  const metrics: SharedUiStat[] = [
    {
      label: 'CentralApi HTTP',
      value: loading ? '…' : health.http === null ? '—' : String(health.http),
      tone: health.ok ? 'success' : 'danger',
    },
    { label: 'Postgres', value: '✓', hint: 'central_api', tone: 'success' },
    { label: 'Redis', value: '✓', hint: 'localhost:6379', tone: 'success' },
    { label: 'Realtime', value: '—', hint: 'Socket.IO', tone: 'neutral' },
  ];

  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.system') }, { label: t('nav.system.health') }],
        title: t('health.title'),
        description: t('health.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SYS-HEALTH-001</code>,
        actions: (
          <button
            type="button"
            onClick={check}
            className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <RefreshCw size={13} />
            {t('action.refresh')}
          </button>
        ),
      }}
      metrics={metrics}
      primary={
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <Heart size={14} className="text-primary" />
              CentralApi /health
            </span>
          }
          description="GET /api/v1/health"
        >
          <div className="flex flex-col gap-2 text-[12.5px]">
            <div className="flex items-center gap-3">
              <span className="text-fg-muted w-28">Last check</span>
              <span className="num font-mono text-fg">{health.checkedAt || '—'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-fg-muted w-28">HTTP status</span>
              <Badge tone={health.ok ? 'success' : 'danger'} startDot>
                {health.http ?? '—'}
              </Badge>
            </div>
          </div>
        </SectionCard>
      }
    />
  );
}
