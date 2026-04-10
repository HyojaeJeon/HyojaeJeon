'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Grid2x2Check } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { BRAND_LIST_QUERY, BRAND_DETAIL_QUERY, type BrandListData, type BrandDetailData, type BrandEntitlementRow } from '@graphql/queries/brand';
import { FilterBar } from '@shared/ui/FilterBar';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime } from '@shared/utils/format';

/**
 * SA-ENT-001 — brandHqEntitlements 는 `brandHqId` 가 필수이므로 글로벌 매트릭스를 만들 수 없다.
 * brand 를 선택하면 해당 brand 의 entitlement 를 조회하는 2-step pattern.
 * 1P1Q 원칙: brand 선택 상태를 variable 로 넘겨 단일 화면 내에서 두 operation 은 사용하지만
 * 각 operation 은 화면의 서로 다른 상태 (bootstrap vs selection-driven) 라서 허용.
 */
export function EntitlementsOverviewScreen() {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const brandsQ = useQuery<BrandListData>(BRAND_LIST_QUERY, {
    variables: { skip: 0, take: 50 },
    errorPolicy: 'all',
  });

  const detailQ = useQuery<BrandDetailData>(BRAND_DETAIL_QUERY, {
    variables: { id: selectedId },
    skip: !selectedId,
    errorPolicy: 'all',
  });

  const brands = brandsQ.data?.brands.success?.data ?? [];
  const selectedBrand = useMemo(() => brands.find((b) => b.id === selectedId), [brands, selectedId]);
  const entitlements: BrandEntitlementRow[] = detailQ.data?.brandHqEntitlements.success?.data ?? [];
  const capabilities: string[] = detailQ.data?.brandHqActiveCapabilities.success?.data ?? [];

  const entCols: DataTableColumn<BrandEntitlementRow>[] = [
    { key: 'cap', header: t('entitlement.columns.capability'), render: (r) => <Badge tone="brand" variant="soft">{r.capability}</Badge> },
    { key: 'status', header: t('entitlement.columns.status'), width: '140px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'activated', header: t('entitlement.columns.activated'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.activatedAt ? formatDateTime(r.activatedAt) : '—'}</span> },
    { key: 'expires', header: t('entitlement.columns.expires'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{r.expiresAt ? formatDateTime(r.expiresAt) : '∞'}</span> },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.governance') }, { label: t('nav.governance.entitlements') }],
        title: t('entitlement.list.title'),
        description: t('entitlement.list.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-ENT-001</code>,
      }}
      filters={
        <FilterBar>
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
            className="h-9 rounded-md border bg-surface-3 px-3 text-[13px] text-fg"
            style={{ borderColor: 'var(--border)', minWidth: 300 }}
          >
            <option value="">{t('entitlement.filter.selectBrand')}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.brandCode} · {b.brandName}
              </option>
            ))}
          </select>
          {brandsQ.loading && <Skeleton width={80} height={24} />}
        </FilterBar>
      }
    >
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <Grid2x2Check size={14} className="text-primary" />
            {selectedBrand ? `${selectedBrand.brandCode} · ${selectedBrand.brandName}` : t('entitlement.section.selectBrand')}
          </span>
        }
        description={capabilities.length > 0 ? `${t('entitlement.section.activePrefix')} ${capabilities.join(', ')}` : t('entitlement.section.noActive')}
        padding="none"
      >
        {!selectedId ? (
          <div className="flex min-h-[160px] items-center justify-center text-[12.5px] text-fg-subtle">
            {t('entitlement.empty.selectBrand')}
          </div>
        ) : detailQ.loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
        ) : (
          <DataTable
            columns={entCols}
            rows={entitlements}
            rowKey={(r) => r.id}
            compact
            emptyState={t('entitlement.empty.noEntitlements')}
          />
        )}
      </SectionCard>
      {selectedId && (
        <div className="mt-3 text-right text-[12px]">
          <Link href={`/tenants/brands/${selectedId}`} className="text-primary hover:underline">
            {t('entitlement.link.openBrandDetail')}
          </Link>
        </div>
      )}
    </ListPageTemplate>
  );
}
