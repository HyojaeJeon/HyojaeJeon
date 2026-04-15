'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  Pagination,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  BRAND_MENU_ITEMS_QUERY,
  type BrandMenuItemsData,
  type BrandMenuItemRow,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime, formatNumber, toLocaleTag } from '@shared/utils/format';

const PAGE_SIZE = 20;

interface MenuItemsTabProps {
  brandHQId: string;
}

export function MenuItemsTab({ brandHQId }: MenuItemsTabProps) {
  const { t, locale } = useI18n();
  const localeTag = toLocaleTag(locale);
  const [skip, setSkip] = useState(0);

  const { data, loading } = useQuery<BrandMenuItemsData>(BRAND_MENU_ITEMS_QUERY, {
    variables: { brandHQId, skip, take: PAGE_SIZE },
    errorPolicy: 'all',
  });

  const rows: BrandMenuItemRow[] = data?.menuItems.success?.data ?? [];
  const total = rows.length < PAGE_SIZE ? skip + rows.length : skip + PAGE_SIZE + 1;

  const columns: DataTableColumn<BrandMenuItemRow>[] = [
    { key: 'code', header: t('brand.col.itemCode'), width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.itemCode}</span> },
    { key: 'name', header: t('brand.col.itemName'), render: (r) => <span className="font-medium text-fg">{r.itemName}</span> },
    { key: 'type', header: t('brand.col.itemType'), width: '110px', render: (r) => <Badge tone="info" variant="soft">{t(`enum.itemType.${r.itemType}`)}</Badge> },
    { key: 'price', header: t('brand.col.basePrice'), width: '120px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{formatNumber(r.basePrice, localeTag)}</span> },
    { key: 'tax', header: t('brand.col.taxRate'), width: '80px', align: 'right', render: (r) => <span className="num font-mono text-[11px] text-fg-muted">{typeof r.taxRate === 'number' ? `${r.taxRate}%` : '—'}</span> },
    { key: 'unit', header: t('brand.col.unitType'), width: '80px', render: (r) => <span className="text-[12px] text-fg-muted">{r.unitType ?? '—'}</span> },
    { key: 'active', header: t('field.status'), width: '100px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>{t('enum.status.ACTIVE')}</Badge> : <Badge tone="neutral" variant="soft">{t('enum.status.INACTIVE')}</Badge> },
    { key: 'sold', header: t('brand.col.soldOut'), width: '90px', align: 'center', render: (r) => r.isSoldOut ? <Badge tone="warning" variant="soft">{t('brand.col.soldOut')}</Badge> : <span className="text-fg-subtle">—</span> },
    { key: 'createdAt', header: t('field.createdAt'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
  ];

  if (loading && rows.length === 0) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>;
  }

  return (
    <SectionCard title={t('brand.tab.menuItems')} padding="none">
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} compact emptyState={t('brand.empty.menuItems')} />
      <div className="p-3">
        <Pagination skip={skip} take={PAGE_SIZE} total={total} onPageChange={setSkip} />
      </div>
    </SectionCard>
  );
}
