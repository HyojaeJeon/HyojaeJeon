'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Package, GitBranch, Activity, ArrowRight } from 'lucide-react';
import {
  DashboardPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type SharedUiStat,
  type DataTableColumn,
} from '@platform/shared-ui';
import { DEPLOY_OVERVIEW_QUERY, type DeployOverviewData } from '@graphql/queries/landing';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime } from '@shared/utils/format';

export function DeployOverviewScreen() {
  const { t } = useI18n();
  const { data, loading } = useQuery<DeployOverviewData>(DEPLOY_OVERVIEW_QUERY, { errorPolicy: 'all' });
  const packages = data?.deployPackages.success?.data ?? [];

  const metrics: SharedUiStat[] = [
    { label: t('nav.deploy.packages'), value: loading ? <Skeleton width={40} height={22} /> : packages.length, icon: <Package size={14} />, tone: 'brand' },
    { label: t('nav.deploy.releases'), value: '—', icon: <GitBranch size={14} />, hint: 'scope 필요' },
    { label: t('nav.deploy.rollouts'), value: '—', icon: <Activity size={14} />, hint: 'Phase 6' },
  ];

  const cols: DataTableColumn<{ id: string; packageCode: string; version: string; platformTarget: string; createdAt: string; releasedAt: string | null }>[] = [
    { key: 'code', header: 'Code', width: '200px', render: (r) => <span className="font-mono text-[12px]">{r.packageCode}</span> },
    { key: 'version', header: 'Version', width: '120px', render: (r) => <span className="font-mono text-[12px]">{r.version}</span> },
    { key: 'target', header: 'Target', width: '140px', render: (r) => <Badge tone="info" variant="soft">{r.platformTarget}</Badge> },
    { key: 'released', header: 'Released', render: (r) => r.releasedAt ? <span className="num text-[12px] text-fg-muted">{formatDateTime(r.releasedAt)}</span> : <Badge tone="warning" variant="soft">DRAFT</Badge> },
  ];

  return (
    <DashboardPageTemplate
      header={{
        title: t('nav.deploy'),
        description: 'Deploy packages · releases · rollouts',
        meta: <code className="text-[11px] text-fg-subtle">SA-DEPLOY</code>,
      }}
      metrics={metrics}
      primary={
        <SectionCard
          title={
            <Link href="/deploy/packages" className="flex items-center gap-2 text-fg hover:text-primary">
              <Package size={14} className="text-primary" />
              {t('nav.deploy.packages')}
              <ArrowRight size={12} />
            </Link>
          }
          description={`${packages.length} package(s)`}
          padding="none"
        >
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
          ) : (
            <DataTable columns={cols} rows={packages.slice(0, 10)} rowKey={(r) => r.id} compact emptyState={t('common.empty')} />
          )}
        </SectionCard>
      }
    />
  );
}
