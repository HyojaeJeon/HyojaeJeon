'use client';

import { useQuery } from '@apollo/client';
import { Radar, MonitorDot, AlertTriangle } from 'lucide-react';
import {
  DashboardPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type DataTableColumn,
  type SharedUiStat,
} from '@platform/shared-ui';
import { SYNC_EVENTS_QUERY, type SyncEventsData, type SyncEventRow } from '@graphql/queries/governance';
import { AUDIT_LOG_CONNECTION_QUERY, type AuditLogData, type AuditLogRow } from '@graphql/queries/system';
import { useI18n } from '@i18n/I18nProvider';
import { formatRelativeTime, formatDateTime } from '@shared/utils/format';

/* ─────────────────────────── Realtime Health ─────────────────────────── */

const TOPICS = [
  'platform.superadmin.audit.created',
  'platform.superadmin.policy.changed',
  'platform.superadmin.license.changed',
  'brand.profile.changed',
  'brand.catalog.changed',
  'brand.deploy.released',
  'corporate.wallet.changed',
  'edgepos.runtime.heartbeat',
  'sync.upstream.accepted',
];

export function OperationsRealtimeScreen() {
  const { t, locale } = useI18n();
  const tag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const { data, loading, refetch } = useQuery<SyncEventsData>(SYNC_EVENTS_QUERY, {
    variables: { first: 20, after: null },
    pollInterval: 10_000,
    errorPolicy: 'all',
  });
  const events = data?.syncEventConnection.success?.data.edges.map((e) => e.node) ?? [];

  const byType = new Map<string, number>();
  events.forEach((e) => byType.set(e.eventType, (byType.get(e.eventType) ?? 0) + 1));

  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.realtime') }],
        title: t('operations.realtime.title'),
        description: 'Recent syncEvents grouped by topic · 10s polling',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-RT-001</code>,
        actions: (
          <button type="button" onClick={() => refetch()} className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2" style={{ borderColor: 'var(--border)' }}>
            {t('action.refresh')}
          </button>
        ),
      }}
      primary={
        <SectionCard title={<span className="flex items-center gap-2"><Radar size={14} className="text-primary" />Topic activity</span>} description="live counters from recent sync events">
          {loading && events.length === 0 ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={24} />)}</div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {TOPICS.map((topic) => {
                const cnt = byType.get(topic) ?? 0;
                return (
                  <div key={topic} className="flex items-center justify-between rounded-md border bg-surface-1 p-2.5" style={{ borderColor: 'var(--border)' }}>
                    <code className="text-[11px] text-fg-muted">{topic}</code>
                    <Badge tone={cnt > 0 ? 'success' : 'neutral'} startDot={cnt > 0}>
                      {cnt}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      }
    />
  );
}

/* ─────────────────────────── Telemetry ─────────────────────────── */

export function OperationsTelemetryScreen() {
  const { t, locale } = useI18n();
  const tag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const { data, loading, refetch } = useQuery<SyncEventsData>(SYNC_EVENTS_QUERY, {
    variables: { first: 30, after: null },
    pollInterval: 15_000,
    errorPolicy: 'all',
  });
  const events: SyncEventRow[] = data?.syncEventConnection.success?.data.edges.map((e) => e.node) ?? [];
  const byEdge = new Map<string, { count: number; lastAt: string; lastEvent: string }>();
  events.forEach((e) => {
    if (!e.edgePosId) return;
    const ex = byEdge.get(e.edgePosId) ?? { count: 0, lastAt: e.createdAt, lastEvent: e.eventType };
    ex.count++;
    if (new Date(e.createdAt) > new Date(ex.lastAt)) {
      ex.lastAt = e.createdAt;
      ex.lastEvent = e.eventType;
    }
    byEdge.set(e.edgePosId, ex);
  });

  const rows = Array.from(byEdge.entries()).map(([edgeId, v]) => ({ id: edgeId, ...v }));

  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    { key: 'edge', header: 'EdgePos ID', render: (r) => <span className="font-mono text-[11px]">{r.id}</span> },
    { key: 'count', header: 'Events', width: '100px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{r.count}</span> },
    { key: 'last', header: 'Last event', render: (r) => <Badge tone="info" variant="soft">{r.lastEvent}</Badge> },
    { key: 'at', header: 'At', width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted" title={formatDateTime(r.lastAt, tag)}>{formatRelativeTime(r.lastAt, tag)}</span> },
  ];

  const metrics: SharedUiStat[] = [
    { label: 'Unique EdgePos', value: loading ? <Skeleton width={40} height={22} /> : rows.length, tone: 'brand' },
    { label: 'Recent events', value: loading ? <Skeleton width={40} height={22} /> : events.length, tone: 'info' },
  ];

  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.telemetry') }],
        title: t('operations.telemetry.title'),
        description: 'EdgePos heartbeat / sync activity derived from syncEventConnection · 15s polling',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-TEL-001</code>,
        actions: (
          <button type="button" onClick={() => refetch()} className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2" style={{ borderColor: 'var(--border)' }}>
            {t('action.refresh')}
          </button>
        ),
      }}
      metrics={metrics}
      primary={
        <SectionCard title={<span className="flex items-center gap-2"><MonitorDot size={14} className="text-primary" />Terminals by recent activity</span>} padding="none">
          {loading && rows.length === 0 ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
          ) : (
            <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} compact emptyState="No recent terminal activity" />
          )}
        </SectionCard>
      }
    />
  );
}

/* ─────────────────────────── Incidents ─────────────────────────── */

export function OperationsIncidentsScreen() {
  const { t, locale } = useI18n();
  const tag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const { data, loading, refetch } = useQuery<AuditLogData>(AUDIT_LOG_CONNECTION_QUERY, {
    variables: { first: 20, after: null },
    pollInterval: 30_000,
    errorPolicy: 'all',
  });

  const edges = data?.auditLogConnection.success?.data.edges ?? [];
  // 단순 휴리스틱: actionType 에 FAIL/ERROR/DELETE/REVOKE 포함된 audit 를 incident 로 노출
  const incidents: AuditLogRow[] = edges
    .map((e) => e.node)
    .filter((n) => /FAIL|ERROR|DELETE|REVOKE|DISABLE|SUSPEND/i.test(n.actionType));

  const columns: DataTableColumn<AuditLogRow>[] = [
    { key: 'when', header: 'When', width: '140px', render: (r) => <span className="num text-[12px] text-fg-muted" title={formatDateTime(r.createdAt, tag)}>{formatRelativeTime(r.createdAt, tag)}</span> },
    { key: 'actor', header: 'Actor', width: '160px', render: (r) => <Badge tone="neutral" variant="outline">{r.actorType}</Badge> },
    { key: 'action', header: 'Action', render: (r) => <span className="font-mono text-[12px] text-danger">{r.actionType}</span> },
    { key: 'target', header: 'Target', width: '200px', render: (r) => <span className="text-[12px]"><span className="text-fg">{r.targetType}</span>{r.targetId && <span className="text-fg-subtle"> · {r.targetId.slice(0, 8)}</span>}</span> },
  ];

  return (
    <DashboardPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.incidents') }],
        title: t('operations.incidents.title'),
        description: 'AuditLog 중 FAIL / ERROR / DELETE / REVOKE / SUSPEND 패턴 필터링 · 30s polling',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-INC-001</code>,
        actions: (
          <button type="button" onClick={() => refetch()} className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2" style={{ borderColor: 'var(--border)' }}>
            {t('action.refresh')}
          </button>
        ),
      }}
      primary={
        <SectionCard title={<span className="flex items-center gap-2"><AlertTriangle size={14} className="text-warn" />Recent incidents</span>} description={`${incidents.length} / ${edges.length} audit events`} padding="none">
          {loading && incidents.length === 0 ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
          ) : (
            <DataTable columns={columns} rows={incidents} rowKey={(r) => r.id} compact emptyState="No incidents detected" />
          )}
        </SectionCard>
      }
    />
  );
}
