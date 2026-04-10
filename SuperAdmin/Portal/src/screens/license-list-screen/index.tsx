'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { LICENSE_LIST_QUERY, type LicenseListData, type LicenseListRow } from '@graphql/queries/governance';
import { PERMISSIONS } from '@rbac/permissions';
import { formatDateTime } from '@shared/utils/format';

const columns: DataTableColumn<LicenseListRow>[] = [
  { key: 'code', header: 'Code', width: '160px', render: (r) => <span className="font-mono text-[12px]">{r.licenseCode}</span> },
  { key: 'type', header: 'Type', width: '120px', render: (r) => <Badge tone="info" variant="soft">{r.licenseType}</Badge> },
  { key: 'scope', header: 'Scope', width: '160px', render: (r) => <span className="text-[12px]"><Badge tone="neutral" variant="soft">{r.scopeType}</Badge></span> },
  { key: 'status', header: 'Status', width: '140px', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'from', header: 'From', width: '120px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.effectiveFrom)}</span> },
  { key: 'to', header: 'To', width: '120px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{r.effectiveTo ? formatDateTime(r.effectiveTo) : '∞'}</span> },
];

export function LicenseListScreen() {
  return (
    <ResourceListScreen<LicenseListRow>
      titleKey="license.list.title"
      descriptionKey="license.list.description"
      breadcrumbKeys={['nav.governance', 'nav.governance.licenses']}
      screenId="SA-LIC-001"
      permissions={PERMISSIONS.PLATFORM_AUDIT_READ}
      query={LICENSE_LIST_QUERY}
      unwrap={(d) => (d as LicenseListData).licenses.success?.data ?? []}
      columns={columns}
      onRowClick={(row) => (window.location.href = `/governance/licenses/${row.id}`)}
    />
  );
}
