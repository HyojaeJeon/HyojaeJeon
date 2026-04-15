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
  BRANCH_DETAIL_QUERY,
  type BranchDetailData,
  type EdgePosTerminalRow,
} from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';
import { MenuCategoriesTab } from '@screens/brandDetailScreen/components/MenuCategoriesTab';
import { MenuItemsTab } from '@screens/brandDetailScreen/components/MenuItemsTab';

type TabKey = 'overview' | 'terminals' | 'menuCategories' | 'menuItems';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-[12.5px]">
      <span className="w-32 shrink-0 text-fg-muted">{label}</span>
      <span className="text-fg">{value ?? '—'}</span>
    </div>
  );
}

export function BranchDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string; branchId: string }>();
  const router = useRouter();
  const branchId = params?.branchId;
  const brandId = params?.id;
  const canRead = useHasPermission('brands:read');
  const [tab, setTab] = useState<TabKey>('overview');

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

  const tabItems = [
    { key: 'overview' as const, label: t('branch.tab.overview') },
    { key: 'terminals' as const, label: `${t('branch.tab.terminals')} (${terminals.length})` },
    { key: 'menuCategories' as const, label: t('branch.tab.menuCategories') },
    { key: 'menuItems' as const, label: t('branch.tab.menuItems') },
  ];

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <SectionCard title={t('branch.profile.title')} description={t('branch.profile.description')}>
            {loading && !b ? (
              <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={18} />)}</div>
            ) : b ? (
              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                <Field label={t('branch.field.branchCode')} value={<span className="font-mono">{b.branchCode}</span>} />
                <Field label={t('branch.field.branchType')} value={<Badge tone="info" variant="soft">{t(`branch.branchType.${b.branchType}`)}</Badge>} />
                <Field label={t('branch.field.country')} value={b.countryCode} />
                <Field label={t('branch.field.region')} value={b.regionCode} />
                <Field label={t('branch.field.address1')} value={b.addressLine1} />
                <Field label={t('branch.field.address2')} value={b.addressLine2} />
                <Field label={t('branch.field.postalCode')} value={b.postalCode ? <span className="font-mono">{b.postalCode}</span> : null} />
                <Field label={t('branch.field.timezone')} value={b.timeZoneCode ? <span className="font-mono">{b.timeZoneCode}</span> : null} />
                <Field label={t('branch.field.openingDate')} value={b.openingDate ? <span className="num font-mono">{b.openingDate}</span> : null} />
                <Field label={t('branch.field.closingDate')} value={b.closingDate ? <span className="num font-mono">{b.closingDate}</span> : null} />
                <Field label={t('field.createdAt')} value={<span className="num font-mono">{formatDateTime(b.createdAt)}</span>} />
              </div>
            ) : null}
          </SectionCard>
        );
      case 'terminals':
        return (
          <SectionCard title={t('branch.terminals.title')} description={`${terminals.length}`} padding="none">
            <DataTable
              columns={termCols}
              rows={terminals}
              rowKey={(r) => r.id}
              compact
              emptyState={t('branch.terminals.empty')}
            />
          </SectionCard>
        );
      case 'menuCategories':
        return brandId ? <MenuCategoriesTab brandHQId={brandId} /> : null;
      case 'menuItems':
        return brandId ? <MenuItemsTab brandHQId={brandId} /> : null;
      default:
        return null;
    }
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.brands'), href: '/tenants/brands' },
          { label: b?.branchName ?? '…', href: `/tenants/brands/${brandId}` },
          { label: b?.branchCode ?? '…' },
        ],
        title: b ? b.branchName : t('common.loading'),
        description: b ? (
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-fg-muted">{b.branchCode}</span>
            <Badge tone="info" variant="soft">{t(`branch.branchType.${b.branchType}`)}</Badge>
            <StatusBadge status={b.status} />
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-BRANCH-002</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/brands/${brandId}`)}>
            {t('branch.action.back')}
          </Button>
        ),
      }}
      summaryItems={[
        { label: t('branch.summary.terminals'), value: terminals.length, tone: 'brand' },
        { label: t('branch.summary.country'), value: b?.countryCode ?? '—' },
        { label: t('branch.summary.timezone'), value: b?.timeZoneCode ?? '—' },
      ]}
      tabs={
        <Tabs
          items={tabItems}
          value={tab}
          onChange={(k) => setTab(k as TabKey)}
          variant="segment"
        />
      }
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error.message}</div>
      )}
      {renderTab()}
    </DetailPageTemplate>
  );
}
