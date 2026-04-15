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
  BRAND_PROMOTIONS_QUERY,
  type BrandPromotionsData,
  type BrandPromotionRow,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';

const PAGE_SIZE = 20;

interface PromotionsTabProps {
  brandHQId: string;
}

export function PromotionsTab({ brandHQId }: PromotionsTabProps) {
  const { t } = useI18n();
  const [skip, setSkip] = useState(0);

  const { data, loading } = useQuery<BrandPromotionsData>(BRAND_PROMOTIONS_QUERY, {
    variables: { brandHQId, skip, take: PAGE_SIZE },
    errorPolicy: 'all',
  });

  const rows: BrandPromotionRow[] = data?.promotions.success?.data ?? [];
  const total = rows.length < PAGE_SIZE ? skip + rows.length : skip + PAGE_SIZE + 1;

  const columns: DataTableColumn<BrandPromotionRow>[] = [
    { key: 'code', header: t('brand.col.promotionCode'), width: '160px', render: (r) => <span className="font-mono text-[12px]">{r.promotionCode}</span> },
    { key: 'name', header: t('brand.col.promotionName'), render: (r) => <span className="font-medium text-fg">{r.promotionName}</span> },
    { key: 'type', header: t('brand.col.promotionType'), width: '130px', render: (r) => <Badge tone="info" variant="soft">{t(`enum.promotionType.${r.promotionType}`)}</Badge> },
    { key: 'start', header: t('brand.col.startAt'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.startAt)}</span> },
    { key: 'end', header: t('brand.col.endAt'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.endAt ? formatDateTime(r.endAt) : '—'}</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: t('field.createdAt'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
  ];

  if (loading && rows.length === 0) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>;
  }

  return (
    <SectionCard title={t('brand.tab.promotions')} padding="none">
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} compact emptyState={t('brand.empty.promotions')} />
      <div className="p-3">
        <Pagination skip={skip} take={PAGE_SIZE} total={total} onPageChange={setSkip} />
      </div>
    </SectionCard>
  );
}
