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
  BRAND_CATALOG_QUERY,
  type BrandCatalogData,
  type MenuCategoryRow,
  type MenuItemRow,
} from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

export function BrandCatalogScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const brandHQId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.BRAND_CATALOG_READ);
  const [tab, setTab] = useState<'categories' | 'items' | 'prices' | 'promos'>('categories');

  const { data, loading, error } = useQuery<BrandCatalogData>(BRAND_CATALOG_QUERY, {
    variables: { brandHQId },
    skip: !brandHQId,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;

  const categories: MenuCategoryRow[] = data?.menuCategories.success?.data ?? [];
  const items: MenuItemRow[] = data?.menuItems.success?.data ?? [];
  const prices = data?.pricePolicies.success?.data ?? [];
  const promos = data?.promotions.success?.data ?? [];

  const catCols: DataTableColumn<MenuCategoryRow>[] = [
    { key: 'code', header: t('catalog.col.code'), width: '160px', render: (r) => <span className="font-mono text-[12px]">{r.categoryCode}</span> },
    { key: 'name', header: t('catalog.col.name'), render: (r) => <span className="font-medium text-fg">{r.categoryName}</span> },
    { key: 'order', header: t('catalog.col.order'), width: '80px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{r.displayOrder}</span> },
    { key: 'parent', header: t('catalog.col.parent'), width: '160px', render: (r) => r.parentCategoryId ? <span className="font-mono text-[11px] text-fg-subtle">{r.parentCategoryId.slice(0, 8)}</span> : <span className="text-fg-subtle">—</span> },
    { key: 'active', header: t('field.active'), width: '90px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>{t('enum.status.ACTIVE')}</Badge> : <Badge tone="neutral" variant="soft">{t('enum.status.INACTIVE')}</Badge> },
  ];

  const itemCols: DataTableColumn<MenuItemRow>[] = [
    { key: 'code', header: t('catalog.col.code'), width: '160px', render: (r) => <span className="font-mono text-[12px]">{r.itemCode}</span> },
    { key: 'name', header: t('catalog.col.name'), render: (r) => <span className="font-medium text-fg">{r.itemName}</span> },
    { key: 'price', header: t('catalog.col.basePrice'), width: '120px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{r.basePrice}</span> },
    { key: 'tax', header: t('catalog.col.tax'), width: '80px', align: 'right', render: (r) => <span className="num font-mono text-[11px] text-fg-muted">{r.taxRate}</span> },
    { key: 'active', header: t('field.active'), width: '90px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>{t('enum.status.ACTIVE')}</Badge> : <Badge tone="neutral" variant="soft">{t('enum.status.INACTIVE')}</Badge> },
    { key: 'sold', header: t('catalog.col.soldOut'), width: '100px', align: 'center', render: (r) => r.isSoldOut ? <Badge tone="warning" variant="soft">{t('catalog.soldOut')}</Badge> : <span className="text-fg-subtle">—</span> },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.brands'), href: '/tenants/brands' },
          { label: t('catalog.title') },
        ],
        title: t('catalog.title'),
        description: t('catalog.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CAT-*</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/brands/${brandHQId}`)}>
            {t('catalog.back')}
          </Button>
        ),
      }}
      summaryItems={[
        { label: t('catalog.tab.categories'), value: categories.length, tone: 'brand' },
        { label: t('catalog.tab.items'), value: items.length, tone: 'info' },
        { label: t('catalog.tab.prices'), value: prices.length, tone: 'warning' },
        { label: t('catalog.tab.promos'), value: promos.length, tone: 'success' },
      ]}
      tabs={
        <Tabs
          items={[
            { key: 'categories', label: `${t('catalog.tab.categories')} (${categories.length})` },
            { key: 'items', label: `${t('catalog.tab.items')} (${items.length})` },
            { key: 'prices', label: `${t('catalog.tab.prices')} (${prices.length})` },
            { key: 'promos', label: `${t('catalog.tab.promos')} (${promos.length})` },
          ]}
          value={tab}
          onChange={(k) => setTab(k as typeof tab)}
          variant="segment"
        />
      }
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error.message}</div>
      )}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}
        </div>
      ) : tab === 'categories' ? (
        <SectionCard title={t('catalog.section.categories')} padding="none">
          <DataTable columns={catCols} rows={categories} rowKey={(r) => r.id} compact emptyState={t('catalog.empty.categories')} />
        </SectionCard>
      ) : tab === 'items' ? (
        <SectionCard title={t('catalog.section.items')} padding="none">
          <DataTable columns={itemCols} rows={items} rowKey={(r) => r.id} compact emptyState={t('catalog.empty.items')} />
        </SectionCard>
      ) : (
        <SectionCard title={tab === 'prices' ? t('catalog.tab.prices') : t('catalog.tab.promos')} description={t('common.comingSoon')}>
          <div className="flex min-h-[120px] items-center justify-center text-[12.5px] text-fg-subtle">
            {tab === 'prices' ? prices.length : promos.length} {t('catalog.records')}
          </div>
        </SectionCard>
      )}
    </DetailPageTemplate>
  );
}
