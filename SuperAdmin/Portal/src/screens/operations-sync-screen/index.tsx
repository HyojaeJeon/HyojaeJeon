'use client';

import { RefreshCw, Radar } from 'lucide-react';
import { DashboardPageTemplate, SectionCard, Badge, type SharedUiStat } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';

/**
 * SA-OP-SYNC-001 — Sync Monitor.
 * `syncEventConnection` query 가 backend 에 존재하지만 connection 가 없을 때 empty 반환.
 * 현재는 top-level 스테이터스 카드 + 향후 Phase 3 subscription.
 */
export function OperationsSyncScreen() {
  const { t } = useI18n();
  const metrics: SharedUiStat[] = [
    { label: 'PENDING', value: '—', tone: 'warning' },
    { label: 'PROCESSING', value: '—', tone: 'info' },
    { label: 'ACKED', value: '—', tone: 'success' },
    { label: 'FAILED', value: '—', tone: 'danger' },
  ];
  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.sync') }],
        title: t('operations.syncMonitor.title'),
        description: 'SyncOutbox + sync.upstream event stream',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-SYNC-001</code>,
      }}
      metrics={metrics}
      primary={
        <SectionCard title={<span className="flex items-center gap-2"><RefreshCw size={14} className="text-primary" />SyncOutbox</span>} description="Phase 3 realtime subscription 예정">
          <div className="flex items-center justify-center py-10 text-[12.5px] text-fg-subtle">
            <Badge tone="info" startDot>Phase 3</Badge>
          </div>
        </SectionCard>
      }
      secondary={
        <SectionCard title="Events">
          <div className="text-[12px] text-fg-muted">
            구독 예정 topic:
            <ul className="mt-2 space-y-1 font-mono text-[11px] text-fg-subtle">
              <li>• sync.upstream.accepted</li>
              <li>• sync.upstream.duplicate</li>
              <li>• sync.downstream.ack</li>
            </ul>
          </div>
        </SectionCard>
      }
    />
  );
}

export function OperationsRealtimeScreen() {
  const { t } = useI18n();
  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.realtime') }],
        title: t('operations.realtime.title'),
        description: '9 topic 그룹의 publish rate · subscribers · latency',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-RT-001</code>,
      }}
      primary={
        <SectionCard title={<span className="flex items-center gap-2"><Radar size={14} className="text-primary" />Topics</span>}>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            {[
              'platform.superadmin.audit.created',
              'platform.superadmin.policy.changed',
              'platform.superadmin.license.changed',
              'brand.profile.changed',
              'brand.catalog.changed',
              'brand.deploy.released',
              'corporate.*.changed',
              'edgepos.runtime.heartbeat',
              'sync.upstream.accepted',
            ].map((topic) => (
              <div key={topic} className="flex items-center justify-between rounded-md border bg-surface-1 p-2.5" style={{ borderColor: 'var(--border)' }}>
                <code className="text-[11px] text-fg-muted">{topic}</code>
                <Badge tone="neutral" variant="outline">—</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      }
    />
  );
}

export function OperationsTelemetryScreen() {
  const { t } = useI18n();
  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.telemetry') }],
        title: t('operations.telemetry.title'),
        description: 'EdgePos heartbeat grid (branch × terminal)',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-TEL-001</code>,
      }}
      primary={
        <SectionCard title="EdgePos grid" description="Phase 3 realtime heartbeat">
          <div className="flex min-h-[200px] items-center justify-center text-[12.5px] text-fg-subtle">
            <Badge tone="info" startDot>Phase 3 — branch 별 drill-down</Badge>
          </div>
        </SectionCard>
      }
    />
  );
}

export function OperationsIncidentsScreen() {
  const { t } = useI18n();
  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.incidents') }],
        title: t('operations.incidents.title'),
        description: 'Heartbeat drop / sync failure spike / license expiry 자동 감지',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-INC-001</code>,
      }}
      primary={
        <SectionCard title="Incidents" description="Phase 3">
          <div className="flex min-h-[200px] items-center justify-center text-[12.5px] text-fg-subtle">
            <Badge tone="info" startDot>Phase 3</Badge>
          </div>
        </SectionCard>
      }
    />
  );
}
