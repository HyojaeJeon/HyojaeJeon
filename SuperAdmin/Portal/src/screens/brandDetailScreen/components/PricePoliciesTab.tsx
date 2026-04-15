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
  BRAND_PRICE_POLICIES_QUERY,
  type BrandPricePoliciesData,
  type BrandPricePolicyRow,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';

const PAGE_SIZE = 20;

interface PricePoliciesTabProps {
  brandHQId: string;
}

export function PricePoliciesTab({ brandHQId }: PricePoliciesTabProps) {
  const { t } = useI18n();
  const [skip, setSkip] = useState(0);

  const { data, loading } = useQuery<BrandPricePoliciesData>(BRAND_PRICE_POLICIES_QUERY, {
    variables: { brandHQId, skip, take: PAGE_SIZE },
    errorPolicy: 'all',
  });

  const rows: BrandPricePolicyRow[] = data?.pricePolicies.success?.data ?? [];
  const total = rows.length < PAGE_SIZE ? skip + rows.length : skip + PAGE_SIZE + 1;

  const columns: DataTableColumn<BrandPricePolicyRow>[] = [
    { key: 'code', header: t('brand.col.policyCode'), width: '160px', render: (r) => <span className="font-mono text-[12px]">{r.policyCode}</span> },
    { key: 'name', header: t('brand.col.policyName'), render: (r) => <span className="font-medium text-fg">{r.policyName}</span> },
    { key: 'type', header: t('brand.col.policyType'), width: '130px', render: (r) => <Badge tone="info" variant="soft">{t(`enum.policyType.${r.policyType}`)}</Badge> },
    { key: 'from', header: t('brand.col.effectiveFrom'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.effectiveFrom)}</span> },
    { key: 'to', header: t('brand.col.effectiveTo'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.effectiveTo ? formatDateTime(r.effectiveTo) : '—'}</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: t('field.createdAt'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
  ];

  if (loading && rows.length === 0) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>;
  }

  return (
    <SectionCard title={t('brand.tab.pricePolicies')} padding="none">
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} compact emptyState={t('brand.empty.pricePolicies')} />
      <div className="p-3">
        <Pagination skip={skip} take={PAGE_SIZE} total={total} onPageChange={setSkip} />
      </div>
    </SectionCard>
  );
}
