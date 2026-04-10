'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { REGIONS_QUERY, type RegionsData, type RegionRow } from '@graphql/queries/system';

const columns: DataTableColumn<RegionRow>[] = [
  { key: 'code', header: 'Code', width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.regionCode}</span> },
  { key: 'name', header: 'Region', render: (r) => <span className="font-medium text-fg">{r.regionName}</span> },
  { key: 'country', header: 'Country', width: '100px', render: (r) => <span className="font-mono text-[12px] uppercase">{r.countryCode}</span> },
  { key: 'tz', header: 'Timezone', width: '200px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.timeZoneCode ?? '—'}</span> },
  { key: 'active', header: 'Active', width: '100px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>ACTIVE</Badge> : <Badge tone="neutral" variant="soft">INACTIVE</Badge> },
];

export function RegionListScreen() {
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
