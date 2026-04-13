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
  BRAND_MENU_CATEGORIES_QUERY,
  type BrandMenuCategoriesData,
  type BrandMenuCategoryRow,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime } from '@shared/utils/format';

const PAGE_SIZE = 20;

interface MenuCategoriesTabProps {
  brandHQId: string;
}

export function MenuCategoriesTab({ brandHQId }: MenuCategoriesTabProps) {
  const { t } = useI18n();
  const [skip, setSkip] = useState(0);

  const { data, loading } = useQuery<BrandMenuCategoriesData>(BRAND_MENU_CATEGORIES_QUERY, {
    variables: { brandHQId, skip, take: PAGE_SIZE },
    errorPolicy: 'all',
  });

  const rows: BrandMenuCategoryRow[] = data?.menuCategories.success?.data ?? [];
  const total = rows.length < PAGE_SIZE ? skip + rows.length : skip + PAGE_SIZE + 1;

  const columns: DataTableColumn<BrandMenuCategoryRow>[] = [
    { key: 'code', header: t('brand.col.categoryCode'), width: '160px', render: (r) => <span className="font-mono text-[12px]">{r.categoryCode}</span> },
    { key: 'name', header: t('brand.col.categoryName'), render: (r) => <span className="font-medium text-fg">{r.categoryName}</span> },
    { key: 'parent', header: t('brand.col.parentCategory'), width: '160px', render: (r) => r.parentCategoryId ? <span className="font-mono text-[11px] text-fg-subtle">{r.parentCategoryId.slice(0, 8)}</span> : <span className="text-fg-subtle">—</span> },
    { key: 'order', header: t('brand.col.displayOrder'), width: '80px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{r.displayOrder}</span> },
    { key: 'active', header: t('field.status'), width: '100px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>{t('enum.status.ACTIVE')}</Badge> : <Badge tone="neutral" variant="soft">{t('enum.status.INACTIVE')}</Badge> },
    { key: 'createdAt', header: t('field.createdAt'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
  ];

  if (loading && rows.length === 0) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>;
  }

  return (
    <SectionCard title={t('brand.tab.menuCategories')} padding="none">
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} compact emptyState={t('brand.empty.menuCategories')} />
      <div className="p-3">
        <Pagination skip={skip} take={PAGE_SIZE} total={total} onPageChange={setSkip} />
      </div>
    </SectionCard>
  );
}
