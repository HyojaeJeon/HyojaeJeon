'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ResourceListScreen } from '@screens/common/ResourceListScreen';
import { LANGUAGES_QUERY, type LanguagesData, type LanguageRow } from '@graphql/queries/system';
import { useI18n } from '@i18n/I18nProvider';

export function LanguageListScreen() {
  const { t } = useI18n();

  const columns: DataTableColumn<LanguageRow>[] = [
    { key: 'code', header: t('table.header.code'), width: '120px', render: (r) => <span className="font-mono text-[12px]">{r.languageCode}</span> },
    { key: 'native', header: t('table.header.native'), render: (r) => <span className="font-medium text-fg">{r.nativeName}</span> },
    { key: 'display', header: t('table.header.display'), render: (r) => <span className="text-[12px] text-fg-muted">{r.displayName}</span> },
    { key: 'dir', header: t('table.header.direction'), width: '100px', align: 'center', render: (r) => <Badge tone="info" variant="soft">{r.direction}</Badge> },
    { key: 'default', header: t('table.header.default'), width: '100px', align: 'center', render: (r) => r.isDefault ? <Badge tone="success" variant="soft">DEFAULT</Badge> : <span className="text-fg-subtle">—</span> },
  ];

  return (
    <ResourceListScreen<LanguageRow>
      titleKey="reference.language.list.title"
      descriptionKey="reference.language.list.description"
      breadcrumbKeys={['nav.system', 'nav.system.reference']}
      screenId="SA-SYS-REF-LANG-001"
      query={LANGUAGES_QUERY}
      unwrap={(d) => (d as LanguagesData).languages.success?.data ?? []}
      columns={columns}
    />
  );
}
