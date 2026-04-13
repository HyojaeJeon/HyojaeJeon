'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { REGIONS_QUERY, type RegionsData, type RegionRow } from '@graphql/queries/system';
import { useI18n } from '@i18n/I18nProvider';

export function RegionListScreen() {
  const { t } = useI18n();

  const columns: DataTableColumn<RegionRow>[] = [
    { key: 'code', header: t('field.code'), width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.regionCode}</span> },
    { key: 'name', header: t('reference.region.col.region'), render: (r) => <span className="font-medium text-fg">{r.regionName}</span> },
    { key: 'country', header: t('reference.region.col.country'), width: '100px', render: (r) => <span className="font-mono text-[12px] uppercase">{r.countryCode}</span> },
    { key: 'tz', header: t('reference.region.col.timezone'), width: '200px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.timeZoneCode ?? '—'}</span> },
    { key: 'active', header: t('field.active'), width: '100px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>{t('enum.status.ACTIVE')}</Badge> : <Badge tone="neutral" variant="soft">{t('enum.status.INACTIVE')}</Badge> },
  ];

  return (
    <ResourceListScreen<RegionRow>
      titleKey="reference.region.list.title"
      descriptionKey="reference.region.list.description"
      breadcrumbKeys={['nav.system', 'nav.system.reference']}
      screenId="SA-SYS-REF-REG-001"
      query={REGIONS_QUERY}
      unwrap={(d) => (d as RegionsData).regions.success?.data ?? []}
      columns={columns}
    />
  );
}
