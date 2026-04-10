'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { DEPLOY_PACKAGES_QUERY, type DeployPackagesData, type DeployPackageRow } from '@graphql/queries/deploy';
import { formatDateTime } from '@shared/utils/format';

const columns: DataTableColumn<DeployPackageRow>[] = [
  { key: 'code', header: 'Code', width: '220px', render: (r) => <span className="font-mono text-[12px]">{r.packageCode}</span> },
  { key: 'version', header: 'Version', width: '120px', render: (r) => <span className="font-mono text-[12px]">{r.version}</span> },
  { key: 'platform', header: 'Target', width: '140px', render: (r) => <Badge tone="info" variant="soft">{r.platformTarget}</Badge> },
  { key: 'released', header: 'Released', width: '160px', render: (r) => r.releasedAt ? <span className="num text-[12px] text-fg-muted">{formatDateTime(r.releasedAt)}</span> : <Badge tone="warning" variant="soft">DRAFT</Badge> },
  { key: 'createdAt', header: 'Created', width: '160px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
];

export function DeployPackageListScreen() {
  return (
    <ResourceListScreen<DeployPackageRow>
      titleKey="deploy.package.list.title"
      descriptionKey="deploy.package.list.description"
      breadcrumbKeys={['nav.deploy', 'nav.deploy.packages']}
      screenId="SA-DEPLOY-PKG-001"
      query={DEPLOY_PACKAGES_QUERY}
      unwrap={(d) => (d as DeployPackagesData).deployPackages.success?.data ?? []}
      columns={columns}
    />
  );
}
