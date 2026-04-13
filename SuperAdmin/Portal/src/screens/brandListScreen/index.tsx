'use client';

import { type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { BRAND_LIST_QUERY, type BrandListData, type BrandListRow } from '@graphql/queries/brand';
import { PERMISSIONS } from '@rbac/permissions';
import { formatDateTime } from '@shared/utils/format';
import { useI18n } from '@i18n/I18nProvider';

export function BrandListScreen() {
  const { t } = useI18n();

  const columns: DataTableColumn<BrandListRow>[] = [
    { key: 'code', header: t('table.header.code'), width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.brandCode}</span> },
    { key: 'name', header: t('table.header.brand'), render: (r) => <span className="font-medium text-fg">{r.brandName}</span> },
    { key: 'country', header: t('table.header.country'), width: '80px', render: (r) => <span className="font-mono text-[12px] uppercase">{r.countryCode}</span> },
    { key: 'status', header: t('table.header.status'), width: '140px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: t('table.header.created'), width: '160px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
  ];

  return (
    <ResourceListScreen<BrandListRow>
      titleKey="brand.list.title"
      descriptionKey="brand.list.description"
      breadcrumbKeys={['nav.tenants', 'nav.tenants.brands']}
      screenId="SA-BRAND-001"
      permissions={PERMISSIONS.BRAND_PROFILE_READ}
      query={BRAND_LIST_QUERY}
      unwrap={(d) => (d as BrandListData).brands.success?.data ?? []}
      columns={columns}
      onRowClick={(row) => (window.location.href = `/tenants/brands/${row.id}`)}
    />
  );
}
/* ListScreen marker: BrandList */
