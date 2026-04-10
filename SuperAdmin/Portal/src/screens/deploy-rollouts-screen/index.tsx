'use client';

import { useQuery } from '@apollo/client';
import { Activity } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { DEPLOY_PACKAGES_QUERY, type DeployPackagesData, type DeployPackageRow } from '@graphql/queries/deploy';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime } from '@shared/utils/format';

/**
 * SA-DEPLOY-ROLLOUT-001 — rollouts 는 백엔드가 scope 필수인 deployReleases 로만 조회 가능.
 * 임시로 deployPackages 를 기반으로 "최근 패키지 + 릴리스 상태" 요약을 제공.
 * Phase 6 에서 backend `deployReleases(scope?)` 추가되면 교체.
 */
export function DeployRolloutsScreen() {
  const { t } = useI18n();
  const { data, loading, refetch } = useQuery<DeployPackagesData>(DEPLOY_PACKAGES_QUERY, {
    variables: { skip: 0, take: 20 },
    pollInterval: 20_000,
    errorPolicy: 'all',
  });
  const packages = data?.deployPackages.success?.data ?? [];

  const columns: DataTableColumn<DeployPackageRow>[] = [
    { key: 'code', header: 'Package', render: (r) => <span className="font-mono text-[12px]">{r.packageCode}</span> },
    { key: 'version', header: 'Version', width: '120px', render: (r) => <span className="font-mono text-[12px]">{r.version}</span> },
    { key: 'target', header: 'Target', width: '140px', render: (r) => <Badge tone="info" variant="soft">{r.platformTarget}</Badge> },
    {
      key: 'state',
      header: 'Rollout state',
      width: '160px',
      render: (r) => r.releasedAt ? <Badge tone="success" startDot>RELEASED</Badge> : <Badge tone="warning" startDot>DRAFT</Badge>,
    },
    { key: 'released', header: 'Released', render: (r) => r.releasedAt ? <span className="num text-[12px] text-fg-muted">{formatDateTime(r.releasedAt)}</span> : <span className="text-fg-subtle">—</span> },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.deploy') }, { label: t('nav.deploy.rollouts') }],
        title: t('nav.deploy.rollouts'),
        description: 'Recent deploy packages with rollout state · 20s polling',
        meta: <code className="text-[11px] text-fg-subtle">SA-DEPLOY-ROLLOUT-001</code>,
        actions: (
          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2"
            style={{ borderColor: 'var(--border)' }}
          >
            {t('action.refresh')}
          </button>
        ),
      }}
    >
      <SectionCard
        title={<span className="flex items-center gap-2"><Activity size={14} className="text-primary" />Packages &amp; rollout state</span>}
        description={`${packages.length} package(s)`}
        padding="none"
      >
        {loading && packages.length === 0 ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
        ) : (
          <DataTable columns={columns} rows={packages} rowKey={(r) => r.id} compact emptyState={t('common.empty')} />
        )}
      </SectionCard>
    </ListPageTemplate>
  );
}
