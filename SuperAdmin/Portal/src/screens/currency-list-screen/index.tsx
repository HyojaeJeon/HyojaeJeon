'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { CURRENCIES_QUERY, type CurrenciesData, type CurrencyRow } from '@graphql/queries/system';

const columns: DataTableColumn<CurrencyRow>[] = [
  { key: 'code', header: 'Code', width: '100px', render: (r) => <span className="font-mono text-[12px]">{r.currencyCode}</span> },
  { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-fg">{r.currencyName}</span> },
  { key: 'symbol', header: 'Symbol', width: '90px', align: 'center', render: (r) => <span className="font-mono text-[13px]">{r.symbol ?? '—'}</span> },
  { key: 'digits', header: 'Digits', width: '90px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{r.decimalDigits}</span> },
  { key: 'default', header: 'Default', width: '100px', align: 'center', render: (r) => r.isDefault ? <Badge tone="success" variant="soft">DEFAULT</Badge> : <span className="text-fg-subtle">—</span> },
  { key: 'active', header: 'Active', width: '100px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>ACTIVE</Badge> : <Badge tone="neutral" variant="soft">INACTIVE</Badge> },
];

export function CurrencyListScreen() {
  return (
    <ResourceListScreen<CurrencyRow>
      titleKey="reference.currency.list.title"
      descriptionKey="reference.currency.list.description"
      breadcrumbKeys={['nav.system', 'nav.system.reference']}
      screenId="SA-SYS-REF-CUR-001"
      query={CURRENCIES_QUERY}
      unwrap={(d) => (d as CurrenciesData).currencies.success?.data ?? []}
      columns={columns}
    />
  );
}
