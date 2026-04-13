'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { RefreshCw } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { SYNC_EVENTS_QUERY, type SyncEventsData, type SyncEventRow } from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime, formatRelativeTime } from '@shared/utils/format';

export function SyncMonitorScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<SyncEventsData>(SYNC_EVENTS_QUERY, {
    variables: { first: 20, after: cursor },
    errorPolicy: 'all',
    pollInterval: 10_000,
  });

  const edges = data?.syncEventConnection.success?.data.edges ?? [];
  const rows = edges.map((e) => e.node);
  const pageInfo = data?.syncEventConnection.success?.data.pageInfo;

  const columns: DataTableColumn<SyncEventRow>[] = [
    {
      key: 'when',
      header: t('sync.when'),
      width: '140px',
      render: (r) => (
        <span className="num text-[12px] text-fg-muted" title={formatDateTime(r.createdAt, localeTag)}>
          {formatRelativeTime(r.createdAt, localeTag)}
        </span>
      ),
    },
    { key: 'event', header: t('sync.event'), render: (r) => <Badge tone="info" variant="soft"><span className="font-mono">{r.eventType}</span></Badge> },
    { key: 'edge', header: t('sync.edgePos'), width: '200px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.edgePosId ?? '—'}</span> },
    { key: 'req', header: t('sync.requestId'), width: '200px', render: (r) => <span className="font-mono text-[11px] text-fg-subtle">{r.requestId ?? '—'}</span> },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.operations') }, { label: t('nav.operations.sync') }],
        title: t('operations.syncMonitor.title'),
        description: t('sync.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-OP-SYNC-001</code>,
        actions: (
          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <RefreshCw size={13} />
            {t('action.refresh')}
          </button>
        ),
      }}
    >
      <SectionCard
        title={t('sync.sectionTitle')}
        description={`${rows.length} ${t('sync.eventCount')} · ${pageInfo?.hasNextPage ? t('sync.more') : t('sync.end')}`}
        padding="none"
        footer={
          <div className="flex items-center justify-between px-1 py-2">
            <button
              type="button"
              disabled={!cursor}
              onClick={() => setCursor(null)}
              className="rounded-md border px-3 py-1 text-[12px] text-fg disabled:opacity-40"
              style={{ borderColor: 'var(--border)' }}
            >
              ← {t('sync.reset')}
            </button>
            <button
              type="button"
              disabled={!pageInfo?.hasNextPage}
              onClick={() => setCursor(pageInfo?.endCursor ?? null)}
              className="rounded-md border px-3 py-1 text-[12px] text-fg disabled:opacity-40"
              style={{ borderColor: 'var(--border)' }}
            >
              {t('sync.next')} →
            </button>
          </div>
        }
      >
        {loading && rows.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={28} />)}
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} compact emptyState={t('common.empty')} />
        )}
      </SectionCard>
    </ListPageTemplate>
  );
}
