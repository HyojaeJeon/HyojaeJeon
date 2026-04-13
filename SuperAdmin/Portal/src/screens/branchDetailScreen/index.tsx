'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  BRANCH_DETAIL_QUERY,
  type BranchDetailData,
  type EdgePosTerminalRow,
} from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';

export function BranchDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string; branchId: string }>();
  const router = useRouter();
  const branchId = params?.branchId;
  const brandId = params?.id;
  const canRead = useHasPermission('brand.branch.read');

  const { data, loading, error } = useQuery<BranchDetailData>(BRANCH_DETAIL_QUERY, {
    variables: { id: branchId },
    skip: !branchId,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;

  const b = data?.branch.success?.data;
  const terminals: EdgePosTerminalRow[] = data?.edgePosTerminals.success?.data ?? [];

  const termCols: DataTableColumn<EdgePosTerminalRow>[] = [
    { key: 'code', header: t('table.header.code'), width: '180px', render: (r) => <span className="font-mono text-[12px]">{r.terminalCode}</span> },
    { key: 'name', header: t('table.header.name'), render: (r) => <span className="font-medium text-fg">{r.terminalName}</span> },
    { key: 'status', header: t('table.header.status'), width: '140px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.brands'), href: '/tenants/brands' },
          { label: 'Brand', href: `/tenants/brands/${brandId}` },
          { label: b?.branchCode ?? '…' },
        ],
        title: b ? b.branchName : t('common.loading'),
        description: b ? (
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-fg-muted">{b.branchCode}</span>
            <Badge tone="info" variant="soft">{b.branchType}</Badge>
            <StatusBadge status={b.status} />
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-BRANCH-002</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/brands/${brandId}`)}>
            Back
          </Button>
        ),
      }}
      summaryItems={[
        { label: 'EdgePos terminals', value: terminals.length, tone: 'brand' },
        { label: 'Country', value: b?.countryCode ?? '—' },
        { label: 'Timezone', value: b?.timeZoneCode ?? '—' },
      ]}
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error.message}</div>
      )}
      <SectionCard title="Branch profile">
        {loading && !b ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={18} />)}</div>
        ) : b ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Branch code</span><span className="font-mono text-fg">{b.branchCode}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Type</span><span className="text-fg">{b.branchType}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Country</span><span className="text-fg">{b.countryCode}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Region</span><span className="text-fg">{b.regionCode ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Address 1</span><span className="text-fg">{b.addressLine1 ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Address 2</span><span className="text-fg">{b.addressLine2 ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Postal</span><span className="font-mono text-fg">{b.postalCode ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Timezone</span><span className="font-mono text-fg">{b.timeZoneCode ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Opening</span><span className="num font-mono text-fg">{b.openingDate ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Closing</span><span className="num font-mono text-fg">{b.closingDate ?? '—'}</span></div>
          </div>
        ) : null}
      </SectionCard>

      <div className="mt-4">
        <SectionCard title="EdgePos terminals" description={`${terminals.length} terminal(s)`} padding="none">
          <DataTable
            columns={termCols}
            rows={terminals}
            rowKey={(r) => r.id}
            compact
            emptyState="No terminals"
          />
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
