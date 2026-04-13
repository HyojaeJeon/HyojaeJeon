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
  BRAND_CATALOG_QUERY,
  type BrandDetailData,
  type BrandCatalogData,
  type BrandBranchRow,
  type BrandEntitlementRow,
} from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';
import { MenuCategoriesTab } from './components/MenuCategoriesTab';
import { MenuItemsTab } from './components/MenuItemsTab';
import { PricePoliciesTab } from './components/PricePoliciesTab';
import { PromotionsTab } from './components/PromotionsTab';

type TabKey = 'overview' | 'branches' | 'entitlements' | 'menuCategories' | 'menuItems' | 'pricePolicies' | 'promotions';

export function BrandDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.BRAND_PROFILE_READ);
  const [tab, setTab] = useState<TabKey>('overview');

  const { data, loading, error } = useQuery<BrandDetailData>(BRAND_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  const { data: catalogData } = useQuery<BrandCatalogData>(BRAND_CATALOG_QUERY, {
    variables: { brandHQId: id },
    skip: !id,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;

  const b = data?.brand.success?.data;
  const branches: BrandBranchRow[] = data?.branches.success?.data ?? [];
  const entitlements: BrandEntitlementRow[] = data?.brandHqEntitlements.success?.data ?? [];
  const capabilities: string[] = data?.brandHqActiveCapabilities.success?.data ?? [];

  const menuCategoriesCount = catalogData?.menuCategories.success?.data.length ?? 0;
  const menuItemsCount = catalogData?.menuItems.success?.data.length ?? 0;
  const pricePoliciesCount = catalogData?.pricePolicies.success?.data.length ?? 0;
  const promotionsCount = catalogData?.promotions.success?.data.length ?? 0;

  const branchColumns: DataTableColumn<BrandBranchRow>[] = [
    { key: 'code', header: t('field.code'), width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.branchCode}</span> },
    { key: 'name', header: t('field.name'), render: (r) => <span className="font-medium text-fg">{r.branchName}</span> },
    { key: 'type', header: t('brand.col.type'), width: '110px', render: (r) => <Badge tone="info" variant="soft">{r.branchType}</Badge> },
    { key: 'country', header: t('tenant.country'), width: '80px', render: (r) => <span className="font-mono text-[12px] uppercase">{r.countryCode}</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const entColumns: DataTableColumn<BrandEntitlementRow>[] = [
    { key: 'cap', header: t('entitlement.columns.capability'), render: (r) => <Badge tone="brand" variant="soft">{t(`enum.capability.${r.capability}`)}</Badge> },
    { key: 'status', header: t('entitlement.columns.status'), width: '140px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'activated', header: t('entitlement.columns.activated'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.activatedAt ? formatDateTime(r.activatedAt) : '—'}</span> },
    { key: 'expires', header: t('entitlement.columns.expires'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.expiresAt ? formatDateTime(r.expiresAt) : '∞'}</span> },
  ];

  const renderTabContent = () => {
    if (loading && !b) {
      return <div className="space-y-2"><Skeleton height={40} /><Skeleton height={40} /></div>;
    }

    switch (tab) {
      case 'overview':
        return b ? (
          <SectionCard title={t('brand.profile.title')} description={t('brand.profile.description')}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('brand.profile.brandCode')}</span><span className="font-mono text-fg">{b.brandCode}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('brand.profile.brandName')}</span><span className="text-fg">{b.brandName}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('brand.profile.businessNumber')}</span><span className="font-mono text-fg">{b.businessNumber ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('tenant.country')}</span><span className="text-fg">{b.countryCode}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('brand.profile.contact')}</span><span className="text-fg">{b.contactName ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('field.email')}</span><span className="text-fg">{b.contactEmail ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('field.phone')}</span><span className="text-fg">{b.contactPhone ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('brand.profile.distributor')}</span><span className="font-mono text-[11px] text-fg">{b.distributorId ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('brand.profile.defaultLang')}</span><span className="text-fg">{b.defaultLanguageCode ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-28 text-fg-muted">{t('field.createdAt')}</span><span className="num font-mono text-fg">{formatDateTime(b.createdAt)}</span></div>
            </div>
          </SectionCard>
        ) : null;
      case 'branches':
        return (
          <SectionCard title={t('brand.tab.branches')} description={`${branches.length} ${t('brand.branchCount')}`} padding="none">
            <DataTable
              columns={branchColumns}
              rows={branches}
              rowKey={(r) => r.id}
              compact
              emptyState={t('brand.empty.branches')}
              onRowClick={(r) => (window.location.href = `/tenants/brands/${id}/branches/${r.id}`)}
            />
          </SectionCard>
        );
      case 'entitlements':
        return (
          <SectionCard title={t('brand.tab.entitlements')} description={t('brand.entitlementTypes')} padding="none">
            <DataTable
              columns={entColumns}
              rows={entitlements}
              rowKey={(r) => r.id}
              compact
              emptyState={t('brand.empty.entitlements')}
            />
          </SectionCard>
        );
      case 'menuCategories':
        return id ? <MenuCategoriesTab brandHQId={id} /> : null;
      case 'menuItems':
        return id ? <MenuItemsTab brandHQId={id} /> : null;
      case 'pricePolicies':
        return id ? <PricePoliciesTab brandHQId={id} /> : null;
      case 'promotions':
        return id ? <PromotionsTab brandHQId={id} /> : null;
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
            {t('brand.action.back')}
          </Button>
        ),
      }}
      summaryItems={[
        { label: t('brand.summary.branches'), value: branches.length, tone: 'brand' },
        { label: t('brand.summary.entitlements'), value: entitlements.length, tone: 'info' },
        { label: t('brand.summary.activeCapabilities'), value: capabilities.length, tone: 'success' },
        { label: t('brand.summary.menuCategories'), value: menuCategoriesCount, tone: 'brand' },
        { label: t('brand.summary.menuItems'), value: menuItemsCount, tone: 'info' },
        { label: t('brand.summary.activePolicies'), value: pricePoliciesCount, tone: 'warning' },
        { label: t('brand.summary.activePromotions'), value: promotionsCount, tone: 'success' },
      ]}
      tabs={
        <Tabs
          items={[
            { key: 'overview', label: t('brand.tab.overview') },
            { key: 'branches', label: `${t('brand.tab.branches')} (${branches.length})` },
            { key: 'entitlements', label: `${t('brand.tab.entitlements')} (${entitlements.length})` },
            { key: 'menuCategories', label: `${t('brand.tab.menuCategories')} (${menuCategoriesCount})` },
            { key: 'menuItems', label: `${t('brand.tab.menuItems')} (${menuItemsCount})` },
            { key: 'pricePolicies', label: `${t('brand.tab.pricePolicies')} (${pricePoliciesCount})` },
            { key: 'promotions', label: `${t('brand.tab.promotions')} (${promotionsCount})` },
          ]}
          value={tab}
          onChange={(k) => setTab(k as TabKey)}
          variant="segment"
        />
      }
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
          {error.message}
        </div>
      )}
      {renderTabContent()}
    </DetailPageTemplate>
  );
}
