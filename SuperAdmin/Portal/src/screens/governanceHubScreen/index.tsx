'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client';
import {
  ListPageTemplate,
  Tabs,
  DataTable,
  Badge,
  Button,
  Select,
  SectionCard,
  Skeleton,
  EmptyState,
  Pagination,
  type DataTableColumn,
} from '@platform/shared-ui';
import { KeyRound, Building2, Store, Ticket, Filter, X } from 'lucide-react';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';
import {
  GOV_HUB_DISTRIBUTOR_QUERY,
  GOV_HUB_BRAND_QUERY,
  GOV_HUB_CORPORATE_QUERY,
  type GovHubDistributorData,
  type GovHubDistributorRow,
  type GovHubBrandData,
  type GovHubBrandRow,
  type GovHubCorporateData,
  type GovHubCorporateRow,
  type LicenseListRow,
  type AuthAccountRow,
} from '@graphql/queries/governance';

type HubTab = 'distributor' | 'brand' | 'corporate';
const TAB_KEYS: HubTab[] = ['distributor', 'brand', 'corporate'];
const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'SUSPENDED', 'INACTIVE'] as const;

export function GovernanceHubScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as HubTab) || 'distributor';
  const expandedId = searchParams.get('expanded') || null;
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const updateQuery = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '') params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const paginationVars = { skip: page * PAGE_SIZE, take: PAGE_SIZE };
  const distQuery = useQuery<GovHubDistributorData>(GOV_HUB_DISTRIBUTOR_QUERY, {
    variables: paginationVars,
    skip: tab !== 'distributor',
    fetchPolicy: 'cache-and-network',
  });
  const brandQuery = useQuery<GovHubBrandData>(GOV_HUB_BRAND_QUERY, {
    variables: paginationVars,
    skip: tab !== 'brand',
    fetchPolicy: 'cache-and-network',
  });
  const corpQuery = useQuery<GovHubCorporateData>(GOV_HUB_CORPORATE_QUERY, {
    variables: paginationVars,
    skip: tab !== 'corporate',
    fetchPolicy: 'cache-and-network',
  });

  const activeLoading =
    tab === 'distributor' ? distQuery.loading
    : tab === 'brand' ? brandQuery.loading
    : corpQuery.loading;

  const activeError =
    tab === 'distributor' ? distQuery.error
    : tab === 'brand' ? brandQuery.error
    : corpQuery.error;

  const tabItems = TAB_KEYS.map((k) => ({
    key: k,
    label: t(`governanceHub.tab.${k}`),
    icon: k === 'distributor' ? <Building2 size={14} /> : k === 'brand' ? <Store size={14} /> : <Ticket size={14} />,
  }));

  const toggleExpand = (id: string) => {
    updateQuery({ expanded: expandedId === id ? null : id });
  };

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.governance') }],
        title: t('governanceHub.title'),
        description: t('governanceHub.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-GOV</code>,
        actions: (
          <Button
            variant="ghost"
            size="sm"
            startIcon={<KeyRound size={14} />}
            onClick={() => router.push('/governance/rbac')}
          >
            {t('nav.governance.rbac')}
          </Button>
        ),
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Tab bar + filter button */}
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <Tabs
            items={tabItems}
            value={tab}
            onChange={(k) => { setPage(0); setStatusFilter('ALL'); updateQuery({ tab: k, expanded: null }); }}
          />
          <Button
            variant={showFilter ? 'primary' : 'ghost'}
            size="sm"
            startIcon={showFilter ? <X size={14} /> : <Filter size={14} />}
            onClick={() => setShowFilter((v) => !v)}
          >
            {t('action.filter')}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="flex items-center gap-3 rounded-lg border bg-surface-1 p-3" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[12px] font-semibold text-fg-muted">{t('field.status')}:</span>
            <Select
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(0);
                if (tab === 'distributor') void distQuery.refetch();
                else if (tab === 'brand') void brandQuery.refetch();
                else void corpQuery.refetch();
              }}
              options={STATUS_OPTIONS.map((s) => ({
                value: s,
                label: s === 'ALL' ? t('field.all') : t(`enum.status.${s}`),
              }))}
              placeholder={t('field.status')}
            />
          </div>
        )}

        {activeError && (
          <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{activeError.message}</div>
        )}

        {activeLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={40} />)}</div>
        ) : tab === 'distributor' ? (
          <DistributorContent data={distQuery.data} expandedId={expandedId} onToggle={toggleExpand} onDetail={(id) => router.push(`/governance/distributor/${id}`)} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} statusFilter={statusFilter} />
        ) : tab === 'brand' ? (
          <BrandContent data={brandQuery.data} expandedId={expandedId} onToggle={toggleExpand} onDetail={(id) => router.push(`/governance/brand/${id}`)} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} statusFilter={statusFilter} />
        ) : (
          <CorporateContent data={corpQuery.data} expandedId={expandedId} onToggle={toggleExpand} onDetail={(id) => router.push(`/governance/corporate/${id}`)} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} statusFilter={statusFilter} />
        )}
      </div>
    </ListPageTemplate>
  );
}

/* ─────────────────────────── Shared ─────────────────────────── */

interface EntityTabProps<T> {
  data: T | undefined;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onDetail: (id: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  statusFilter: string;
}

function buildMap<T, K extends string>(items: T[], keyFn: (item: T) => K | null | undefined): Map<K, T> {
  const m = new Map<K, T>();
  items.forEach((item) => { const k = keyFn(item); if (k) m.set(k, item); });
  return m;
}

function countByKey<T, K extends string>(items: T[], keyFn: (item: T) => K | null | undefined): Map<K, number> {
  const m = new Map<K, number>();
  items.forEach((item) => { const k = keyFn(item); if (k) m.set(k, (m.get(k) ?? 0) + 1); });
  return m;
}

/* ─────────────────────────── Distributor Tab ─────────────────────────── */

function DistributorContent({ data, expandedId, onToggle, onDetail, page, pageSize, onPageChange, statusFilter }: EntityTabProps<GovHubDistributorData>) {
  const { t } = useI18n();
  const allDistributors = data?.distributors.success?.data ?? [];
  const totalCount = data?.distributors.success?.totalCount ?? allDistributors.length;
  const distributors = statusFilter === 'ALL' ? allDistributors : allDistributors.filter((d) => d.status === statusFilter);

  if (distributors.length === 0 && page === 0) {
    return <EmptyState icon={<Building2 size={28} />} title={t('common.empty')} description={t('governanceHub.description')} size="lg" />;
  }

  const allLicenses = data?.licenses.success?.data ?? [];
  const rdLicenses = allLicenses.filter((l) => l.scopeType === 'REGIONAL_DISTRIBUTOR');
  const users = data?.authAccounts.success?.data ?? [];
  const allBrands = data?.brands.success?.data ?? [];
  const licenseMap = buildMap(rdLicenses, (l) => l.scopeId);
  const userCountMap = countByKey(users, (u) => (u as AuthAccountRow & { distributorId: string | null }).distributorId);
  const brandCountMap = countByKey(allBrands, (b) => b.distributorId);

  const cols: DataTableColumn<GovHubDistributorRow>[] = [
    { key: 'code', header: t('governanceHub.col.code'), width: '120px', render: (r) => <span className="font-mono text-[12px]">{r.distributorCode}</span> },
    { key: 'name', header: t('governanceHub.col.name'), render: (r) => r.companyName },
    { key: 'country', header: t('governanceHub.col.country'), width: '80px', render: (r) => r.countryCode },
    { key: 'license', header: t('governanceHub.col.license'), width: '120px', render: (r) => {
      const lic = licenseMap.get(r.id);
      return lic ? <StatusBadge status={lic.status} /> : <span className="text-[12px] text-fg-muted">{t('governanceHub.noLicense')}</span>;
    }},
    { key: 'brands', header: t('governanceHub.tab.brand'), width: '80px', align: 'right', render: (r) => <span className="text-[12px]">{brandCountMap.get(r.id) ?? 0}</span> },
    { key: 'users', header: t('governanceHub.col.users'), width: '80px', align: 'right', render: (r) => <span className="text-[12px]">{userCountMap.get(r.id) ?? 0}</span> },
    { key: 'status', header: t('governanceHub.col.status'), width: '100px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex flex-col">
      <DataTable
        columns={cols}
        rows={distributors}
        rowKey={(r) => r.id}
        emptyState={t('common.empty')}
        onRowClick={(r) => onToggle(r.id)}
        expandedRowKey={expandedId}
        renderExpandedRow={(r) => (
          <AccordionPanel entityId={r.id} license={licenseMap.get(r.id)} userCount={userCountMap.get(r.id) ?? 0} brandCount={brandCountMap.get(r.id) ?? 0} onDetail={() => onDetail(r.id)} />
        )}
      />
      <div className="p-3">
        <Pagination skip={page * pageSize} take={pageSize} total={totalCount} onPageChange={(skip) => onPageChange(Math.floor(skip / pageSize))} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Brand Tab ─────────────────────────── */

function BrandContent({ data, expandedId, onToggle, onDetail, page, pageSize, onPageChange, statusFilter }: EntityTabProps<GovHubBrandData>) {
  const { t } = useI18n();
  const allBrands = data?.brands.success?.data ?? [];
  const brandTotalCount = data?.brands.success?.totalCount ?? allBrands.length;
  const brands = statusFilter === 'ALL' ? allBrands : allBrands.filter((b) => b.status === statusFilter);

  if (brands.length === 0 && page === 0) {
    return <EmptyState icon={<Store size={28} />} title={t('common.empty')} description={t('governanceHub.description')} size="lg" />;
  }

  const licenses = data?.licensesByScopeType.success?.data ?? [];
  const users = data?.authAccounts.success?.data ?? [];
  const licenseMap = buildMap(licenses, (l) => l.scopeId);
  const userCountMap = countByKey(users, (u) => (u as AuthAccountRow & { brandHQId: string | null }).brandHQId);

  const cols: DataTableColumn<GovHubBrandRow>[] = [
    { key: 'code', header: t('governanceHub.col.code'), width: '120px', render: (r) => <span className="font-mono text-[12px]">{r.brandCode}</span> },
    { key: 'name', header: t('governanceHub.col.name'), render: (r) => r.brandName },
    { key: 'license', header: t('governanceHub.col.license'), width: '120px', render: (r) => {
      const lic = licenseMap.get(r.id);
      return lic ? <StatusBadge status={lic.status} /> : <span className="text-[12px] text-fg-muted">{t('governanceHub.noLicense')}</span>;
    }},
    { key: 'branches', header: t('governanceHub.col.branches'), width: '80px', align: 'right', render: (r) => <span className="text-[12px]">{r.branches?.length ?? 0}</span> },
    { key: 'users', header: t('governanceHub.col.users'), width: '80px', align: 'right', render: (r) => <span className="text-[12px]">{userCountMap.get(r.id) ?? 0}</span> },
    { key: 'status', header: t('governanceHub.col.status'), width: '100px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex flex-col">
      <DataTable
        columns={cols}
        rows={brands}
        rowKey={(r) => r.id}
        emptyState={t('common.empty')}
        onRowClick={(r) => onToggle(r.id)}
        expandedRowKey={expandedId}
        renderExpandedRow={(r) => (
          <AccordionPanel entityId={r.id} license={licenseMap.get(r.id)} userCount={userCountMap.get(r.id) ?? 0} showCapabilities onDetail={() => onDetail(r.id)} />
        )}
      />
      <div className="p-3">
        <Pagination skip={page * pageSize} take={pageSize} total={brandTotalCount} onPageChange={(skip) => onPageChange(Math.floor(skip / pageSize))} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Corporate Tab ─────────────────────────── */

function CorporateContent({ data, expandedId, onToggle, onDetail, page, pageSize, onPageChange, statusFilter }: EntityTabProps<GovHubCorporateData>) {
  const { t } = useI18n();
  const allCorporates = data?.mealCorporates.success?.data ?? [];
  const corpTotalCount = data?.mealCorporates.success?.totalCount ?? allCorporates.length;
  const corporates = statusFilter === 'ALL' ? allCorporates : allCorporates.filter((c) => c.status === statusFilter);
  const users = data?.authAccounts.success?.data ?? [];

  if (corporates.length === 0 && page === 0) {
    return <EmptyState icon={<Ticket size={28} />} title={t('common.empty')} description={t('governanceHub.description')} size="lg" />;
  }

  const userCountMap = countByKey(users, (u) => (u as AuthAccountRow & { corporateId: string | null }).corporateId);

  const cols: DataTableColumn<GovHubCorporateRow>[] = [
    { key: 'code', header: t('governanceHub.col.code'), width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.tenantCode}</span> },
    { key: 'name', header: t('governanceHub.col.name'), render: (r) => r.companyName },
    { key: 'users', header: t('governanceHub.col.users'), width: '80px', align: 'right', render: (r) => <span className="text-[12px]">{userCountMap.get(r.id) ?? 0}</span> },
    { key: 'status', header: t('governanceHub.col.status'), width: '100px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex flex-col">
      <DataTable
        columns={cols}
        rows={corporates}
        rowKey={(r) => r.id}
        emptyState={t('common.empty')}
        onRowClick={(r) => onToggle(r.id)}
        expandedRowKey={expandedId}
        renderExpandedRow={(r) => (
          <AccordionPanel entityId={r.id} userCount={userCountMap.get(r.id) ?? 0} onDetail={() => onDetail(r.id)} />
        )}
      />
      <div className="p-3">
        <Pagination skip={page * pageSize} take={pageSize} total={corpTotalCount} onPageChange={(skip) => onPageChange(Math.floor(skip / pageSize))} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Accordion Panel ─────────────────────────── */

interface AccordionPanelProps {
  entityId: string;
  license?: LicenseListRow;
  userCount: number;
  brandCount?: number;
  showCapabilities?: boolean;
  onDetail: () => void;
}

function AccordionPanel({ license, userCount, brandCount, showCapabilities, onDetail }: AccordionPanelProps) {
  const { t } = useI18n();

  return (
    <div className="border-t border-b bg-surface-1 px-6 py-4" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-2 gap-4 text-[12.5px] lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-fg-muted">{t('governanceHub.section.license')}</span>
          {license ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px]">{license.licenseCode}</span>
              <span className="flex items-center gap-1.5">
                <Badge tone="info" variant="soft">{t(`license.licenseType.${license.licenseType}`)}</Badge>
                <StatusBadge status={license.status} />
              </span>
            </div>
          ) : (
            <span className="text-fg-muted">{t('governanceHub.noLicense')}</span>
          )}
        </div>

        {brandCount != null && (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-fg-muted">{t('governanceHub.tab.brand')}</span>
            <span>{brandCount}</span>
          </div>
        )}

        {showCapabilities && (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-fg-muted">{t('governanceHub.section.capabilities')}</span>
            <span className="text-fg-muted text-[11px]">{t('governanceHub.detail')}</span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-fg-muted">{t('governanceHub.section.users')}</span>
          <span>{userCount}</span>
        </div>

        <div className="flex items-end justify-end">
          <Button variant="ghost" size="sm" onClick={onDetail}>
            {t('governanceHub.detail')} &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
