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
import { AUDIT_LOG_CONNECTION_QUERY, type AuditLogData, type AuditLogRow } from '@graphql/queries/system';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { formatDateTime, formatRelativeTime } from '@shared/utils/format';
import { LockedScreen } from '@screens/common/LockedScreen';

export function AuditLogScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const allowed = useHasPermission(PERMISSIONS.PLATFORM_AUDIT_READ);
  const [first] = useState(20);
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<AuditLogData>(AUDIT_LOG_CONNECTION_QUERY, {
    variables: { first, after: cursor },
    errorPolicy: 'all',
  });

  if (!allowed) return <LockedScreen />;

  const edges = data?.auditLogConnection.success?.data.edges ?? [];
  const rows = edges.map((e) => e.node);
  const pageInfo = data?.auditLogConnection.success?.data.pageInfo;

  const columns: DataTableColumn<AuditLogRow>[] = [
    {
      key: 'when',
      header: t('field.when'),
      width: '140px',
      render: (r) => <span className="num text-[12px] text-fg-muted" title={formatDateTime(r.createdAt, localeTag)}>{formatRelativeTime(r.createdAt, localeTag)}</span>,
    },
    { key: 'actor', header: t('field.actor'), width: '160px', render: (r) => <Badge tone="neutral" variant="outline">{r.actorType}</Badge> },
    { key: 'actorId', header: t('field.actorId'), width: '120px', render: (r) => <span className="font-mono text-[11px] text-fg-subtle">{r.actorId?.slice(0, 8) ?? '—'}</span> },
    { key: 'action', header: t('field.actionLabel'), render: (r) => <span className="font-mono text-[12px]">{r.actionType}</span> },
    { key: 'target', header: t('field.target'), render: (r) => <span className="text-[12px]"><span className="text-fg">{r.targetType}</span>{r.targetId && <span className="text-fg-subtle"> · {r.targetId.slice(0, 8)}</span>}</span> },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.system') }, { label: t('nav.system.audit') }],
        title: t('audit.list.title'),
        description: t('audit.list.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SYS-AUDIT-001</code>,
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
        title={t('audit.list.title')}
        description={`${rows.length} ${t('audit.events')} · ${pageInfo?.hasNextPage ? t('audit.moreAvailable') : t('audit.end')}`}
        padding="none"
        footer={
          <div className="flex items-center justify-between px-1 py-2 text-[12px]">
            <button
              type="button"
              disabled={!cursor}
              onClick={() => setCursor(null)}
              className="rounded-md border px-3 py-1 text-fg disabled:opacity-40"
              style={{ borderColor: 'var(--border)' }}
            >
              ← {t('audit.reset')}
            </button>
            <button
              type="button"
              disabled={!pageInfo?.hasNextPage}
              onClick={() => setCursor(pageInfo?.endCursor ?? null)}
              className="rounded-md border px-3 py-1 text-fg disabled:opacity-40"
              style={{ borderColor: 'var(--border)' }}
            >
              {t('audit.next')} →
            </button>
          </div>
        }
      >
        {loading && rows.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={28} />
            ))}
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} emptyState={t('common.empty')} compact />
        )}
      </SectionCard>
    </ListPageTemplate>
  );
}
