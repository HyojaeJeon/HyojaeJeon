'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { RefreshCw, ScrollText, ArrowRight } from 'lucide-react';
import {
  DashboardPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type SharedUiStat,
  type DataTableColumn,
} from '@platform/shared-ui';
import { OPERATIONS_OVERVIEW_QUERY, type OperationsOverviewData } from '@graphql/queries/landing';
import { useI18n } from '@i18n/I18nProvider';
import { formatRelativeTime, formatDateTime } from '@shared/utils/format';

export function OperationsOverviewScreen() {
  const { t, locale } = useI18n();
  const tag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const { data, loading } = useQuery<OperationsOverviewData>(OPERATIONS_OVERVIEW_QUERY, { errorPolicy: 'all', pollInterval: 15_000 });

  const syncEdges = data?.syncEventConnection.success?.data.edges ?? [];
  const auditEdges = data?.auditLogConnection.success?.data.edges ?? [];

  const metrics: SharedUiStat[] = [
    { label: t('nav.operations.sync'), value: loading ? <Skeleton width={40} height={22} /> : syncEdges.length, tone: 'info' },
    { label: t('nav.system.audit'), value: loading ? <Skeleton width={40} height={22} /> : auditEdges.length, tone: 'brand' },
  ];

  const syncCols: DataTableColumn<{ id: string; eventType: string; edgePosId: string | null; createdAt: string }>[] = [
    { key: 'when', header: 'When', width: '130px', render: (r) => <span className="num text-[12px] text-fg-muted" title={formatDateTime(r.createdAt, tag)}>{formatRelativeTime(r.createdAt, tag)}</span> },
    { key: 'event', header: 'Event', render: (r) => <span className="font-mono text-[12px]">{r.eventType}</span> },
    { key: 'edge', header: 'EdgePos', width: '200px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.edgePosId ?? '—'}</span> },
  ];

  const auditCols: DataTableColumn<{ id: string; createdAt: string; actorType: string; actionType: string; targetType: string }>[] = [
    { key: 'when', header: 'When', width: '130px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatRelativeTime(r.createdAt, tag)}</span> },
    { key: 'actor', header: 'Actor', width: '160px', render: (r) => <Badge tone="neutral" variant="outline">{r.actorType}</Badge> },
    { key: 'action', header: 'Action', render: (r) => <span className="font-mono text-[12px]">{r.actionType}</span> },
    { key: 'target', header: 'Target', width: '160px', render: (r) => <span className="text-[12px]">{r.targetType}</span> },
  ];

  return (
    <DashboardPageTemplate
      header={{
        title: t('nav.operations'),
        description: 'Sync · Realtime · Telemetry · Incidents · 15s polling',
        meta: <code className="text-[11px] text-fg-subtle">SA-OP</code>,
      }}
      metrics={metrics}
      primary={
        <>
          <SectionCard
            title={
              <Link href="/operations/sync" className="flex items-center gap-2 text-fg hover:text-primary">
                <RefreshCw size={14} className="text-primary" />
                {t('operations.syncMonitor.title')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${syncEdges.length} recent event(s)`}
            padding="none"
          >
            {loading ? (
              <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
            ) : (
              <DataTable columns={syncCols} rows={syncEdges.map((e) => e.node)} rowKey={(r) => r.id} compact emptyState={t('common.empty')} />
            )}
          </SectionCard>
          <SectionCard
            title={
              <Link href="/system/audit" className="flex items-center gap-2 text-fg hover:text-primary">
                <ScrollText size={14} className="text-primary" />
                {t('audit.list.title')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${auditEdges.length} recent`}
            padding="none"
          >
            {loading ? (
              <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
            ) : (
              <DataTable columns={auditCols} rows={auditEdges.map((e) => e.node)} rowKey={(r) => r.id} compact emptyState={t('common.empty')} />
            )}
          </SectionCard>
        </>
      }
    />
  );
}
