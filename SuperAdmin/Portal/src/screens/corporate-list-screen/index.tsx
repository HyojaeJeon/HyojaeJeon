'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Badge, Button, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { CORPORATE_LIST_QUERY, type CorporateListData, type CorporateListRow } from '@graphql/queries/corporate';
import { PERMISSIONS } from '@rbac/permissions';
import { useHasPermission } from '@rbac/useHasPermission';
import { useI18n } from '@i18n/I18nProvider';

const columns: DataTableColumn<CorporateListRow>[] = [
  { key: 'code', header: 'Tenant', width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.tenantCode}</span> },
  { key: 'name', header: 'Company', render: (r) => <span className="font-medium text-fg">{r.companyName}</span> },
  { key: 'taxCode', header: 'Tax Code', width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.taxCode ?? '—'}</span> },
  { key: 'fundingModel', header: 'Funding', width: '180px', render: (r) => r.fundingModel ? <Badge tone="info" variant="soft">{r.fundingModel}</Badge> : <span className="text-fg-subtle">—</span> },
  { key: 'status', header: 'Status', width: '140px', render: (r) => <StatusBadge status={r.status} /> },
];

export function CorporateListScreen() {
  const { t } = useI18n();
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_PROFILE_WRITE);
  return (
    <ResourceListScreen<CorporateListRow>
      titleKey="corporate.list.title"
      descriptionKey="corporate.list.description"
      breadcrumbKeys={['nav.tenants', 'nav.tenants.corporates']}
      screenId="SA-CORP-001"
      permissions={PERMISSIONS.CORPORATE_PROFILE_READ}
      query={CORPORATE_LIST_QUERY}
      unwrap={(d) => (d as CorporateListData).mealCorporates.success?.data ?? []}
      columns={columns}
      onRowClick={(row) => (window.location.href = `/tenants/corporates/${row.id}`)}
      actions={
        canWrite && (
          <Link href="/tenants/corporates/new">
            <Button variant="primary" size="md" startIcon={<Plus size={14} />}>
              {t('corporate.action.cta.create')}
            </Button>
          </Link>
        )
      }
    />
  );
}
