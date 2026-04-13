'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_REQUESTS_QUERY,
  type CorporateRequestsData,
  type CorporateRequestRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatDateTime, formatRelativeTime } from '@shared/utils/format';

function actionTone(action: string): 'success' | 'warning' | 'danger' | 'neutral' | 'info' {
  if (/CREATE|ENROLL|GRANT|APPROVE/i.test(action)) return 'success';
  if (/UPDATE|CHANGE|FUND|TOPUP/i.test(action)) return 'info';
  if (/SUSPEND|DEACTIVATE|PAUSE/i.test(action)) return 'warning';
  if (/DELETE|REVOKE|REVERSE|FAIL/i.test(action)) return 'danger';
  return 'neutral';
}

export function CorporateRequestsScreen() {
  const { t, locale } = useI18n();
  const tag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.PLATFORM_AUDIT_READ);

  const { data, loading, refetch } = useQuery<CorporateRequestsData>(CORPORATE_REQUESTS_QUERY, {
    variables: { first: 30, targetId: corporateId },
    errorPolicy: 'all',
    pollInterval: 20_000,
  });

  if (!canRead) return <LockedScreen />;

  const edges = data?.auditLogConnection.success?.data.edges ?? [];
  const rows: CorporateRequestRow[] = edges.map((e) => e.node);

  const columns: DataTableColumn<CorporateRequestRow>[] = [
    {
      key: 'when',
      header: t('field.when'),
      width: '140px',
      render: (r) => (
        <span className="num text-[12px] text-fg-muted" title={formatDateTime(r.createdAt, tag)}>
          {formatRelativeTime(r.createdAt, tag)}
        </span>
      ),
    },
    { key: 'actor', header: t('field.actor'), width: '160px', render: (r) => <Badge tone="neutral" variant="outline">{r.actorType}</Badge> },
    { key: 'actorId', header: t('field.actorId'), width: '120px', render: (r) => <span className="font-mono text-[11px] text-fg-subtle">{r.actorId?.slice(0, 8) ?? '—'}</span> },
    {
      key: 'action',
      header: t('field.actionLabel'),
      render: (r) => (
        <Badge tone={actionTone(r.actionType)} variant="soft">
          <span className="font-mono text-[11px]">{r.actionType}</span>
        </Badge>
      ),
    },
    { key: 'target', header: t('field.target'), width: '220px', render: (r) => <span className="text-[12px]"><span className="text-fg">{r.targetType}</span></span> },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: corporateId?.slice(0, 8) ?? '—', href: `/tenants/corporates/${corporateId}` },
          { label: t('corporate.detail.subnav.einvoices') === t('corporate.detail.subnav.einvoices') ? t('corporate.requests.title') : '' },
        ],
        title: t('corporate.requests.title'),
        description: t('corporate.requests.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-REQ-001</code>,
        actions: (
          <>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <RefreshCw size={13} />
              {t('action.refresh')}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/tenants/corporates/${corporateId}`)}
              className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <ArrowLeft size={13} />
              Back
            </button>
          </>
        ),
      }}
    >
      <SectionCard
        title={`${rows.length} request(s)`}
        description={`targetId=${corporateId?.slice(0, 8) ?? '—'} · 20s polling`}
        padding="none"
      >
        {loading && rows.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={28} />)}
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} compact emptyState={t('corporate.requests.empty')} />
        )}
      </SectionCard>
    </ListPageTemplate>
  );
}
