'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { CURRENCIES_QUERY, type CurrenciesData, type CurrencyRow } from '@graphql/queries/system';
import { useI18n } from '@i18n/I18nProvider';

export function CurrencyListScreen() {
  const { t } = useI18n();

  const columns: DataTableColumn<CurrencyRow>[] = [
    { key: 'code', header: t('field.code'), width: '100px', render: (r) => <span className="font-mono text-[12px]">{r.currencyCode}</span> },
    { key: 'name', header: t('field.name'), render: (r) => <span className="font-medium text-fg">{r.currencyName}</span> },
    { key: 'symbol', header: t('reference.currency.col.symbol'), width: '90px', align: 'center', render: (r) => <span className="font-mono text-[13px]">{r.symbol ?? '—'}</span> },
    { key: 'digits', header: t('reference.currency.col.digits'), width: '90px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{r.decimalDigits}</span> },
    { key: 'default', header: t('reference.currency.col.default'), width: '100px', align: 'center', render: (r) => r.isDefault ? <Badge tone="success" variant="soft">{t('reference.currency.default')}</Badge> : <span className="text-fg-subtle">—</span> },
    { key: 'active', header: t('field.active'), width: '100px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>{t('enum.status.ACTIVE')}</Badge> : <Badge tone="neutral" variant="soft">{t('enum.status.INACTIVE')}</Badge> },
  ];

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
