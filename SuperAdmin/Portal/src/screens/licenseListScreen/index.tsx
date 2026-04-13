'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Plus } from 'lucide-react';
import {
  ListPageTemplate,
  Tabs,
  DataTable,
  Badge,
  Button,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { StatusBadge } from '@shared/ui/StatusBadge';
import {
  LICENSE_SCREEN_GLOBAL_QUERY,
  LICENSE_SCREEN_DISTRIBUTOR_QUERY,
  LICENSE_SCREEN_BRAND_QUERY,
  type LicenseScopeTypeData,
  type LicenseListRow,
} from '@graphql/queries/governance';
import { PERMISSIONS } from '@rbac/permissions';
import { useHasPermission } from '@rbac/useHasPermission';
import { formatDateTime } from '@shared/utils/format';
import { useI18n } from '@i18n/I18nProvider';
import { LockedScreen } from '@screens/common/LockedScreen';
import { CreateLicenseModal } from './CreateLicenseModal';

type LicenseTab = 'global' | 'distributor' | 'brand';

const TAB_KEYS: LicenseTab[] = ['global', 'distributor', 'brand'];

export function LicenseListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canRead = useHasPermission(PERMISSIONS.PLATFORM_AUDIT_READ);

  const tab = (searchParams.get('tab') as LicenseTab) || 'global';
  const [createOpen, setCreateOpen] = useState(false);

  const updateQuery = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const globalQuery = useQuery<LicenseScopeTypeData>(LICENSE_SCREEN_GLOBAL_QUERY, {
    variables: { skip: 0, take: 100 },
    skip: tab !== 'global',
    fetchPolicy: 'cache-and-network',
  });
  const distributorQuery = useQuery<LicenseScopeTypeData>(LICENSE_SCREEN_DISTRIBUTOR_QUERY, {
    variables: { skip: 0, take: 100 },
    skip: tab !== 'distributor',
    fetchPolicy: 'cache-and-network',
  });
  const brandQuery = useQuery<LicenseScopeTypeData>(LICENSE_SCREEN_BRAND_QUERY, {
    variables: { skip: 0, take: 100 },
    skip: tab !== 'brand',
    fetchPolicy: 'cache-and-network',
  });

  if (!canRead) return <LockedScreen />;

  const activeQuery = tab === 'global' ? globalQuery : tab === 'distributor' ? distributorQuery : brandQuery;
  const rows = activeQuery.data?.licensesByScopeType.success?.data ?? [];
  const loading = activeQuery.loading;
  const error = activeQuery.error;

  const tabItems = TAB_KEYS.map((k) => ({
    key: k,
    label: t(`license.tab.${k}`),
  }));

  const columns: DataTableColumn<LicenseListRow>[] = [
    { key: 'code', header: t('license.form.code'), width: '180px', render: (r) => <span className="font-mono text-[12px]">{r.licenseCode}</span> },
    { key: 'type', header: t('license.form.type'), width: '120px', render: (r) => <Badge tone="info" variant="soft">{t(`license.licenseType.${r.licenseType}`)}</Badge> },
    { key: 'status', header: t('license.form.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'from', header: t('license.form.effectiveFrom'), width: '120px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.effectiveFrom)}</span> },
    { key: 'to', header: t('license.form.effectiveTo'), width: '120px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{r.effectiveTo ? formatDateTime(r.effectiveTo) : '∞'}</span> },
  ];

  const handleRefresh = async () => {
    await activeQuery.refetch();
  };

  return (
    <>
      <ListPageTemplate
        header={{
          breadcrumbs: [
            { label: t('nav.governance') },
            { label: t('nav.governance.licenses') },
          ],
          title: t('license.list.title'),
          description: t('license.list.description'),
          meta: <code className="text-[11px] text-fg-subtle">SA-LIC-001</code>,
          actions: (
            <Button
              variant="primary"
              size="sm"
              startIcon={<Plus size={14} />}
              onClick={() => setCreateOpen(true)}
            >
              {t('license.action.create')}
            </Button>
          ),
        }}
      >
        <div className="flex flex-col gap-4">
          <Tabs
            variant="pill"
            items={tabItems}
            value={tab}
            onChange={(k) => updateQuery({ tab: k })}
          />

          {error && (
            <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
              {error.message}
            </div>
          )}

          {loading && rows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={40} />
              ))}
            </div>
          ) : (
            <DataTable<LicenseListRow>
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              emptyState={t('common.empty')}
              onRowClick={(row) => router.push(`/governance/licenses/${row.id}`)}
            />
          )}
        </div>
      </ListPageTemplate>

      <CreateLicenseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleRefresh}
      />
    </>
  );
}
