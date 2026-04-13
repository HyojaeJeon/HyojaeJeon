'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { DEPLOY_PACKAGES_QUERY, type DeployPackagesData, type DeployPackageRow } from '@graphql/queries/deploy';
import { formatDateTime } from '@shared/utils/format';
import { useI18n } from '@i18n/I18nProvider';

export function DeployPackageListScreen() {
  const { t } = useI18n();

  const columns: DataTableColumn<DeployPackageRow>[] = [
    { key: 'code', header: t('table.header.code'), width: '220px', render: (r) => <span className="font-mono text-[12px]">{r.packageCode}</span> },
    { key: 'version', header: t('table.header.version'), width: '120px', render: (r) => <span className="font-mono text-[12px]">{r.version}</span> },
    { key: 'platform', header: t('table.header.target'), width: '140px', render: (r) => <Badge tone="info" variant="soft">{r.platformTarget}</Badge> },
    { key: 'released', header: t('table.header.released'), width: '160px', render: (r) => r.releasedAt ? <span className="num text-[12px] text-fg-muted">{formatDateTime(r.releasedAt)}</span> : <Badge tone="warning" variant="soft">DRAFT</Badge> },
    { key: 'createdAt', header: t('table.header.created'), width: '160px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.createdAt)}</span> },
  ];

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
