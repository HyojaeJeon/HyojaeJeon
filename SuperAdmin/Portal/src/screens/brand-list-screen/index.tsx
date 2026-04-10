'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { BRAND_LIST_QUERY, type BrandListData, type BrandListRow } from '@graphql/queries/brand';
import { PERMISSIONS } from '@rbac/permissions';
import { formatDateTime } from '@shared/utils/format';

const columns: DataTableColumn<BrandListRow>[] = [
  { key: 'code', header: 'Code', width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.brandCode}</span> },
  { key: 'name', header: 'Brand', render: (r) => <span className="font-medium text-fg">{r.brandName}</span> },
  { key: 'country', header: 'Country', width: '80px', render: (r) => <span className="font-mono text-[12px] uppercase">{r.countryCode}</span> },
  { key: 'status', header: 'Status', width: '140px', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'createdAt', header: 'Created', width: '160px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
];

export function BrandListScreen() {
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
