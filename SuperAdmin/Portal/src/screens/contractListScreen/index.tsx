'use client';

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Plus, Search, FileText } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  Tabs,
  DataTable,
  Badge,
  Input,
  Button,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CONTRACT_LIST_QUERY,
  CONTRACT_TEMPLATES_QUERY,
  type ContractListData,
  type ContractListItem,
  type ContractStatus,
  type ContractType,
  type ContractTemplatesData,
  type ContractTemplate,
} from '@graphql/queries/contract';
import { FilterBar } from '@shared/ui/FilterBar';
import { Pager } from '@shared/ui/Pager';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { formatDateTime } from '@shared/utils/format';
import { LockedScreen } from '@screens/common/LockedScreen';

type ContractTab = 'ALL' | ContractType | 'TEMPLATES';

const TAB_KEYS: ContractTab[] = ['ALL', 'MERCHANT', 'DISTRIBUTOR', 'CORPORATE', 'TEMPLATES'];

const STATUSES: ContractStatus[] = [
  'REQUESTED', 'DRAFT', 'INTERNAL_REVIEW', 'SENT_TO_PARTY', 'NEGOTIATING',
  'AGREED', 'PENDING_SIGNATURE', 'SIGNING', 'EXCHANGING', 'ACTIVE',
  'EXPIRING', 'RENEWED', 'SUSPENDED', 'TERMINATED', 'CANCELLED',
];

/* ─────────────────────── Template List Sub-component ─────────────────────── */

function TemplateListSection() {
  const { t } = useI18n();
  const router = useRouter();
  const canCreate = useHasPermission(PERMISSIONS.CONTRACT_CREATE);
  const [tplSearch, setTplSearch] = useState('');

  const { data, loading } = useQuery<ContractTemplatesData>(CONTRACT_TEMPLATES_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const templates = useMemo(() => {
    const raw = data?.contractTemplates.success?.data ?? [];
    if (!tplSearch) return raw;
    const q = tplSearch.toLowerCase();
    return raw.filter(
      (r) => r.templateCode.toLowerCase().includes(q) || r.title.toLowerCase().includes(q),
    );
  }, [data, tplSearch]);

  const columns: DataTableColumn<ContractTemplate>[] = [
    { key: 'templateCode', header: t('contract.template.code'), width: '180px', render: (r) => <span className="font-mono text-[12px] text-fg">{r.templateCode}</span> },
    { key: 'title', header: t('contract.col.title'), render: (r) => <span className="font-medium text-fg">{r.title}</span> },
    { key: 'contractType', header: t('contract.col.contractType'), width: '120px', render: (r) => <Badge tone="info" variant="soft">{t(`contract.type.${r.contractType}`)}</Badge> },
    { key: 'version', header: t('contract.template.version'), width: '80px', align: 'right', render: (r) => <span className="text-[12px] text-fg-muted">v{r.version}</span> },
    {
      key: 'isActive',
      header: t('field.status'),
      width: '100px',
      render: (r) => (
        <Badge tone={r.isActive ? 'success' : 'neutral'} variant="soft">
          {r.isActive ? t('contract.template.active') : t('contract.template.inactive')}
        </Badge>
      ),
    },
    { key: 'updatedAt', header: t('field.updatedAt'), width: '140px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.updatedAt)}</span> },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-4">
        <Input
          placeholder={t('common.searchPlaceholder')}
          value={tplSearch}
          onChange={(e) => setTplSearch(e.target.value)}
          startIcon={<Search size={14} />}
          style={{ minWidth: 260 }}
        />
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            startIcon={<Plus size={14} />}
            onClick={() => router.push('/governance/contracts/templates/new')}
          >
            {t('contract.template.createAction')}
          </Button>
        )}
      </div>
      <SectionCard
        title={t('contract.template.listTitle')}
        description={`${templates.length} ${t('contract.template.listCount')}`}
        padding="none"
      >
        {loading && templates.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={32} />)}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={templates}
            rowKey={(r) => r.id}
            emptyState={t('contract.template.empty')}
            compact
          />
        )}
      </SectionCard>
    </>
  );
}

/* ─────────────────────── Main List Screen ─────────────────────── */

export function ContractListScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canRead = useHasPermission(PERMISSIONS.CONTRACT_READ);
  const canCreate = useHasPermission(PERMISSIONS.CONTRACT_CREATE);

  const tab = (searchParams.get('tab') as ContractTab) || 'ALL';
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(20);
  const [status, setStatus] = useState<ContractStatus | ''>('');
  const [search, setSearch] = useState('');

  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';

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

  const isTemplates = tab === 'TEMPLATES';
  const contractTypeVar = tab === 'ALL' || isTemplates ? null : tab;

  const { data, loading, error } = useQuery<ContractListData>(CONTRACT_LIST_QUERY, {
    variables: { skip, take, contractType: contractTypeVar, status: status || null },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: isTemplates,
  });

  const rows: ContractListItem[] = useMemo(() => {
    const raw = data?.contracts.success?.data ?? [];
    if (!search) return raw;
    const q = search.toLowerCase();
    return raw.filter(
      (row) => row.contractCode.toLowerCase().includes(q) || row.title.toLowerCase().includes(q),
    );
  }, [data, search]);

  const totalCount = data?.contracts.success?.totalCount ?? 0;

  const tabItems = TAB_KEYS.map((k) => ({
    key: k,
    label: t(`contract.tab.${k}`),
    icon: k === 'TEMPLATES' ? <FileText size={13} /> : undefined,
  }));

  const columns: DataTableColumn<ContractListItem>[] = [
    { key: 'contractCode', header: t('contract.col.contractCode'), width: '140px', render: (row) => <span className="font-mono text-[12px] text-fg">{row.contractCode}</span> },
    { key: 'title', header: t('contract.col.title'), render: (row) => <span className="font-medium text-fg">{row.title}</span> },
    { key: 'contractType', header: t('contract.col.contractType'), width: '120px', render: (row) => <Badge tone="info" variant="soft">{t(`contract.type.${row.contractType}`)}</Badge> },
    { key: 'partyBType', header: t('contract.col.partyBType'), width: '130px', render: (row) => <Badge tone="neutral" variant="soft">{t(`contract.partyBType.${row.partyBType}`)}</Badge> },
    { key: 'status', header: t('field.status'), width: '140px', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'effectiveFrom', header: t('field.effectiveFrom'), width: '110px', render: (row) => <span className="num text-[12px] text-fg-muted">{row.effectiveFrom ? formatDateTime(row.effectiveFrom, localeTag) : '—'}</span> },
    { key: 'effectiveTo', header: t('field.effectiveTo'), width: '110px', align: 'right', render: (row) => <span className="num text-[12px] text-fg-muted">{row.effectiveTo ? formatDateTime(row.effectiveTo, localeTag) : '∞'}</span> },
  ];

  if (!canRead) return <LockedScreen />;

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.governance') },
          { label: t('nav.governance.contracts') },
        ],
        title: t('contract.list.title'),
        description: t('contract.list.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CTR-001</code>,
        actions: !isTemplates && canCreate && (
          <Button variant="primary" size="md" startIcon={<Plus size={14} />} onClick={() => router.push('/governance/contracts/new')}>
            {t('contract.action.create')}
          </Button>
        ),
      }}
      filters={
        !isTemplates ? (
          <FilterBar>
            <Input placeholder={t('common.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} startIcon={<Search size={14} />} style={{ minWidth: 260 }} />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as ContractStatus | ''); setSkip(0); }}
              className="h-9 rounded-md border bg-surface-3 px-2.5 text-[13px] text-fg"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="">{t('field.status')} · {t('contract.filter.all')}</option>
              {STATUSES.map((s) => <option key={s} value={s}>{t(`contract.status.${s}`)}</option>)}
            </select>
          </FilterBar>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <Tabs
          variant="pill"
          items={tabItems}
          value={tab}
          onChange={(k) => {
            updateQuery({ tab: k === 'ALL' ? null : k });
            setSkip(0);
          }}
        />

        {isTemplates ? (
          <TemplateListSection />
        ) : (
          <>
            {error && (
              <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error.message}</div>
            )}
            <SectionCard
              title={t('contract.list.title')}
              description={`${totalCount} · page ${Math.floor(skip / take) + 1}`}
              padding="none"
              footer={
                <Pager
                  skip={skip}
                  take={take}
                  currentCount={data?.contracts.success?.data.length ?? 0}
                  onChange={({ skip: s, take: tk }) => { setSkip(s); setTake(tk); }}
                />
              }
            >
              {loading && !data ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={32} />)}
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  rows={rows}
                  rowKey={(row) => row.id}
                  emptyState={t('common.empty')}
                  compact
                  onRowClick={(row) => router.push(`/governance/contracts/${row.id}`)}
                />
              )}
            </SectionCard>
          </>
        )}
      </div>
    </ListPageTemplate>
  );
}
