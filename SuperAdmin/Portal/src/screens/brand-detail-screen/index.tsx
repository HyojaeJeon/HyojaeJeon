'use client';

import { useState } from 'react';
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
  Tabs,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  BRAND_DETAIL_QUERY,
  type BrandDetailData,
  type BrandBranchRow,
  type BrandEntitlementRow,
} from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';

export function BrandDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.BRAND_PROFILE_READ);
  const [tab, setTab] = useState<'overview' | 'branches' | 'entitlements'>('overview');

  const { data, loading, error } = useQuery<BrandDetailData>(BRAND_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;

  const b = data?.brand.success?.data;
  const branches: BrandBranchRow[] = data?.branches.success?.data ?? [];
  const entitlements: BrandEntitlementRow[] = data?.brandHqEntitlements.success?.data ?? [];
  const capabilities: string[] = data?.brandHqActiveCapabilities.success?.data ?? [];

  const branchColumns: DataTableColumn<BrandBranchRow>[] = [
    { key: 'code', header: 'Code', width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.branchCode}</span> },
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-fg">{r.branchName}</span> },
    { key: 'type', header: 'Type', width: '110px', render: (r) => <Badge tone="info" variant="soft">{r.branchType}</Badge> },
    { key: 'country', header: 'Country', width: '80px', render: (r) => <span className="font-mono text-[12px] uppercase">{r.countryCode}</span> },
    { key: 'status', header: 'Status', width: '120px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const entColumns: DataTableColumn<BrandEntitlementRow>[] = [
    { key: 'cap', header: 'Capability', render: (r) => <Badge tone="brand" variant="soft">{r.capability}</Badge> },
    { key: 'status', header: 'Status', width: '140px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'activated', header: 'Activated', width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.activatedAt ? formatDateTime(r.activatedAt) : '—'}</span> },
    { key: 'expires', header: 'Expires', width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.expiresAt ? formatDateTime(r.expiresAt) : '∞'}</span> },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.brands'), href: '/tenants/brands' },
          { label: b?.brandCode ?? '…' },
        ],
        title: b ? b.brandName : t('common.loading'),
        description: b ? (
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-fg-muted">{b.brandCode}</span>
            <Badge tone="info" variant="soft">{b.countryCode}</Badge>
            <StatusBadge status={b.status} />
            {capabilities.map((c) => (
              <Badge key={c} tone="success" variant="outline">{c}</Badge>
            ))}
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-BRAND-002</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/tenants/brands')}>
            Back
          </Button>
        ),
      }}
      summaryItems={[
        { label: 'Branches', value: branches.length, tone: 'brand' },
        { label: 'Entitlements', value: entitlements.length, tone: 'info' },
        { label: 'Active capabilities', value: capabilities.length, tone: 'success' },
      ]}
      tabs={
        <Tabs
          items={[
            { key: 'overview', label: 'Overview' },
            { key: 'branches', label: `Branches (${branches.length})` },
            { key: 'entitlements', label: `Entitlements (${entitlements.length})` },
          ]}
          value={tab}
          onChange={(k) => setTab(k as 'overview' | 'branches' | 'entitlements')}
          variant="segment"
        />
      }
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
          {error.message}
        </div>
      )}
      {loading && !b ? (
        <div className="space-y-2"><Skeleton height={40} /><Skeleton height={40} /></div>
      ) : tab === 'overview' && b ? (
        <SectionCard title="Brand profile" description="BrandProfile">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Brand code</span><span className="font-mono text-fg">{b.brandCode}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Brand name</span><span className="text-fg">{b.brandName}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Business no.</span><span className="font-mono text-fg">{b.businessNumber ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Country</span><span className="text-fg">{b.countryCode}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Contact</span><span className="text-fg">{b.contactName ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Email</span><span className="text-fg">{b.contactEmail ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Phone</span><span className="text-fg">{b.contactPhone ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Distributor</span><span className="font-mono text-[11px] text-fg">{b.distributorId ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Default lang</span><span className="text-fg">{b.defaultLanguageCode ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-28 text-fg-muted">Created</span><span className="num font-mono text-fg">{formatDateTime(b.createdAt)}</span></div>
          </div>
        </SectionCard>
      ) : tab === 'branches' ? (
        <SectionCard title="Branches" description={`${branches.length} branch(es)`} padding="none">
          <DataTable
            columns={branchColumns}
            rows={branches}
            rowKey={(r) => r.id}
            compact
            emptyState="No branches"
            onRowClick={(r) => (window.location.href = `/tenants/brands/${id}/branches/${r.id}`)}
          />
        </SectionCard>
      ) : (
        <SectionCard title="Entitlements" description="POS / MEAL_TICKET" padding="none">
          <DataTable
            columns={entColumns}
            rows={entitlements}
            rowKey={(r) => r.id}
            compact
            emptyState="No entitlements"
          />
        </SectionCard>
      )}
    </DetailPageTemplate>
  );
}
